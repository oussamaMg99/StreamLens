import { describe, expect, it } from 'vitest';
import { Collection } from 'src/core/models/collection.model';
import { WatchListEntry } from 'src/core/models/watchList.model';
import type { Movie } from 'src/core/models/movie.model';
import { unfinishedCollections, watchedCollectionIds } from './collections.utils';

const TODAY = '2026-10-11';

// Fixtures carry only the fields these helpers read.
const part = (id: number, release_date: string) => ({ media_type: 'movie', id, release_date, title: `m${id}` }) as Movie;
const collection = (id: number, parts: Movie[]) => ({ id, name: `c${id}`, parts }) as Collection;
const watchedMovie = (id: number, collection_id?: number): WatchListEntry => ({ media_type: 'movie', id, watched: true, collection_id });

describe('watchedCollectionIds', () => {
  it('returns each collection of a watched movie once, skipping 0, unwatched and TV entries', () => {
    const entries: WatchListEntry[] = [
      watchedMovie(1, 10),
      watchedMovie(2, 10),
      watchedMovie(3, 0),
      watchedMovie(4),
      { media_type: 'movie', id: 5, watched: false, collection_id: 20 },
      { media_type: 'tv', id: 6, watched: { 1: [1] } },
      watchedMovie(7, 30),
    ];
    expect(watchedCollectionIds(entries)).toEqual([10, 30]);
  });
});

describe('unfinishedCollections', () => {
  const trilogy = collection(10, [part(103, '2003-12-17'), part(101, '2001-12-19'), part(102, '2002-12-18')]);

  it('reports progress and the earliest-released unwatched part', () => {
    const [result] = unfinishedCollections([watchedMovie(101, 10), watchedMovie(103, 10)], [trilogy], TODAY);
    expect(result).toMatchObject({ watched: 2, total: 3, next: { id: 102 } });
    expect(result.collection.id).toBe(10);
  });

  it('leaves out finished, unstarted and single-part series', () => {
    const finished = [watchedMovie(101), watchedMovie(102), watchedMovie(103)];
    expect(unfinishedCollections(finished, [trilogy], TODAY)).toEqual([]);
    expect(unfinishedCollections([], [trilogy], TODAY)).toEqual([]);
    const single = collection(20, [part(201, '2010-01-01')]);
    expect(unfinishedCollections([watchedMovie(201)], [single], TODAY)).toEqual([]);
  });

  it('ignores parts that are unreleased or have no date', () => {
    const upcoming = collection(30, [part(301, '2020-01-01'), part(302, '2021-01-01'), part(303, '2027-05-01'), part(304, '')]);
    // Both released parts watched: done, even though more are coming.
    expect(unfinishedCollections([watchedMovie(301), watchedMovie(302)], [upcoming], TODAY)).toEqual([]);
    const [result] = unfinishedCollections([watchedMovie(301)], [upcoming], TODAY);
    expect(result).toMatchObject({ watched: 1, total: 2, next: { id: 302 } });
  });

  it('orders by how close to done, then by parts watched, and keeps at most 4', () => {
    const series = (id: number, size: number) =>
      collection(
        id,
        Array.from({ length: size }, (_, index) => part(id * 10 + index, `20${10 + index}-01-01`)),
      );
    const collections = [series(1, 4), series(2, 2), series(3, 6), series(4, 3), series(5, 5)];
    const entries = [
      watchedMovie(10), // 1 of 4 = 0.25
      watchedMovie(20), // 1 of 2 = 0.5
      ...[30, 31, 32].map(id => watchedMovie(id)), // 3 of 6 = 0.5, more watched than series 2
      ...[40, 41].map(id => watchedMovie(id)), // 2 of 3 = 0.67
      watchedMovie(50), // 1 of 5 = 0.2, dropped by the cap
    ];
    expect(unfinishedCollections(entries, collections, TODAY).map(item => item.collection.id)).toEqual([4, 3, 2, 1]);
  });

  it('lists released parts in order with watched flags, and upcoming parts separately', () => {
    const upcoming = collection(40, [part(403, '2027-05-01'), part(402, '2021-01-01'), part(401, '2020-01-01'), part(404, '')]);
    const [result] = unfinishedCollections([watchedMovie(401)], [upcoming], TODAY);
    expect(result.parts.map(item => [item.movie.id, item.watched, item.number])).toEqual([
      [401, true, 1],
      [402, false, 2],
    ]);
    expect(result.upcoming.map(movie => movie.id)).toEqual([403]);
  });
});
