// Pure watch-list logic: the metadata a write captures from TMDB details, and the
// array updates the Firestore transactions in watchList.service.ts apply. Kept free of
// Firebase imports (firebase.config.ts initializes at module scope) so it's unit-tested
// directly — see watchListMeta.utils.test.ts.
//
// Firestore rejects `undefined` field values, so every helper here builds objects that
// simply omit a field rather than set it to undefined.

import { MovieDetails } from 'src/core/models/movie.model';
import { TVShowDetails } from 'src/core/models/tvShow.model';
import { Episode } from 'src/core/models/seasonDetails.model';
import { EntryMeta, WatchListEntry, WatchListMovieEntry, WatchListTvEntry } from 'src/core/models/watchList.model';

type EntryRef = Pick<WatchListEntry, 'media_type' | 'id'>;

/**
 * Stable key for a single entry, used client-side for React keys and lookups. A movie
 * and a TV show can share the same numeric TMDB id, so media_type has to be part of it.
 */
export const watchListEntryId = (entry: EntryRef): string => `${entry.media_type}_${entry.id}`;

/** Year from a TMDB date ('1994-09-23' → 1994); 0 when the date is missing or malformed. */
export const releaseYear = (date: string | undefined): number => {
  const year = Number(date?.slice(0, 4));
  return Number.isInteger(year) && year > 1800 ? year : 0;
};

/** What a write stores from the title's details: language-neutral ids and numbers only. */
export const entryMetaFromDetails = (details: MovieDetails | TVShowDetails): EntryMeta => {
  const meta: EntryMeta = {
    genre_ids: (details.genres ?? []).map(genre => genre.id),
    // 0 means TMDB has no date; Insights' decade count skips it.
    release_year: releaseYear(details.media_type === 'movie' ? details.release_date : details.first_air_date),
  };
  if (details.media_type === 'movie') {
    if (typeof details.runtime === 'number') meta.runtime = details.runtime;
    // 0 means "not part of a series", as opposed to absent (entry not written since the field existed).
    meta.collection_id = details.belongs_to_collection?.id ?? 0;
  } else {
    meta.episode_counts = Object.fromEntries(
      (details.seasons ?? [])
        .filter(season => season.season_number > 0 && season.episode_count > 0)
        .map(season => [season.season_number, season.episode_count]),
    );
  }
  return meta;
};

/** The meta fields that apply to a movie entry, omitting absent ones. */
const movieMeta = (meta?: EntryMeta): Partial<WatchListMovieEntry> => ({
  ...(meta?.genre_ids && { genre_ids: meta.genre_ids }),
  ...(meta?.release_year !== undefined && { release_year: meta.release_year }),
  ...(meta?.runtime !== undefined && { runtime: meta.runtime }),
  ...(meta?.collection_id !== undefined && { collection_id: meta.collection_id }),
});

/** The meta fields that apply to a TV entry, omitting absent ones. */
const tvMeta = (meta?: EntryMeta): Partial<WatchListTvEntry> => ({
  ...(meta?.genre_ids && { genre_ids: meta.genre_ids }),
  ...(meta?.release_year !== undefined && { release_year: meta.release_year }),
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
  // watched_at is the moment it was marked; it's dropped when unmarked (never left stale).
  const watchedAt = watched ? { watched_at: now } : {};
  if (!existing) return [...entries, { media_type: 'movie', id, watched, ...movieMeta(meta), ...watchedAt, updated_at: now }];
  if (existing.watched === watched) return entries;
  const { watched_at: _previous, ...rest } = existing;
  return entries.map(entry => (entry === existing ? { ...rest, ...movieMeta(meta), watched, ...watchedAt, updated_at: now } : entry));
};

/** Key of one episode in a TV entry's watched_at map: "season:episode", e.g. "1:3". */
export const episodeKey = (season: number, episode: number) => `${season}:${episode}`;

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
 * watched_at gets a `now` key for each episode that becomes watched and loses the key of
 * each one unmarked; episodes already in the target state keep their date. An empty map
 * is removed rather than stored as {}.
 *
 * An entry without minutes_watched is left without one: adding only these runtimes would
 * undercount the episodes watched before it. (Every stored entry has it since the
 * metadata migration; the guard keeps the field honest if one ever doesn't.)
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
        watched_at: Object.fromEntries(numbers.map(episode => [episodeKey(season, episode), now])),
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

  const nextWatchedAt = { ...existing.watched_at };
  for (const number of changedNumbers) {
    if (watched) nextWatchedAt[episodeKey(season, number)] = now;
    else delete nextWatchedAt[episodeKey(season, number)];
  }

  const delta = sumRuntime(changed);
  const { watched_at: _previous, ...rest } = existing;
  const next: WatchListTvEntry = { ...rest, ...tvMeta(meta), watched: nextWatched, updated_at: now };
  if (Object.keys(nextWatchedAt).length) next.watched_at = nextWatchedAt;
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
