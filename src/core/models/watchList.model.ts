// src/core/models/watchList.model.ts
// Shape for the future watch-list API: one record per movie/tv item the user has
// interacted with. Discriminated by media_type, same convention as Media/MediaDetails
// (common.model.ts) — id/media_type here match Movie/TvShow's own fields exactly, so a
// WatchListEntry can be correlated against a Movie or TvShow object with no renaming.

export interface WatchListMovieEntry {
  media_type: 'movie';
  id: number;
  watched: boolean;
}

export interface WatchListTvEntry {
  media_type: 'tv';
  id: number;
  // season_number -> the episode_numbers marked watched within that season. A season's
  // own total episode count (Season.episode_count / SeasonDetails.episodes.length,
  // already modeled elsewhere) is what "season complete" should be derived against,
  // rather than storing a redundant per-season watched flag here.
  watched: Record<number, number[]>;
}

export type WatchListEntry = WatchListMovieEntry | WatchListTvEntry;

export interface WatchList {
  uid: string;
  watch_list: WatchListEntry[];
}

/** Shape of the future watch-list API response. */
export type WatchListResponse = WatchList;
