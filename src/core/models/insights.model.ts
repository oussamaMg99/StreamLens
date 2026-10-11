// src/core/models/insights.model.ts
// Aggregated shapes the Insights page renders. Produced by useInsightsSummary from the
// watch list (its entries carry the needed TMDB metadata) and the localized genre
// lists, via buildInsightsSummary (src/utils/insights.utils.ts).

export interface InsightGenre {
  /** TMDB genre id. Movie and TV genre ids differ, so they're never mixed. */
  id: number;
  name: string;
  /** Watched titles of this type carrying the genre. */
  count: number;
}

/** A started, unfinished show. No title: the card shows the localized one from TMDB. */
export interface ResumeShow {
  id: number;
  nextSeason: number;
  nextEpisode: number;
  watchedEpisodes: number;
  totalEpisodes: number;
}

export interface InsightsSummary {
  /** Movies with watched === true. */
  movies: number;
  /** TV entries with at least one watched episode — a show counts once, like a movie. */
  tvShows: number;
  /** Seasons whose watched episodes reach the stored episode count. */
  seasonsFinished: number;
  /** Movie runtimes + TV minutes_watched, in hours. */
  hoursWatched: number;
  topGenres: { movie: InsightGenre[]; tv: InsightGenre[] };
  resume: ResumeShow[];
}

/** Nothing watched yet, or the watch list isn't readable (signed out / unverified). */
export const EMPTY_INSIGHTS: InsightsSummary = {
  movies: 0,
  tvShows: 0,
  seasonsFinished: 0,
  hoursWatched: 0,
  topGenres: { movie: [], tv: [] },
  resume: [],
};
