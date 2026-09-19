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

import { doc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from './firebase.config';
import { WatchList, WatchListEntry, WatchListMovieEntry, WatchListResponse, WatchListTvEntry } from '../models/watchList.model';

const WATCH_LISTS_COLLECTION = 'watchLists';

const watchListRef = (uid: string) => doc(db, WATCH_LISTS_COLLECTION, uid);

/**
 * Stable key for a single entry, used client-side for React keys and lookups. A movie
 * and a TV show can share the same numeric TMDB id, so media_type has to be part of it.
 */
export const watchListEntryId = (entry: Pick<WatchListEntry, 'media_type' | 'id'>): string => `${entry.media_type}_${entry.id}`;

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

/** Marks a movie watched or unwatched, adding it to the list if it isn't there yet. */
export const setMovieWatched = (uid: string, id: number, watched: boolean): Promise<void> =>
  updateEntries(uid, entries => {
    const existing = entries.find((entry): entry is WatchListMovieEntry => entry.media_type === 'movie' && entry.id === id);
    if (!existing) return [...entries, { media_type: 'movie', id, watched }];
    if (existing.watched === watched) return entries;
    return entries.map(entry => (entry === existing ? { ...existing, watched } : entry));
  });

/**
 * Marks one episode of a season watched or unwatched. A season key disappears once its
 * last episode is unwatched; the show itself stays on the list until removeEntry.
 */
export const setEpisodeWatched = (uid: string, tvId: number, season: number, episode: number, watched: boolean): Promise<void> =>
  updateEntries(uid, entries => {
    const existing = entries.find((entry): entry is WatchListTvEntry => entry.media_type === 'tv' && entry.id === tvId);
    // Nothing tracked for this show yet: watching creates it, unwatching is a no-op.
    if (!existing) return watched ? [...entries, { media_type: 'tv', id: tvId, watched: { [season]: [episode] } }] : entries;

    const episodes = existing.watched[season] ?? [];
    if (episodes.includes(episode) === watched) return entries;

    const nextEpisodes = watched ? [...episodes, episode].sort((a, b) => a - b) : episodes.filter(number => number !== episode);
    const nextWatched = { ...existing.watched };
    if (nextEpisodes.length) nextWatched[season] = nextEpisodes;
    else delete nextWatched[season];

    return entries.map(entry => (entry === existing ? { ...existing, watched: nextWatched } : entry));
  });

/** Drops a title from the list entirely, along with whatever progress it held. */
export const removeEntry = (uid: string, entry: Pick<WatchListEntry, 'media_type' | 'id'>): Promise<void> =>
  updateEntries(uid, entries => {
    const next = entries.filter(current => !(current.media_type === entry.media_type && current.id === entry.id));
    return next.length === entries.length ? entries : next;
  });
