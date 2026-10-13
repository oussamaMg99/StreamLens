// src/core/models/watchListBoard.model.ts
// View model of the Watch list page (status board). Everything here is derived from the
// stored WatchListEntry plus the title's TMDB details; nothing is persisted.

import { MovieDetails } from './movieDetails.model';
import { TVShowDetails } from './tvShowDetails.model';
import { WatchListEntry } from './watchList.model';

/** The board's three columns. A show with some (not all) episodes watched is inProgress. */
export type BoardStatus = 'notStarted' | 'inProgress' | 'watched';

export type BoardTypeFilter = 'all' | 'movie' | 'tv';
export type BoardStatusFilter = 'all' | BoardStatus;
export type BoardSort = 'saved' | 'title' | 'year' | 'progress';

export interface BoardFilters {
  type: BoardTypeFilter;
  status: BoardStatusFilter;
  /** Matched against the localized title, case- and accent-insensitive. */
  query: string;
  /** Localized genre name (movie and TV genre ids differ, names are shared), null = all. */
  genre: string | null;
  sort: BoardSort;
}

export const DEFAULT_BOARD_FILTERS: BoardFilters = { type: 'all', status: 'all', query: '', genre: null, sort: 'saved' };

/** What the card needs from TMDB details (the entry only stores ids and numbers). */
export interface EntryDisplay {
  title?: string;
  posterPath?: string | null;
  year?: number;
}

export interface BoardItem extends EntryDisplay {
  /** watchListEntryId: `${media_type}_${id}`. */
  key: string;
  media_type: WatchListEntry['media_type'];
  id: number;
  details?: MovieDetails | TVShowDetails;
  status: BoardStatus;
  /** Position in the stored array. New entries are appended, so higher = saved later. */
  savedIndex: number;
  /** Movie runtime in minutes. */
  runtime?: number;
  /** Number of regular seasons (TV), from episode_counts. */
  seasons?: number;
  genres: string[];
  watchedEpisodes: number;
  totalEpisodes: number;
  /** 0–100. Movies: 0 or 100. */
  progress: number;
  /** TV only: the first unwatched regular-season episode. */
  next?: { season: number; episode: number };
}

export interface BoardColumn {
  status: BoardStatus;
  items: BoardItem[];
}

export interface BoardCounts {
  type: Record<BoardTypeFilter, number>;
  status: Record<BoardStatusFilter, number>;
}
