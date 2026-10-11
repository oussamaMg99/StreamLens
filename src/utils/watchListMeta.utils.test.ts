import { describe, expect, it } from 'vitest';
import { MovieDetails } from 'src/core/models/movieDetails.model';
import { TVShowDetails } from 'src/core/models/tvShowDetails.model';
import { WatchListEntry, WatchListTvEntry } from 'src/core/models/watchList.model';
import {
  applyAdd,
  applyEpisodeToggle,
  applyEpisodesWatched,
  applyMovieWatched,
  entryMetaFromDetails,
  isEpisodeAired,
  releaseYear,
} from './watchListMeta.utils';

// Fixtures carry only the fields these helpers read; the casts stand in for the rest of
// TMDB's (large) payloads.
const movieDetails = (id: number, runtime: number, genreIds: number[] = []): MovieDetails =>
  ({ media_type: 'movie', id, runtime, genres: genreIds.map(gid => ({ id: gid, name: `g${gid}` })) }) as MovieDetails;

const showDetails = (id: number, seasons: Record<number, number>) =>
  ({
    media_type: 'tv',
    id,
    genres: [{ id: 18, name: 'Drama' }],
    seasons: Object.entries(seasons).map(([season, count]) => ({ season_number: Number(season), episode_count: count })),
  }) as unknown as TVShowDetails;

const NOW = 1_000;

describe('entryMetaFromDetails', () => {
  // The fixtures carry no dates or collection, so release_year and collection_id are 0.
  it('keeps genre ids and runtime for a movie', () => {
    expect(entryMetaFromDetails(movieDetails(1, 120, [18, 53]))).toEqual({
      genre_ids: [18, 53],
      release_year: 0,
      runtime: 120,
      collection_id: 0,
    });
  });

  it("stores a movie's collection id, and 0 for a standalone film", () => {
    const series = { id: 119, name: 'The Lord of the Rings Collection', poster_path: '', backdrop_path: '' };
    expect(entryMetaFromDetails({ ...movieDetails(1, 120), belongs_to_collection: series }).collection_id).toBe(119);
    expect(entryMetaFromDetails({ ...movieDetails(1, 120), belongs_to_collection: null }).collection_id).toBe(0);
  });

  it('keeps genre ids and regular-season episode counts for a show', () => {
    expect(entryMetaFromDetails(showDetails(1, { 0: 3, 1: 8, 2: 10, 3: 0 }))).toEqual({
      genre_ids: [18],
      release_year: 0,
      episode_counts: { 1: 8, 2: 10 },
    });
  });

  it('takes release_year from the release date (movie) or first air date (tv)', () => {
    expect(entryMetaFromDetails({ ...movieDetails(1, 120), release_date: '1994-09-23' }).release_year).toBe(1994);
    expect(entryMetaFromDetails({ ...showDetails(1, { 1: 8 }), first_air_date: '2019-03-01' }).release_year).toBe(2019);
  });
});

describe('releaseYear', () => {
  it('reads the year and returns 0 for a missing or malformed date', () => {
    expect(releaseYear('1994-09-23')).toBe(1994);
    expect(releaseYear('')).toBe(0);
    expect(releaseYear(undefined)).toBe(0);
    expect(releaseYear('n/a')).toBe(0);
  });
});

describe('write helpers', () => {
  it('applyAdd stores metadata and stamps updated_at, and is a no-op when present', () => {
    const added = applyAdd([], { media_type: 'tv', id: 2 }, { genre_ids: [18], episode_counts: { 1: 8 } }, NOW);
    expect(added).toEqual([
      { media_type: 'tv', id: 2, watched: {}, genre_ids: [18], episode_counts: { 1: 8 }, minutes_watched: 0, updated_at: NOW },
    ]);
    expect(applyAdd(added, { media_type: 'tv', id: 2 }, undefined, NOW + 1)).toBe(added);
  });

  it('applyMovieWatched creates or updates the entry with metadata', () => {
    const created = applyMovieWatched([], 1, true, { genre_ids: [18], runtime: 100 }, NOW);
    expect(created).toEqual([
      { media_type: 'movie', id: 1, watched: true, genre_ids: [18], runtime: 100, watched_at: NOW, updated_at: NOW },
    ]);
    expect(applyMovieWatched(created, 1, true, undefined, NOW + 1)).toBe(created);
    expect(applyMovieWatched(created, 1, false, undefined, NOW + 1)[0]).toMatchObject({ watched: false, updated_at: NOW + 1 });
  });

  it('applyEpisodeToggle keeps minutes_watched in step and resets it when nothing is left', () => {
    const toggle = (entries: WatchListEntry[], episode: number, watched: boolean, runtime: number) =>
      applyEpisodeToggle(entries, { tvId: 2, season: 1, episode, watched, runtime }, NOW);
    let entries = toggle([], 1, true, 40);
    expect((entries[0] as WatchListTvEntry).minutes_watched).toBe(40);
    entries = toggle(entries, 2, true, 50);
    expect((entries[0] as WatchListTvEntry).minutes_watched).toBe(90);
    entries = toggle(entries, 1, false, 45); // runtime changed on TMDB since: still subtracted
    expect((entries[0] as WatchListTvEntry).minutes_watched).toBe(45);
    entries = toggle(entries, 2, false, 50);
    expect(entries[0]).toMatchObject({ watched: {}, minutes_watched: 0 });
  });

  it('applyEpisodeToggle leaves an entry without minutes_watched without one', () => {
    const legacy: WatchListEntry[] = [{ media_type: 'tv', id: 2, watched: { 1: [1] } }];
    const [next] = applyEpisodeToggle(legacy, { tvId: 2, season: 1, episode: 2, watched: true, runtime: 50 }, NOW);
    expect(next).not.toHaveProperty('minutes_watched');
    expect(next).toMatchObject({ watched: { 1: [1, 2] }, updated_at: NOW });
  });

  it('never writes undefined fields (Firestore rejects them)', () => {
    const [entry] = applyMovieWatched([], 1, true, undefined, NOW);
    expect(Object.values(entry).every(value => value !== undefined)).toBe(true);
  });
});

describe('applyEpisodesWatched', () => {
  const mark = (entries: WatchListEntry[], episodes: [number, number][], watched: boolean) =>
    applyEpisodesWatched(
      entries,
      { tvId: 2, season: 1, episodes: episodes.map(([episode, runtime]) => ({ episode, runtime })), watched, meta: { genre_ids: [18] } },
      NOW,
    );

  it('creates the entry with every episode and their summed minutes', () => {
    expect(
      mark(
        [],
        [
          [2, 50],
          [1, 40],
        ],
        true,
      ),
    ).toEqual([
      {
        media_type: 'tv',
        id: 2,
        watched: { 1: [1, 2] },
        genre_ids: [18],
        minutes_watched: 90,
        watched_at: { '1:1': NOW, '1:2': NOW },
        updated_at: NOW,
      },
    ]);
  });

  it('adds only episodes not yet watched, without double-counting their minutes', () => {
    const entries = mark([], [[1, 40]], true);
    const [next] = mark(
      entries,
      [
        [1, 40],
        [2, 50],
        [3, 60],
      ],
      true,
    );
    expect(next).toMatchObject({ watched: { 1: [1, 2, 3] }, minutes_watched: 150 });
  });

  it('unwatching subtracts the marked episodes and resets minutes once nothing is left', () => {
    const entries: WatchListEntry[] = [{ media_type: 'tv', id: 2, watched: { 1: [1, 2], 2: [1] }, minutes_watched: 130 }];
    const [next] = mark(
      entries,
      [
        [1, 40],
        [2, 50],
        [3, 60],
      ],
      false,
    ); // episode 3 was never watched
    expect(next).toMatchObject({ watched: { 2: [1] }, minutes_watched: 40 });
    expect(next).not.toHaveProperty(['watched', '1']);
    const [cleared] = applyEpisodesWatched(
      [{ media_type: 'tv', id: 2, watched: { 1: [1] }, minutes_watched: 40 }],
      { tvId: 2, season: 1, episodes: [{ episode: 1, runtime: 40 }], watched: false },
      NOW,
    );
    expect(cleared).toMatchObject({ watched: {}, minutes_watched: 0 });
  });

  it('returns the same array when nothing changes', () => {
    const entries = mark([], [[1, 40]], true);
    expect(mark(entries, [[1, 40]], true)).toBe(entries);
    expect(mark(entries, [], true)).toBe(entries);
    expect(mark([], [[1, 40]], false)).toEqual([]);
  });

  it('leaves an entry without minutes_watched without one', () => {
    const [next] = mark([{ media_type: 'tv', id: 2, watched: { 1: [1] } }], [[2, 50]], true);
    expect(next).not.toHaveProperty('minutes_watched');
  });

  it('never writes undefined fields', () => {
    const [entry] = applyEpisodesWatched([], { tvId: 2, season: 1, episodes: [{ episode: 1, runtime: 0 }], watched: true }, NOW);
    expect(Object.values(entry).every(value => value !== undefined)).toBe(true);
  });
});

describe('isEpisodeAired', () => {
  it('compares the air date with today and treats a missing date as aired', () => {
    expect(isEpisodeAired({ air_date: '2026-10-01' }, '2026-10-08')).toBe(true);
    expect(isEpisodeAired({ air_date: '2026-10-08' }, '2026-10-08')).toBe(true);
    expect(isEpisodeAired({ air_date: '2026-10-09' }, '2026-10-08')).toBe(false);
    expect(isEpisodeAired({ air_date: '' }, '2026-10-08')).toBe(true);
  });
});

describe('watched_at', () => {
  const LATER = NOW + 86_400_000;

  it('dates a movie when marked, keeps the date on a repeat mark and drops it when unmarked', () => {
    const marked = applyMovieWatched([], 1, true, undefined, NOW);
    expect(marked[0]).toMatchObject({ watched_at: NOW });
    expect(applyMovieWatched(marked, 1, true, undefined, LATER)).toBe(marked);
    const [unmarked] = applyMovieWatched(marked, 1, false, undefined, LATER);
    expect(unmarked).not.toHaveProperty('watched_at');
    expect(applyMovieWatched([unmarked], 1, true, undefined, LATER)[0]).toMatchObject({ watched_at: LATER });
  });

  it('never dates a title that is only saved, or created as unwatched', () => {
    expect(applyAdd([], { media_type: 'movie', id: 1 }, undefined, NOW)[0]).not.toHaveProperty('watched_at');
    expect(applyMovieWatched([], 1, false, undefined, NOW)[0]).not.toHaveProperty('watched_at');
  });

  it('dates each episode that changes, and leaves the others alone', () => {
    const mark = (entries: WatchListEntry[], season: number, episodes: number[], watched: boolean, now: number) =>
      applyEpisodesWatched(entries, { tvId: 2, season, episodes: episodes.map(episode => ({ episode, runtime: 0 })), watched }, now);
    let entries = mark([], 1, [1], true, NOW);
    // A bulk mark: 1:1 is already watched and keeps its date; 1:2 and 1:3 share LATER.
    entries = mark(entries, 1, [1, 2, 3], true, LATER);
    expect(entries[0]).toMatchObject({ watched_at: { '1:1': NOW, '1:2': LATER, '1:3': LATER } });
    entries = mark(entries, 0, [1], true, LATER); // a special counts too
    entries = mark(entries, 1, [2], false, LATER);
    expect((entries[0] as WatchListTvEntry).watched_at).toEqual({ '1:1': NOW, '1:3': LATER, '0:1': LATER });
  });

  it('removes the map once its last episode is unmarked', () => {
    const entries = applyEpisodeToggle([], { tvId: 2, season: 1, episode: 1, watched: true, runtime: 0 }, NOW);
    const [cleared] = applyEpisodeToggle(entries, { tvId: 2, season: 1, episode: 1, watched: false, runtime: 0 }, LATER);
    expect(cleared).not.toHaveProperty('watched_at');
  });

  it('gives an older entry a map holding only the newly marked episodes', () => {
    const legacy: WatchListEntry[] = [{ media_type: 'tv', id: 2, watched: { 1: [1, 2] }, minutes_watched: 90 }];
    const [next] = applyEpisodeToggle(legacy, { tvId: 2, season: 1, episode: 3, watched: true, runtime: 45 }, NOW);
    expect((next as WatchListTvEntry).watched_at).toEqual({ '1:3': NOW });
    expect(Object.values(next).every(value => value !== undefined)).toBe(true);
  });
});
