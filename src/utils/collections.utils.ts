// Pure "Finish the collection" logic: which film series the user has started but not
// finished, from their watch list and the series' parts. Kept free of Firebase and React
// so it's unit-tested directly — see collections.utils.test.ts.

import { Collection } from 'src/core/models/collection.model';
import { WatchListEntry } from 'src/core/models/watchList.model';
import type { Movie } from 'src/core/services/movie.service';

/** Cards shown at most, like "Pick up where you left off". */
const MAX_COLLECTIONS = 4;

export interface UnfinishedCollection {
  collection: Collection;
  /** Released parts the user has watched. */
  watched: number;
  /** Released parts in the series; unreleased ones don't count against the user. */
  total: number;
  /** The earliest-released part not watched yet. */
  next: Movie;
}

/** Distinct, non-zero collection ids of the watched movies: the series worth fetching. */
export const watchedCollectionIds = (entries: WatchListEntry[]): number[] => [
  ...new Set(entries.flatMap(entry => (entry.media_type === 'movie' && entry.watched && entry.collection_id ? [entry.collection_id] : []))),
];

/**
 * Series the user has started (at least one released part watched) but not finished (at
 * least one released part left), with their progress and next part. A series needs two
 * released parts to count. Parts without a release date, or released after `today`
 * (local YYYY-MM-DD; ISO dates compare as strings), are ignored.
 *
 * Ordered by how close to done (watched ÷ total), then by more parts watched, capped at
 * MAX_COLLECTIONS.
 */
export const unfinishedCollections = (entries: WatchListEntry[], collections: Collection[], today: string): UnfinishedCollection[] => {
  const watchedMovieIds = new Set(entries.flatMap(entry => (entry.media_type === 'movie' && entry.watched ? [entry.id] : [])));

  return collections
    .flatMap((collection): UnfinishedCollection[] => {
      const released = collection.parts
        .filter(part => part.release_date && part.release_date <= today)
        .sort((a, b) => a.release_date.localeCompare(b.release_date));
      const watched = released.filter(part => watchedMovieIds.has(part.id)).length;
      const next = released.find(part => !watchedMovieIds.has(part.id));
      if (released.length < 2 || watched === 0 || !next) return [];
      return [{ collection, watched, total: released.length, next }];
    })
    .sort((a, b) => b.watched / b.total - a.watched / a.total || b.watched - a.watched)
    .slice(0, MAX_COLLECTIONS);
};
