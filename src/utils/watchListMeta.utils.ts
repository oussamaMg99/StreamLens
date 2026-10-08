// Pure watch-list logic: the metadata a write captures from TMDB details, and the
// array updates the Firestore transactions in watchList.service.ts apply. Kept free of
// Firebase imports (firebase.config.ts initializes at module scope) so it's unit-tested
// directly — see watchListMeta.utils.test.ts.
//
// Firestore rejects `undefined` field values, so every helper here builds objects that
// simply omit a field rather than set it to undefined.

import { MovieDetails } from 'src/core/models/movieDetails.model';
import { TVShowDetails } from 'src/core/models/tvShowDetails.model';
import { Episode } from 'src/core/models/seasonDetails.model';
import { EntryMeta, WatchListEntry, WatchListMovieEntry, WatchListTvEntry } from 'src/core/models/watchList.model';

type EntryRef = Pick<WatchListEntry, 'media_type' | 'id'>;

/**
 * Stable key for a single entry, used client-side for React keys and lookups. A movie
 * and a TV show can share the same numeric TMDB id, so media_type has to be part of it.
 */
export const watchListEntryId = (entry: EntryRef): string => `${entry.media_type}_${entry.id}`;

/** Movie: marked watched. TV: at least one episode marked watched. */
export const isEntryWatched = (entry: WatchListEntry): boolean =>
  entry.media_type === 'movie' ? entry.watched : Object.values(entry.watched).some(episodes => episodes.length > 0);

/** What a write stores from the title's details: language-neutral ids and numbers only. */
export const entryMetaFromDetails = (details: MovieDetails | TVShowDetails): EntryMeta => {
  const meta: EntryMeta = { genre_ids: (details.genres ?? []).map(genre => genre.id) };
  if (details.media_type === 'movie') {
    if (typeof details.runtime === 'number') meta.runtime = details.runtime;
  } else {
    meta.episode_counts = Object.fromEntries(
      (details.seasons ?? [])
        .filter(season => season.season_number > 0 && season.episode_count > 0)
        .map(season => [season.season_number, season.episode_count]),
    );
  }
  return meta;
};

/** A watched entry saved before the metadata fields existed. */
export const needsBackfill = (entry: WatchListEntry): boolean => {
  if (!isEntryWatched(entry)) return false;
  if (!entry.genre_ids) return true;
  return entry.media_type === 'movie'
    ? entry.runtime === undefined
    : entry.episode_counts === undefined || entry.minutes_watched === undefined;
};

/** The meta fields that apply to a movie entry, omitting absent ones. */
const movieMeta = (meta?: EntryMeta): Partial<WatchListMovieEntry> => ({
  ...(meta?.genre_ids && { genre_ids: meta.genre_ids }),
  ...(meta?.runtime !== undefined && { runtime: meta.runtime }),
});

/** The meta fields that apply to a TV entry, omitting absent ones. */
const tvMeta = (meta?: EntryMeta): Partial<WatchListTvEntry> => ({
  ...(meta?.genre_ids && { genre_ids: meta.genre_ids }),
  ...(meta?.episode_counts && { episode_counts: meta.episode_counts }),
});

const sameRef = (entry: WatchListEntry, ref: EntryRef) => entry.media_type === ref.media_type && entry.id === ref.id;

// The apply* functions below are the bodies of the watch-list transactions. Like the
// transaction update they run in, they must be pure, and return the array they were
// given when nothing changes (that skips the write).

/** Adds a title with no progress yet ("want to watch"); no-op if it's already there. */
export const applyAdd = (entries: WatchListEntry[], ref: EntryRef, meta: EntryMeta | undefined, now: number): WatchListEntry[] => {
  if (entries.some(entry => sameRef(entry, ref))) return entries;
  const created: WatchListEntry =
    ref.media_type === 'movie'
      ? { media_type: 'movie', id: ref.id, watched: false, ...movieMeta(meta), updated_at: now }
      : { media_type: 'tv', id: ref.id, watched: {}, ...tvMeta(meta), minutes_watched: 0, updated_at: now };
  return [...entries, created];
};

/** Marks a movie watched or unwatched, adding it to the list if it isn't there yet. */
export const applyMovieWatched = (
  entries: WatchListEntry[],
  id: number,
  watched: boolean,
  meta: EntryMeta | undefined,
  now: number,
): WatchListEntry[] => {
  const existing = entries.find((entry): entry is WatchListMovieEntry => entry.media_type === 'movie' && entry.id === id);
  if (!existing) return [...entries, { media_type: 'movie', id, watched, ...movieMeta(meta), updated_at: now }];
  if (existing.watched === watched) return entries;
  return entries.map(entry => (entry === existing ? { ...existing, ...movieMeta(meta), watched, updated_at: now } : entry));
};

/** An episode and its runtime in minutes (0 when TMDB doesn't know it). */
export interface EpisodeRuntime {
  episode: number;
  runtime: number;
}

/**
 * Marks several episodes of one season watched or unwatched in one go, and keeps
 * minutes_watched in step (± the runtimes of the episodes that actually changed, back to
 * 0 once nothing is watched). A season key disappears once its last episode is
 * unwatched; the show stays on the list until removeEntry.
 *
 * A legacy entry (no minutes_watched yet) is left without one: adding these runtimes
 * would undercount the episodes watched before, so the backfill estimates the whole
 * total instead.
 */
export const applyEpisodesWatched = (
  entries: WatchListEntry[],
  change: { tvId: number; season: number; episodes: EpisodeRuntime[]; watched: boolean; meta?: EntryMeta },
  now: number,
): WatchListEntry[] => {
  const { tvId, season, episodes, watched, meta } = change;
  const sumRuntime = (list: EpisodeRuntime[]) => list.reduce((sum, item) => sum + item.runtime, 0);
  const existing = entries.find((entry): entry is WatchListTvEntry => entry.media_type === 'tv' && entry.id === tvId);
  // Nothing tracked for this show yet: watching creates it, unwatching is a no-op.
  if (!existing) {
    if (!watched || !episodes.length) return entries;
    const numbers = [...new Set(episodes.map(item => item.episode))].sort((a, b) => a - b);
    return [
      ...entries,
      {
        media_type: 'tv',
        id: tvId,
        watched: { [season]: numbers },
        ...tvMeta(meta),
        minutes_watched: sumRuntime(episodes),
        updated_at: now,
      },
    ];
  }

  const current = existing.watched[season] ?? [];
  // Only the episodes whose state actually flips count towards the change and its minutes.
  const changed = episodes.filter(
    (item, index) => current.includes(item.episode) !== watched && episodes.findIndex(other => other.episode === item.episode) === index,
  );
  if (!changed.length) return entries;

  const changedNumbers = changed.map(item => item.episode);
  const nextEpisodes = watched
    ? [...current, ...changedNumbers].sort((a, b) => a - b)
    : current.filter(number => !changedNumbers.includes(number));
  const nextWatched = { ...existing.watched };
  if (nextEpisodes.length) nextWatched[season] = nextEpisodes;
  else delete nextWatched[season];

  const delta = sumRuntime(changed);
  const next: WatchListTvEntry = { ...existing, ...tvMeta(meta), watched: nextWatched, updated_at: now };
  if (!Object.keys(nextWatched).length) next.minutes_watched = 0;
  else if (existing.minutes_watched !== undefined)
    next.minutes_watched = Math.max(0, existing.minutes_watched + (watched ? delta : -delta));

  return entries.map(entry => (entry === existing ? next : entry));
};

/** Marks one episode watched or unwatched — applyEpisodesWatched for a single episode. */
export const applyEpisodeToggle = (
  entries: WatchListEntry[],
  toggle: { tvId: number; season: number; episode: number; watched: boolean; runtime: number; meta?: EntryMeta },
  now: number,
): WatchListEntry[] => {
  const { episode, runtime, ...rest } = toggle;
  return applyEpisodesWatched(entries, { ...rest, episodes: [{ episode, runtime }] }, now);
};

/**
 * Whether an episode has aired by `today` (local YYYY-MM-DD; ISO dates compare as
 * strings). An episode with no air date counts as aired, like the checkboxes treat it.
 */
export const isEpisodeAired = (episode: Pick<Episode, 'air_date'>, today: string): boolean =>
  !episode.air_date || episode.air_date <= today;

/**
 * Typical episode length in minutes. TMDB often returns an empty episode_run_time, so
 * fall back to the latest aired episode's runtime, then to 0 (adds no minutes).
 */
export const episodeRuntime = (show: TVShowDetails): number => {
  const runTimes = (show.episode_run_time ?? []).filter((value): value is number => typeof value === 'number' && value > 0);
  if (runTimes.length) return runTimes.reduce((sum, value) => sum + value, 0) / runTimes.length;
  return show.last_episode_to_air?.runtime ?? 0;
};

/**
 * minutes_watched for a legacy show: its watched regular-season episodes × the typical
 * episode length. An estimate — old entries never recorded each episode's runtime — that
 * later toggles keep adjusting with exact values.
 */
export const estimateMinutesWatched = (entry: WatchListTvEntry, show: TVShowDetails): number => {
  const episodes = Object.entries(entry.watched)
    .filter(([season]) => Number(season) > 0)
    .reduce((sum, [, watched]) => sum + watched.length, 0);
  return Math.round(episodes * episodeRuntime(show));
};

/** Backfill patch for one legacy entry: its metadata, plus the minutes estimate for a show. */
export const backfillPatchFromDetails = (entry: WatchListEntry, details: MovieDetails | TVShowDetails): BackfillPatch => {
  const patch: BackfillPatch = entryMetaFromDetails(details);
  if (entry.media_type === 'tv' && details.media_type === 'tv') patch.minutes_watched = estimateMinutesWatched(entry, details);
  return patch;
};

/** Patch for one legacy entry, keyed by watchListEntryId in applyBackfill. */
export type BackfillPatch = EntryMeta & { minutes_watched?: number };

/**
 * Fills metadata on entries saved before it existed. Only fields that are still missing
 * are set, so running it twice, or after another tab already wrote them, changes nothing.
 * updated_at is left alone: a migration isn't activity.
 */
export const applyBackfill = (entries: WatchListEntry[], patches: Record<string, BackfillPatch>): WatchListEntry[] => {
  let changed = false;
  const next = entries.map(entry => {
    const patch = patches[watchListEntryId(entry)];
    if (!patch) return entry;
    const filled: WatchListEntry = { ...entry };
    if (filled.genre_ids === undefined && patch.genre_ids) filled.genre_ids = patch.genre_ids;
    if (filled.media_type === 'movie') {
      if (filled.runtime === undefined && patch.runtime !== undefined) filled.runtime = patch.runtime;
    } else {
      if (filled.episode_counts === undefined && patch.episode_counts) filled.episode_counts = patch.episode_counts;
      if (filled.minutes_watched === undefined && patch.minutes_watched !== undefined) filled.minutes_watched = patch.minutes_watched;
    }
    const entryChanged = Object.keys(filled).length !== Object.keys(entry).length;
    changed ||= entryChanged;
    return entryChanged ? filled : entry;
  });
  return changed ? next : entries;
};
