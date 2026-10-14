import { describe, expect, it } from 'vitest';
import { WatchListEntry } from 'src/core/models/watchList.model';
import { BoardItem, DEFAULT_BOARD_FILTERS } from 'src/core/models/watchListBoard.model';
import { buildBoardItems, filterCounts, matchesFilters, nextFilters, sortItems, tvProgress, visibleColumns } from './watchListBoard.utils';

const names: Record<number, string> = { 18: 'Drama', 35: 'Comedy', 878: 'Science Fiction' };
const genreName = (_: 'movie' | 'tv', id: number) => names[id];

const entries: WatchListEntry[] = [
  { media_type: 'movie', id: 1, watched: false, genre_ids: [18], release_year: 2023, runtime: 106 },
  { media_type: 'movie', id: 2, watched: true, genre_ids: [878], release_year: 2024 },
  { media_type: 'tv', id: 3, watched: { 1: [1, 2, 3] }, episode_counts: { 1: 3, 2: 4 }, genre_ids: [18, 35] },
  { media_type: 'tv', id: 4, watched: {}, episode_counts: { 1: 10 }, genre_ids: [35] },
  { media_type: 'tv', id: 5, watched: { 1: [1, 2] }, episode_counts: { 1: 2 }, release_year: 2014 },
];
const titles = ['Past Lives', 'Dune', 'Severance', 'Slow Horses', 'Fargo'];
const items = buildBoardItems(
  entries,
  index => ({ media_type: entries[index].media_type, title: titles[index], name: titles[index], poster_path: null }) as never,
  genreName,
);
const byId = (id: number) => items.find(item => item.id === id) as BoardItem;

describe('tvProgress', () => {
  it('finds the next episode across seasons', () => {
    const progress = tvProgress(entries[2] as never);
    expect(progress).toMatchObject({ status: 'inProgress', watchedEpisodes: 3, totalEpisodes: 7, next: { season: 2, episode: 1 } });
  });
  it('fills gaps before moving on', () => {
    expect(tvProgress({ media_type: 'tv', id: 9, watched: { 1: [1, 3] }, episode_counts: { 1: 3 } }).next).toEqual({
      season: 1,
      episode: 2,
    });
  });
  it('ignores specials and starts unwatched shows at S1E1', () => {
    const progress = tvProgress({ media_type: 'tv', id: 9, watched: { 0: [1] }, episode_counts: { 0: 1, 1: 5 } });
    expect(progress).toMatchObject({ status: 'notStarted', next: { season: 1, episode: 1 } });
  });
  it('never calls a show finished without episode_counts', () => {
    expect(tvProgress({ media_type: 'tv', id: 9, watched: { 1: [1, 2] } }).status).toBe('inProgress');
  });
});

describe('buildBoardItems', () => {
  it('derives status, genres and display fields', () => {
    expect(byId(1)).toMatchObject({ status: 'notStarted', genres: ['Drama'], title: 'Past Lives', year: 2023, runtime: 106 });
    expect(byId(2).status).toBe('watched');
    expect(byId(5)).toMatchObject({ status: 'watched', progress: 100, next: undefined });
  });
});

describe('filters', () => {
  it('matches type, status, genre and accent-insensitive query', () => {
    const f = { ...DEFAULT_BOARD_FILTERS, type: 'tv' as const, genre: 'Comedy' };
    expect(items.filter(item => matchesFilters(item, f)).map(i => i.id)).toEqual([3, 4]);
    expect(matchesFilters(byId(3), { ...DEFAULT_BOARD_FILTERS, query: 'SÉVER' })).toBe(true);
  });
  it('counts each pill as if it were selected', () => {
    const counts = filterCounts(items, { ...DEFAULT_BOARD_FILTERS, type: 'movie' });
    expect(counts.type).toEqual({ all: 5, movie: 2, tv: 3 });
    expect(counts.status).toEqual({ all: 2, notStarted: 1, inProgress: 0, watched: 1 });
  });
  it('drops In progress when switching to movies', () => {
    expect(nextFilters({ ...DEFAULT_BOARD_FILTERS, status: 'inProgress' }, { type: 'movie' }).status).toBe('all');
  });
  it('hides columns by status and type', () => {
    expect(visibleColumns({ type: 'all', status: 'all' })).toEqual(['notStarted', 'inProgress', 'watched']);
    expect(visibleColumns({ type: 'movie', status: 'all' })).toEqual(['notStarted', 'watched']);
    expect(visibleColumns({ type: 'all', status: 'watched' })).toEqual(['watched']);
  });
});

describe('sortItems', () => {
  it('sorts by saved (newest first), title, year and progress', () => {
    expect(sortItems(items, 'saved').map(i => i.id)).toEqual([5, 4, 3, 2, 1]);
    expect(sortItems(items, 'title').map(i => i.title)).toEqual(['Dune', 'Fargo', 'Past Lives', 'Severance', 'Slow Horses']);
    expect(sortItems(items, 'year')[0].id).toBe(2);
    expect(
      sortItems(items, 'progress')
        .slice(0, 2)
        .map(i => i.id),
    ).toEqual([5, 2]);
  });
});
