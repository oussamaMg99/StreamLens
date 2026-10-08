import { describe, expect, it } from 'vitest';
import { EMPTY_INSIGHTS } from 'src/core/models/insights.model';
import { WatchListMovieEntry, WatchListTvEntry } from 'src/core/models/watchList.model';
import { GenreNameLookup, buildInsightsSummary } from './insights.utils';

const GENRES: Record<number, string> = { 18: 'Drama', 27: 'Horror', 28: 'Action', 35: 'Comedy', 53: 'Thriller' };
const genreName: GenreNameLookup = (_type, id) => GENRES[id];

const movie = (id: number, overrides: Partial<WatchListMovieEntry> = {}): WatchListMovieEntry => ({
  media_type: 'movie',
  id,
  watched: true,
  ...overrides,
});

const show = (id: number, watched: Record<number, number[]>, overrides: Partial<WatchListTvEntry> = {}): WatchListTvEntry => ({
  media_type: 'tv',
  id,
  watched,
  ...overrides,
});

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

describe('buildInsightsSummary', () => {
  it('returns the empty summary for an empty list', () => {
    expect(buildInsightsSummary([], genreName)).toEqual(EMPTY_INSIGHTS);
  });

  it('ignores saved-but-unwatched titles', () => {
    const entries = [movie(1, { watched: false, runtime: 120 }), show(2, {}), show(3, { 1: [] }, { minutes_watched: 0 })];
    expect(buildInsightsSummary(entries, genreName)).toEqual(EMPTY_INSIGHTS);
  });

  it('adds movie runtimes and TV minutes_watched into rounded hours', () => {
    const entries = [movie(1, { runtime: 100 }), movie(2, { runtime: 110 }), show(3, { 1: [1, 2] }, { minutes_watched: 50 })];
    const summary = buildInsightsSummary(entries, genreName);
    expect(summary.movies).toBe(2);
    expect(summary.tvShows).toBe(1);
    expect(summary.hoursWatched).toBe(4); // 260 min → 4.33 h
  });

  it('counts finished seasons from the stored episode counts and ignores season 0', () => {
    const entries = [show(1, { 0: [1, 2], 1: range(1, 8), 2: [1, 2] }, { episode_counts: { 1: 8, 2: 10 } })];
    const summary = buildInsightsSummary(entries, genreName);
    expect(summary.tvShows).toBe(1);
    expect(summary.seasonsFinished).toBe(1);
  });

  it('a show with only specials watched does not count', () => {
    expect(buildInsightsSummary([show(1, { 0: [1] })], genreName).tvShows).toBe(0);
  });

  it('keeps the top 3 genres per type, ties broken by name, movie and TV separate', () => {
    const entries = [movie(1, { genre_ids: [28, 35, 18, 27] }), movie(2, { genre_ids: [27] }), show(3, { 1: [1] }, { genre_ids: [18] })];
    const summary = buildInsightsSummary(entries, genreName);
    expect(summary.topGenres.movie.map(genre => genre.name)).toEqual(['Horror', 'Action', 'Comedy']);
    expect(summary.topGenres.tv).toEqual([{ id: 18, name: 'Drama', count: 1 }]);
  });

  it('names genres through the lookup and skips ids it cannot name', () => {
    const summary = buildInsightsSummary([movie(1, { genre_ids: [18, 999] })], (_type, id) => (id === 18 ? 'Drame' : undefined));
    expect(summary.topGenres.movie).toEqual([{ id: 18, name: 'Drame', count: 1 }]);
  });

  it('points resume at the next unwatched episode, moving to the next season when one is done', () => {
    const entries = [show(1, { 1: range(1, 8), 2: [1, 2, 4] }, { episode_counts: { 1: 8, 2: 10 } })];
    const [card] = buildInsightsSummary(entries, genreName).resume;
    expect(card).toEqual({ id: 1, nextSeason: 2, nextEpisode: 3, watchedEpisodes: 11, totalEpisodes: 18 });
  });

  it('orders resume by most recent activity, leaves finished shows out, keeps at most 4', () => {
    const counts = { episode_counts: { 1: 10 } };
    const entries = [
      show(1, { 1: range(1, 10) }, { ...counts, updated_at: 900 }), // finished
      show(2, { 1: [1] }, { ...counts, updated_at: 100 }),
      show(3, { 1: [1] }, { ...counts, updated_at: 500 }),
      show(4, { 1: [1] }, { ...counts, updated_at: 300 }),
      show(5, { 1: [1] }, { ...counts, updated_at: 400 }),
      show(6, { 1: [1] }, { ...counts, updated_at: 200 }),
    ];
    expect(buildInsightsSummary(entries, genreName).resume.map(card => card.id)).toEqual([3, 5, 4, 6]);
  });

  it('still counts watched entries that lack metadata, adding only what they have', () => {
    const entries = [movie(1), show(2, { 1: [1, 2] })];
    expect(buildInsightsSummary(entries, genreName)).toEqual({ ...EMPTY_INSIGHTS, movies: 1, tvShows: 1 });
  });
});
