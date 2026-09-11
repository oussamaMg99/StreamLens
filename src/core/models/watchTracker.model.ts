// src/core/models/watchTracker.model.ts
// Shape for the future watch-tracker API: one record per movie/tv item the user has
// interacted with. Discriminated by media_type, same convention as Media/MediaDetails
// (common.model.ts) — id/media_type here match Movie/TvShow's own fields exactly, so a
// WatchEntry can be correlated against a Movie or TvShow object with no field-renaming.

export interface WatchedMovieEntry {
  media_type: 'movie';
  id: number;
  watched: boolean;
}

export interface WatchedTvEntry {
  media_type: 'tv';
  id: number;
  // season_number -> the episode_numbers marked watched within that season. A season's
  // own total episode count (Season.episode_count / SeasonDetails.episodes.length,
  // already modeled elsewhere) is what "season complete" should be derived against,
  // rather than storing a redundant per-season watched flag here.
  watched: Record<number, number[]>;
}

export type WatchEntry = WatchedMovieEntry | WatchedTvEntry;

/** Shape of the future watch-tracker API response. */
export type WatchTrackerResponse = WatchEntry[];
