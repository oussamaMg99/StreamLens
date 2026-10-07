// src/core/models/insights.model.ts
// Aggregated shapes the Insights page renders. Produced by useInsightsSummary from the
// watch list + TMDB details (mock-backed for now, see src/core/mocks/insights.mock.ts).

export interface InsightGenre {
  /** TMDB genre id. Movie and TV genre ids differ, so they're never mixed. */
  id: number;
  name: string;
  /** Watched titles of this type carrying the genre. */
  count: number;
}

export interface ResumeShow {
  id: number;
  title: string;
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
  /** Seasons whose watched episodes equal Season.episode_count. */
  seasonsFinished: number;
  /** Movie runtimes + watched episode runtimes, in hours. */
  hoursWatched: number;
  topGenres: { movie: InsightGenre[]; tv: InsightGenre[] };
  resume: ResumeShow[];
}
