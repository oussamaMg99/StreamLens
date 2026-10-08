// src/core/services/watchList.service.ts
//
// Firestore-backed watch list. Unlike movie/tv.service.ts these aren't ApiService
// subclasses — ApiService wraps axios for REST, which doesn't apply to the Firestore
// SDK, so this is a plain module of functions instead.
//
// Layout: one document per user, watchLists/{uid}, holding the whole watch_list array
// (the WatchList model, stored as-is). The document is absent until the user's first
// entry, which reads as an empty list rather than an error — nothing seeds it at
// sign-up, since the first write creates it under that same watchLists/{uid} id.
//
// Consequence: every write rewrites the whole array, so writes must go through
// runTransaction — otherwise a second tab (or another device) editing at the same time
// silently overwrites the first one's changes. The 1MB document ceiling is thousands of
// entries away, so size isn't a concern.
//
// Writes also store the title's metadata (EntryMeta: genre_ids, runtime /
// episode_counts) and stamp updated_at, so Insights reads everything from this document.
// The array logic itself lives in src/utils/watchListMeta.utils.ts, where it's tested.

import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from './firebase.config';
import { EntryMeta, WatchList, WatchListEntry, WatchListResponse } from '../models/watchList.model';
import {
  BackfillPatch,
  EpisodeRuntime,
  applyAdd,
  applyBackfill,
  applyEpisodeToggle,
  applyEpisodesWatched,
  applyMovieWatched,
} from 'src/utils/watchListMeta.utils';

// Re-exported so existing callers keep importing it from the service.
export { watchListEntryId } from 'src/utils/watchListMeta.utils';

const WATCH_LISTS_COLLECTION = 'watchLists';

/**
 * Root of every user-scoped watch-list query key: ['watch-list', uid]. It lives here
 * rather than in the hook so AppContext can invalidate on sign-out without importing a
 * hook that imports AppContext back.
 */
export const WATCH_LIST_QUERY_ROOT = 'watch-list';

const watchListRef = (uid: string) => doc(db, WATCH_LISTS_COLLECTION, uid);

export const getWatchList = async (uid: string): Promise<WatchListResponse> => {
  const snapshot = await getDoc(watchListRef(uid));
  // No document yet just means the user hasn't tracked anything.
  return snapshot.exists() ? (snapshot.data() as WatchList) : { uid, watch_list: [] };
};

/**
 * Every write is read-modify-write on the one document, so it runs in a transaction:
 * Firestore re-runs `update` if the document changed in between, which is what stops a
 * second tab's edit from being overwritten. The first write creates the document under
 * the same watchLists/{uid} id.
 *
 * `update` must be pure (it can run more than once) and should return the array it was
 * given when nothing changed — that skips the write entirely.
 */
const updateEntries = async (uid: string, update: (entries: WatchListEntry[]) => WatchListEntry[]): Promise<void> => {
  await runTransaction(db, async transaction => {
    const ref = watchListRef(uid);
    const snapshot = await transaction.get(ref);
    const current = snapshot.exists() ? (snapshot.data() as WatchList).watch_list : [];
    const next = update(current);
    if (next === current) return;
    transaction.set(ref, { uid, watch_list: next });
  });
};

/**
 * Puts a title on the list with no progress yet ("want to watch"); no-op if it's already
 * there. The per-episode/per-movie setters can't express this: they'd have to mark
 * something watched to create the entry.
 */
export const addToWatchList = (uid: string, entry: Pick<WatchListEntry, 'media_type' | 'id'>, meta?: EntryMeta): Promise<void> => {
  // Read once outside the transaction body, which may run more than once.
  const now = Date.now();
  return updateEntries(uid, entries => applyAdd(entries, entry, meta, now));
};

/** Marks a movie watched or unwatched, adding it to the list if it isn't there yet. */
export const setMovieWatched = (uid: string, id: number, watched: boolean, meta?: EntryMeta): Promise<void> => {
  const now = Date.now();
  return updateEntries(uid, entries => applyMovieWatched(entries, id, watched, meta, now));
};

/**
 * Marks one episode of a season watched or unwatched; `runtime` (minutes) keeps the
 * show's minutes_watched in step. A season key disappears once its last episode is
 * unwatched; the show itself stays on the list until removeEntry.
 */
export const setEpisodeWatched = (
  uid: string,
  toggle: { tvId: number; season: number; episode: number; watched: boolean; runtime: number; meta?: EntryMeta },
): Promise<void> => {
  const now = Date.now();
  return updateEntries(uid, entries => applyEpisodeToggle(entries, toggle, now));
};

/**
 * Marks several episodes of one season watched or unwatched in a single transaction
 * ("mark all episodes"), with each episode's runtime keeping minutes_watched in step.
 */
export const setEpisodesWatched = (
  uid: string,
  change: { tvId: number; season: number; episodes: EpisodeRuntime[]; watched: boolean; meta?: EntryMeta },
): Promise<void> => {
  const now = Date.now();
  return updateEntries(uid, entries => applyEpisodesWatched(entries, change, now));
};

/** Drops a title from the list entirely, along with whatever progress it held. */
export const removeEntry = (uid: string, entry: Pick<WatchListEntry, 'media_type' | 'id'>): Promise<void> =>
  updateEntries(uid, entries => {
    const next = entries.filter(current => !(current.media_type === entry.media_type && current.id === entry.id));
    return next.length === entries.length ? entries : next;
  });

/**
 * One-time migration: fills the metadata of entries saved before it existed, keyed by
 * watchListEntryId. Only missing fields are written (see applyBackfill), so it's safe to
 * run twice or alongside another tab.
 */
export const backfillEntryMeta = (uid: string, patches: Record<string, BackfillPatch>): Promise<void> =>
  updateEntries(uid, entries => applyBackfill(entries, patches));
