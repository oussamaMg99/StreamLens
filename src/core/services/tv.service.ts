// src/core/services/tv.service.ts

import { ApiService } from './api.service';
import { Movie } from './movie.service';

/**
 * Basic TMDB v3 TV result shapes.
 * Expand these interfaces as your UI needs more data.
 */
export type TvShow = {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  first_air_date: string;
  name: string;
  vote_average: number;
  vote_count: number;
};

export type TvListResponse = {
  page: number;
  results: (TvShow & Movie)[];
  total_pages: number;
  total_results: number;
};

/**
 * More complete TV details (partial — add fields as needed)
 */
export type TvDetails = {
  id: number;
  name: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  first_air_date?: string;
  last_air_date?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  genres?: { id: number; name: string }[];
  episode_run_time?: number[];
  vote_average?: number;
};

/**
 * Options for discover & search endpoints
 *
 * Notes:
 * - Authentication is performed via Authorization: Bearer <VITE_TMDB_READ_ACCESS_TOKEN>
 * - No api_key query parameter is required when using Bearer token.
 */
export type GetTvOptions = {
  page?: number;
  language?: string;
  query?: string; // if present -> /search/tv
  with_genres?: number[] | string;
  sort_by?: string; // e.g. 'popularity.desc'
  include_adult?: boolean;
  timezone?: string; // optional for some tmdb endpoints
  retry?: number;
};

/**
 * TvService - TMDB v3 wrapper for TV endpoints.
 *
 * Methods implemented:
 *  - getTvShows(options) -> smart wrapper choosing search/discover/popular
 *  - getPopularTV(page)
 *  - getTVById(tvId, appendToResponse?)
 *  - searchTV(query, page)
 *  - discoverTV(options)
 *
 * All requests are authenticated automatically by ApiService via tokenProvider that
 * returns VITE_TMDB_READ_ACCESS_TOKEN (Bearer token).
 */
export default class TvService extends ApiService {
  /**
   * getTvShows - flexible method that picks an endpoint:
   *  - /search/tv when `query` provided
   *  - /discover/tv when discover-like options provided (with_genres, sort_by)
   *  - /tv/popular otherwise
   */
  public getTvShows(options: GetTvOptions = {}): Promise<TvListResponse> {
    const { page = 1, language = 'en-US', query, with_genres, sort_by, include_adult = false, retry = 0 } = options;

    const params: Record<string, any> = {
      page,
      language,
      include_adult,
    };

    // Search endpoint if query provided
    if (query && query.trim().length > 0) {
      params.query = query.trim();
      return this.apiGet<TvListResponse>('/search/tv', {
        axiosConfig: { params },
        retry,
      });
    }

    // Discover endpoint when filters present
    const hasDiscoverFilters = (Array.isArray(with_genres) && with_genres.length > 0) || typeof with_genres === 'string' || !!sort_by;

    if (hasDiscoverFilters) {
      if (with_genres) {
        params.with_genres = Array.isArray(with_genres) ? with_genres.join(',') : with_genres;
      }
      if (sort_by) params.sort_by = sort_by;

      return this.apiGet<TvListResponse>('/discover/tv', {
        axiosConfig: { params },
        retry,
      });
    }

    // Default: popular TV
    return this.getPopularTV(page, { language, retry });
  }

  /**
   * getPopularTV - convenience wrapper for /tv/popular
   */
  public getPopularTV(page = 1, opts: { language?: string; retry?: number } = {}): Promise<TvListResponse> {
    const { language = 'en-US', retry = 0 } = opts;
    const params = { page, language };
    return this.apiGet<TvListResponse>('/tv/popular', {
      axiosConfig: { params },
      retry,
    });
  }

  /**
   * getTVById - fetch TV details by id
   *
   * @param tvId - TMDB tv id
   * @param appendToResponse - optional comma-separated string to append related data
   *                            (e.g., 'videos,credits,images')
   */
  public getTVById(tvId: number | string, appendToResponse?: string): Promise<TvDetails> {
    const params: Record<string, any> = {};
    if (appendToResponse) params.append_to_response = appendToResponse;
    return this.apiGet<TvDetails>(`/tv/${tvId}`, {
      axiosConfig: { params },
      retry: 0,
    });
  }

  /**
   * searchTV - direct search convenience wrapper
   */
  public searchTV(
    query: string,
    page = 1,
    opts: { language?: string; include_adult?: boolean; retry?: number } = {},
  ): Promise<TvListResponse> {
    const { language = 'en-US', include_adult = false, retry = 0 } = opts;
    const params = { query: query.trim(), page, language, include_adult };
    return this.apiGet<TvListResponse>('/search/tv', {
      axiosConfig: { params },
      retry,
    });
  }

  /**
   * discoverTV - direct discover wrapper with flexible options
   */
  public discoverTV(options: GetTvOptions = {}): Promise<TvListResponse> {
    const { page = 1, language = 'en-US', with_genres, sort_by, include_adult = false, retry = 0 } = options;

    const params: Record<string, any> = {
      page,
      language,
      include_adult,
    };

    if (with_genres) params.with_genres = Array.isArray(with_genres) ? with_genres.join(',') : with_genres;
    if (sort_by) params.sort_by = sort_by;

    return this.apiGet<TvListResponse>('/discover/tv', {
      axiosConfig: { params },
      retry,
    });
  }
}

/**
 * Default singleton instance of TvService.
 *
 * - Uses TMDB v3 base URL.
 * - Authentication handled via tokenProvider -> Authorization: Bearer <VITE_TMDB_READ_ACCESS_TOKEN>
 * - defaultParams remains empty because api_key is not used when using Bearer auth.
 */
export const tvService = new TvService({
  baseURL: 'https://api.themoviedb.org/3',
  defaultParams: {},
  tokenProvider: () => {
    return import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN ?? null;
  },
  timeout: 15_000,
});

/* ---------------------------------------------------------------------------
   Usage examples
   ---------------------------------------------------------------------------

   // Popular
   const popular = await tvService.getPopularTV(1);

   // Smart wrapper (search)
   const search = await tvService.getTvShows({ query: 'stranger' });

   // Discover with genres
   const discover = await tvService.getTvShows({ with_genres: [18, 10765], sort_by: 'popularity.desc' });

   // Get details with appended responses
   const details = await tvService.getTVById(1399, 'credits,videos,images');

   // React Query example
   import { useQuery } from '@tanstack/react-query';
   function usePopularTV(page = 1) {
     return useQuery(['tv', 'popular', page], () => tvService.getPopularTV(page), {
       staleTime: 1000 * 60 * 2,
       keepPreviousData: true,
     });
   }
*/
