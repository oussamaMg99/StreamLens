// src/core/mocks/insights.mock.ts
//
// Prototype data for the Insights page. Everything here is what the real aggregation
// (watch list + TMDB details) will eventually produce, in the same shape, so swapping
// the mock out only touches useInsightsSummary.
//
// Genre ids are real TMDB ids — the suggestion rows call /discover with them, so the
// posters you see while prototyping are real. Resume-show ids are real TMDB TV ids too.

import { InsightsSummary } from 'src/core/models/insights.model';

export const MOCK_INSIGHTS: InsightsSummary = {
  movies: 74,
  tvShows: 54,
  seasonsFinished: 31,
  hoursWatched: 214,
  topGenres: {
    movie: [
      { id: 18, name: 'Drama', count: 24 },
      { id: 53, name: 'Thriller', count: 17 },
      { id: 878, name: 'Science Fiction', count: 12 },
    ],
    tv: [
      { id: 18, name: 'Drama', count: 21 },
      { id: 80, name: 'Crime', count: 15 },
      { id: 10765, name: 'Sci-Fi & Fantasy', count: 13 },
    ],
  },
  resume: [
    { id: 95396, title: 'Severance', nextSeason: 2, nextEpisode: 5, watchedEpisodes: 13, totalEpisodes: 19 },
    { id: 136315, title: 'The Bear', nextSeason: 3, nextEpisode: 2, watchedEpisodes: 19, totalEpisodes: 28 },
    { id: 83867, title: 'Andor', nextSeason: 2, nextEpisode: 7, watchedEpisodes: 18, totalEpisodes: 24 },
    { id: 126308, title: 'Shōgun', nextSeason: 1, nextEpisode: 9, watchedEpisodes: 8, totalEpisodes: 10 },
  ],
};

export const EMPTY_INSIGHTS: InsightsSummary = {
  movies: 0,
  tvShows: 0,
  seasonsFinished: 0,
  hoursWatched: 0,
  topGenres: { movie: [], tv: [] },
  resume: [],
};

/** Flip to 'empty' to prototype the new-user state. */
export const INSIGHTS_MOCK_SCENARIO: 'full' | 'empty' = 'full';
