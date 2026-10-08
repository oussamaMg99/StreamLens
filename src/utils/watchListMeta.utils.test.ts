import { describe, expect, it } from 'vitest';
import { MovieDetails } from 'src/core/models/movieDetails.model';
import { TVShowDetails } from 'src/core/models/tvShowDetails.model';
import { WatchListEntry, WatchListTvEntry } from 'src/core/models/watchList.model';
import {
  applyAdd,
  applyBackfill,
  applyEpisodeToggle,
  applyMovieWatched,
  backfillPatchFromDetails,
  entryMetaFromDetails,
  episodeRuntime,
  needsBackfill,
} from './watchListMeta.utils';

// Fixtures carry only the fields these helpers read; the casts stand in for the rest of
// TMDB's (large) payloads.
const movieDetails = (id: number, runtime: number, genreIds: number[] = []): MovieDetails =>
  ({ media_type: 'movie', id, runtime, genres: genreIds.map(gid => ({ id: gid, name: `g${gid}` })) }) as MovieDetails;

const showDetails = (id: number, seasons: Record<number, number>, options: { runTime?: number[]; lastRuntime?: number } = {}) =>
  ({
    media_type: 'tv',
    id,
    genres: [{ id: 18, name: 'Drama' }],
    seasons: Object.entries(seasons).map(([season, count]) => ({ season_number: Number(season), episode_count: count })),
    episode_run_time: options.runTime ?? [],
    last_episode_to_air: options.lastRuntime === undefined ? undefined : { runtime: options.lastRuntime },
  }) as unknown as TVShowDetails;

const NOW = 1_000;

describe('entryMetaFromDetails', () => {
  it('keeps genre ids and runtime for a movie', () => {
    expect(entryMetaFromDetails(movieDetails(1, 120, [18, 53]))).toEqual({ genre_ids: [18, 53], runtime: 120 });
  });

  it('keeps genre ids and regular-season episode counts for a show', () => {
    expect(entryMetaFromDetails(showDetails(1, { 0: 3, 1: 8, 2: 10, 3: 0 }))).toEqual({ genre_ids: [18], episode_counts: { 1: 8, 2: 10 } });
  });
});

describe('needsBackfill', () => {
  it('flags watched entries missing metadata only', () => {
    expect(needsBackfill({ media_type: 'movie', id: 1, watched: true })).toBe(true);
    expect(needsBackfill({ media_type: 'movie', id: 1, watched: false })).toBe(false);
    expect(needsBackfill({ media_type: 'movie', id: 1, watched: true, genre_ids: [], runtime: 90 })).toBe(false);
    expect(needsBackfill({ media_type: 'tv', id: 2, watched: { 1: [1] }, genre_ids: [], episode_counts: { 1: 8 } })).toBe(true);
    expect(
      needsBackfill({ media_type: 'tv', id: 2, watched: { 1: [1] }, genre_ids: [], episode_counts: { 1: 8 }, minutes_watched: 40 }),
    ).toBe(false);
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
    expect(created).toEqual([{ media_type: 'movie', id: 1, watched: true, genre_ids: [18], runtime: 100, updated_at: NOW }]);
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

  it('applyEpisodeToggle leaves a legacy entry without minutes_watched for the backfill', () => {
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

describe('backfill', () => {
  it('estimates legacy TV minutes from the typical episode runtime', () => {
    const legacy: WatchListTvEntry = { media_type: 'tv', id: 2, watched: { 0: [1], 1: [1, 2, 3] } };
    expect(episodeRuntime(showDetails(2, { 1: 8 }, { lastRuntime: 30 }))).toBe(30);
    expect(backfillPatchFromDetails(legacy, showDetails(2, { 1: 8 }, { runTime: [40, 50] }))).toEqual({
      genre_ids: [18],
      episode_counts: { 1: 8 },
      minutes_watched: 135, // 3 regular episodes × 45 min; the special is ignored
    });
  });

  it('applyBackfill fills only missing fields and is a no-op when nothing is missing', () => {
    const entries: WatchListEntry[] = [
      { media_type: 'movie', id: 1, watched: true, genre_ids: [99] },
      { media_type: 'tv', id: 2, watched: { 1: [1] }, updated_at: 5 },
    ];
    const patches = {
      movie_1: { genre_ids: [18], runtime: 100 },
      tv_2: { genre_ids: [18], episode_counts: { 1: 8 }, minutes_watched: 45 },
    };
    const filled = applyBackfill(entries, patches);
    expect(filled).toEqual([
      { media_type: 'movie', id: 1, watched: true, genre_ids: [99], runtime: 100 },
      { media_type: 'tv', id: 2, watched: { 1: [1] }, updated_at: 5, genre_ids: [18], episode_counts: { 1: 8 }, minutes_watched: 45 },
    ]);
    expect(applyBackfill(filled, patches)).toBe(filled);
  });
});
