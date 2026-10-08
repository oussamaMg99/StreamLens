// src/core/models/watchList.model.ts
// One record per movie/tv item the user has interacted with, stored in the user's
// watchLists/{uid} document. Discriminated by media_type, same convention as
// Media/MediaDetails (common.model.ts) — id/media_type here match Movie/TvShow's own
// fields exactly, so a WatchListEntry can be correlated against a Movie or TvShow object
// with no renaming.
//
// Besides progress, each entry carries a little TMDB metadata captured at write time
// (genre_ids, runtime / episode_counts, minutes_watched, updated_at), so Insights can be
// computed from the document alone instead of fetching every title's details. Only
// language-neutral values are stored — ids and numbers, never names or titles — so a
// language switch never shows text frozen in the language it was saved in.
// The metadata fields are optional: entries saved before they existed lack them until
// useWatchListBackfill fills them in.

/** Metadata shared by both entry kinds. */
interface WatchListEntryMeta {
  /** TMDB genre ids of the title (movie and TV ids are separate lists). */
  genre_ids?: number[];
  /** Epoch ms of the last change to this entry — "Pick up where you left off" order. */
  updated_at?: number;
}

export interface WatchListMovieEntry extends WatchListEntryMeta {
  media_type: 'movie';
  id: number;
  watched: boolean;
  /** Runtime in minutes. */
  runtime?: number;
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
}

export type WatchListEntry = WatchListMovieEntry | WatchListTvEntry;

/** What a write captures from the title's TMDB details (see entryMetaFromDetails). */
export type EntryMeta = Pick<WatchListMovieEntry, 'genre_ids' | 'runtime'> & Pick<WatchListTvEntry, 'episode_counts'>;

export interface WatchList {
  uid: string;
  watch_list: WatchListEntry[];
}

/** Shape of the watch-list read. */
export type WatchListResponse = WatchList;
