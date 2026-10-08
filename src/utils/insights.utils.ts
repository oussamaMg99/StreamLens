import { InsightGenre, InsightsSummary, ResumeShow } from 'src/core/models/insights.model';
import { WatchListEntry, WatchListTvEntry } from 'src/core/models/watchList.model';

/** Localized genre name for a TMDB id; undefined when the genre list doesn't have it. */
export type GenreNameLookup = (type: 'movie' | 'tv', id: number) => string | undefined;

const TOP_GENRES = 3;
const MAX_RESUME = 4;

/** Watched episode numbers per regular season (season 0 = specials, ignored everywhere). */
const regularSeasonsWatched = (entry: WatchListTvEntry): [number, number[]][] =>
  Object.entries(entry.watched)
    .map(([season, episodes]): [number, number[]] => [Number(season), episodes])
    .filter(([season, episodes]) => season > 0 && episodes.length > 0);

/** Seasons whose watched episodes reach the stored episode count. */
const countFinishedSeasons = (watchedSeasons: [number, number[]][], episodeCounts: Record<number, number>): number =>
  watchedSeasons.filter(([season, episodes]) => {
    const total = episodeCounts[season];
    return total > 0 && episodes.length >= total;
  }).length;

const countGenres = (counts: Map<number, number>, genreIds: number[] | undefined) => {
  for (const id of genreIds ?? []) counts.set(id, (counts.get(id) ?? 0) + 1);
};

/** Top genres by count, then name; ids the genre list can't name are skipped. */
const topOf = (counts: Map<number, number>, type: 'movie' | 'tv', genreName: GenreNameLookup): InsightGenre[] =>
  [...counts.entries()]
    .flatMap(([id, count]) => {
      const name = genreName(type, id);
      return name ? [{ id, name, count }] : [];
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, TOP_GENRES);

/**
 * Where a started show stands: its next unwatched episode, or undefined when every
 * regular-season episode is watched (or there are no stored season sizes to tell).
 */
const resumePoint = (entry: WatchListTvEntry, episodeCounts: Record<number, number>): ResumeShow | undefined => {
  const seasons = Object.entries(episodeCounts)
    .map(([season, count]) => [Number(season), count] as const)
    .filter(([season, count]) => season > 0 && count > 0)
    .sort(([a], [b]) => a - b);
  const totalEpisodes = seasons.reduce((sum, [, count]) => sum + count, 0);
  let watchedEpisodes = 0;
  let next: { season: number; episode: number } | undefined;

  for (const [season, count] of seasons) {
    const watched = new Set(entry.watched[season] ?? []);
    watchedEpisodes += Math.min(watched.size, count);
    if (!next && watched.size < count) {
      let episode = 1;
      while (watched.has(episode)) episode++;
      next = { season, episode };
    }
  }

  if (!next || !totalEpisodes) return undefined;
  return { id: entry.id, nextSeason: next.season, nextEpisode: next.episode, watchedEpisodes, totalEpisodes };
};

/**
 * buildInsightsSummary - the whole Insights page from the watch list alone: every entry
 * carries the metadata it needs (genre_ids, runtime / minutes_watched, episode_counts,
 * updated_at), so the only other input is the localized genre names. Pure, so the
 * counting rules are unit-tested (insights.utils.test.ts).
 *
 * Only watched titles count: a saved-but-unwatched movie or a show with no watched
 * episode contributes nothing. A watched entry missing metadata (saved before it existed
 * and not yet backfilled) still counts in movies/tvShows, adding only what it has.
 */
export function buildInsightsSummary(entries: WatchListEntry[], genreName: GenreNameLookup): InsightsSummary {
  let movies = 0;
  let tvShows = 0;
  let seasonsFinished = 0;
  let minutes = 0;
  const movieGenres = new Map<number, number>();
  const tvGenres = new Map<number, number>();
  const resume: (ResumeShow & { updatedAt: number })[] = [];

  for (const entry of entries) {
    if (entry.media_type === 'movie') {
      if (!entry.watched) continue;
      movies++;
      minutes += entry.runtime ?? 0;
      countGenres(movieGenres, entry.genre_ids);
      continue;
    }

    const watchedSeasons = regularSeasonsWatched(entry);
    if (!watchedSeasons.length) continue;
    tvShows++;
    minutes += entry.minutes_watched ?? 0;
    countGenres(tvGenres, entry.genre_ids);
    if (!entry.episode_counts) continue;

    seasonsFinished += countFinishedSeasons(watchedSeasons, entry.episode_counts);
    const point = resumePoint(entry, entry.episode_counts);
    if (point) resume.push({ ...point, updatedAt: entry.updated_at ?? 0 });
  }

  return {
    movies,
    tvShows,
    seasonsFinished,
    hoursWatched: Math.round(minutes / 60),
    topGenres: { movie: topOf(movieGenres, 'movie', genreName), tv: topOf(tvGenres, 'tv', genreName) },
    // Most recently watched first: that's the show you were in the middle of.
    resume: resume
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_RESUME)
      .map(({ updatedAt: _updatedAt, ...card }) => card),
  };
}
