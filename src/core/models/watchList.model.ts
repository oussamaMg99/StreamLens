// src/core/models/watchList.model.ts
// One record per movie/tv item the user has interacted with, stored in the user's
// watchLists/{uid} document. Discriminated by media_type, same convention as
// Media/MediaDetails (common.model.ts) — id/media_type here match Movie/TvShow's own
// fields exactly, so a WatchListEntry can be correlated against a Movie or TvShow object
// with no renaming.
//
// Besides progress, each entry carries a little TMDB metadata captured at write time
// (genre_ids, release_year, runtime / collection_id / episode_counts, minutes_watched,
// updated_at, watched_at), so
// Insights can be computed from the document alone instead of fetching every title's
// details. Only language-neutral values are stored — ids and numbers, never names or
// titles — so a language switch never shows text frozen in the language it was saved in.
// The metadata fields are optional: runtime is only stored when TMDB has one, and an
// unwatched entry may have no updated_at.

/** Metadata shared by both entry kinds. */
interface WatchListEntryMeta {
  /** TMDB genre ids of the title (movie and TV ids are separate lists). */
  genre_ids?: number[];
  /** Epoch ms of the last change to this entry — "Pick up where you left off" order. */
  updated_at?: number;
  /**
   * Year of release (movie) or first air date (TV). 0 = TMDB has no date. Nothing reads it
   * since "Decades you watch" was removed; kept so a future feature (filters, a timeline)
   * doesn't need another migration.
   */
  release_year?: number;
}

export interface WatchListMovieEntry extends WatchListEntryMeta {
  media_type: 'movie';
  id: number;
  watched: boolean;
  /** Runtime in minutes. */
  runtime?: number;
  /** TMDB collection (film series) id, for "Finish the collection". 0 = not part of one. */
  collection_id?: number;
  /**
   * Epoch ms (device clock) of when it was marked watched, for "Watching rhythm". Present
   * only while watched; unmarking deletes it. Absent on marks made before it existed.
   */
  watched_at?: number;
}

export interface WatchListTvEntry extends WatchListEntryMeta {
  media_type: 'tv';
  id: number;
  // season_number -> the episode_numbers marked watched within that season.
  watched: Record<number, number[]>;
  /** season_number (≥ 1) -> that season's episode count, refreshed on every write. */
  episode_counts?: Record<number, number>;
  /** Σ runtime (minutes) of the watched episodes, kept in step with each toggle. */
  minutes_watched?: number;
  /**
   * "season:episode" (episodeKey) -> epoch ms (device clock) of when that episode was
   * marked watched, for "Watching rhythm". A key is deleted when its episode is unmarked,
   * and the whole field once empty. Episodes marked before it existed have no key.
   */
  watched_at?: Record<string, number>;
}

export type WatchListEntry = WatchListMovieEntry | WatchListTvEntry;

/** What a write captures from the title's TMDB details (see entryMetaFromDetails). */
export type EntryMeta = Pick<WatchListMovieEntry, 'genre_ids' | 'runtime' | 'release_year' | 'collection_id'> &
  Pick<WatchListTvEntry, 'episode_counts'>;

export interface WatchList {
  uid: string;
  watch_list: WatchListEntry[];
}

/** Shape of the watch-list read. */
export type WatchListResponse = WatchList;
