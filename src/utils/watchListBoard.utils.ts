// Pure logic of the Watch list board: status/progress per entry, filtering, sorting,
// counts and visible columns. No React, no Firebase — tested in watchListBoard.utils.test.ts.

import { WatchListEntry, WatchListMovieEntry, WatchListTvEntry } from 'src/core/models/watchList.model';
import {
  BoardCounts,
  BoardFilters,
  BoardItem,
  BoardSort,
  BoardStatus,
  BoardStatusFilter,
  BoardTypeFilter,
  EntryDisplay,
} from 'src/core/models/watchListBoard.model';
import { MovieDetails } from 'src/core/models/movieDetails.model';
import { TVShowDetails } from 'src/core/models/tvShowDetails.model';
import { GenreNameLookup } from './insights.utils';
import { watchListEntryId } from './watchListMeta.utils';

export const BOARD_COLUMNS: BoardStatus[] = ['notStarted', 'inProgress', 'watched'];
export const TYPE_FILTERS: BoardTypeFilter[] = ['all', 'movie', 'tv'];
export const STATUS_FILTERS: BoardStatusFilter[] = ['all', 'notStarted', 'inProgress', 'watched'];
export const SORTS: BoardSort[] = ['saved', 'title', 'year', 'progress'];

type Progress = Pick<BoardItem, 'status' | 'watchedEpisodes' | 'totalEpisodes' | 'progress' | 'next' | 'seasons'>;

const movieProgress = (entry: WatchListMovieEntry): Progress => ({
  status: entry.watched ? 'watched' : 'notStarted',
  watchedEpisodes: 0,
  totalEpisodes: 0,
  progress: entry.watched ? 100 : 0,
});

/**
 * Same rules as Insights' resumePoint: regular seasons only (season 0 = specials), sizes
 * from episode_counts. Without episode_counts a show with watched episodes can't be
 * called finished, so it stays inProgress.
 */
export const tvProgress = (entry: WatchListTvEntry): Progress => {
  const seasons = Object.entries(entry.episode_counts ?? {})
    .map(([season, count]) => [Number(season), count] as const)
    .filter(([season, count]) => season > 0 && count > 0)
    .sort(([a], [b]) => a - b);
  const totalEpisodes = seasons.reduce((sum, [, count]) => sum + count, 0);
  let watchedEpisodes = 0;
  let next: Progress['next'];

  if (seasons.length) {
    for (const [season, count] of seasons) {
      const watched = new Set(entry.watched[season] ?? []);
      watchedEpisodes += Math.min(watched.size, count);
      if (!next && watched.size < count) {
        let episode = 1;
        while (watched.has(episode)) episode++;
        next = { season, episode };
      }
    }
  } else {
    watchedEpisodes = Object.entries(entry.watched)
      .filter(([season]) => Number(season) > 0)
      .reduce((sum, [, episodes]) => sum + episodes.length, 0);
  }

  const status: BoardStatus =
    watchedEpisodes === 0 ? 'notStarted' : totalEpisodes > 0 && watchedEpisodes >= totalEpisodes ? 'watched' : 'inProgress';
  return {
    status,
    watchedEpisodes,
    totalEpisodes,
    progress: totalEpisodes ? Math.min(100, Math.round((watchedEpisodes / totalEpisodes) * 100)) : 0,
    next: status === 'watched' ? undefined : (next ?? (watchedEpisodes === 0 ? { season: 1, episode: 1 } : undefined)),
    seasons: seasons.length || undefined,
  };
};

export const entryProgress = (entry: WatchListEntry): Progress => (entry.media_type === 'movie' ? movieProgress(entry) : tvProgress(entry));

/** Title / poster / year from a details payload (movie and TV name them differently). */
export const displayFromDetails = (details?: MovieDetails | TVShowDetails): EntryDisplay | undefined => {
  if (!details) return undefined;
  const isMovie = details.media_type === 'movie';
  const date = isMovie ? (details as MovieDetails).release_date : (details as TVShowDetails).first_air_date;
  const year = Number(date?.slice(0, 4));
  return {
    title: isMovie ? (details as MovieDetails).title : (details as TVShowDetails).name,
    posterPath: details.poster_path,
    year: Number.isInteger(year) && year > 1800 ? year : undefined,
  };
};

export const buildBoardItems = (
  entries: WatchListEntry[],
  detailsAt: (index: number) => MovieDetails | TVShowDetails | undefined,
  genreName: GenreNameLookup,
): BoardItem[] =>
  entries.map((entry, index) => {
    const details = detailsAt(index);
    const display = displayFromDetails(details);
    return {
      key: watchListEntryId(entry),
      media_type: entry.media_type,
      id: entry.id,
      details,
      savedIndex: index,
      title: display?.title,
      posterPath: display?.posterPath,
      // Stored release_year first (0 = TMDB has no date), details as a fallback for old entries.
      year: entry.release_year || display?.year,
      runtime: entry.media_type === 'movie' ? entry.runtime : undefined,
      genres: (entry.genre_ids ?? []).flatMap(id => {
        const name = genreName(entry.media_type, id);
        return name ? [name] : [];
      }),
      ...entryProgress(entry),
    };
  });

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim();

/** `ignore` lets the pill counts ask "how many if this one filter were X". */
export const matchesFilters = (item: BoardItem, filters: BoardFilters, ignore: { type?: boolean; status?: boolean } = {}) => {
  if (!ignore.type && filters.type !== 'all' && item.media_type !== filters.type) return false;
  if (!ignore.status && filters.status !== 'all' && item.status !== filters.status) return false;
  if (filters.genre && !item.genres.includes(filters.genre)) return false;
  const query = normalize(filters.query);
  // A title still loading can't match a search; it appears once its details land.
  if (query && !normalize(item.title ?? '').includes(query)) return false;
  return true;
};

export const sortItems = (items: BoardItem[], sort: BoardSort, locale?: string): BoardItem[] => {
  const byTitle = (a: BoardItem, b: BoardItem) => {
    if (!a.title || !b.title) return a.title ? -1 : b.title ? 1 : 0;
    return a.title.localeCompare(b.title, locale, { sensitivity: 'base' });
  };
  const recent = (a: BoardItem, b: BoardItem) => b.savedIndex - a.savedIndex;
  const compare: Record<BoardSort, (a: BoardItem, b: BoardItem) => number> = {
    saved: recent,
    title: (a, b) => byTitle(a, b) || recent(a, b),
    year: (a, b) => (b.year ?? 0) - (a.year ?? 0) || byTitle(a, b),
    progress: (a, b) => b.progress - a.progress || recent(a, b),
  };
  return [...items].sort(compare[sort]);
};

export const filterCounts = (items: BoardItem[], filters: BoardFilters): BoardCounts => {
  const count = (next: Partial<BoardFilters>, ignore: { type?: boolean; status?: boolean }) =>
    items.filter(item => matchesFilters(item, { ...filters, ...next }, ignore)).length;
  return {
    type: Object.fromEntries(TYPE_FILTERS.map(type => [type, count({ type }, {})])) as BoardCounts['type'],
    status: Object.fromEntries(STATUS_FILTERS.map(status => [status, count({ status }, {})])) as BoardCounts['status'],
  };
};

/** The status filter hides columns; movies never have an In progress column. */
export const visibleColumns = (filters: Pick<BoardFilters, 'type' | 'status'>): BoardStatus[] =>
  BOARD_COLUMNS.filter(
    column => (filters.status === 'all' || filters.status === column) && !(column === 'inProgress' && filters.type === 'movie'),
  );

export const visibleStatusFilters = (type: BoardTypeFilter): BoardStatusFilter[] =>
  STATUS_FILTERS.filter(status => !(status === 'inProgress' && type === 'movie'));

/** Applies a filter change, dropping an In progress status that no longer applies to movies. */
export const nextFilters = (current: BoardFilters, change: Partial<BoardFilters>): BoardFilters => {
  const next = { ...current, ...change };
  if (next.type === 'movie' && next.status === 'inProgress') next.status = 'all';
  return next;
};

export const genreOptions = (items: BoardItem[], locale?: string): string[] =>
  [...new Set(items.flatMap(item => item.genres))].sort((a, b) => a.localeCompare(b, locale));

export const isFiltered = (filters: BoardFilters) =>
  filters.type !== 'all' || filters.status !== 'all' || !!filters.query.trim() || !!filters.genre;
