// src/core/services/movie.service.ts

import { ApiService } from './api.service';
import { TvShow } from './tv.service';

/**
 * Basic TMDB v3 movie result shapes.
 * Expand these interfaces as your UI needs more data.
 */
export type Movie = {
  id: number;
  adult: boolean;
  backdrop_path?: string;
  genre_ids: number[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

export type MovieListResponse = {
  page: number;
  results: (TvShow & Movie)[];
  total_pages: number;
  total_results: number;
};

/**
 * More complete Movie details (partial — add fields as needed)
 */
export type MovieDetails = {
  id: number;
  title: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  runtime?: number;
  genres?: { id: number; name: string }[];
  vote_average?: number;
  videos?: any;
  credits?: any;
};

/**
 * Options for discover & search endpoints
 *
 * Notes:
 * - Authentication is performed via Authorization: Bearer <VITE_TMDB_READ_ACCESS_TOKEN>
 * - No api_key query parameter is required when using Bearer token.
 */
export type GetMovieOptions = {
  page?: number;
  language?: string;
  query?: string; // if present -> /search/movie
  with_genres?: number[] | string;
  sort_by?: string; // e.g. 'popularity.desc'
  include_adult?: boolean;
  region?: string;
  retry?: number;
};

/**
 * MovieService - TMDB v3 wrapper for Movie endpoints.
 *
 * Methods implemented:
 *  - getMovies(options) -> smart wrapper choosing search/discover/popular
 *  - getPopularMovie(page)
 *  - getMovieById(movieId, appendToResponse?)
 *  - searchMovie(query, page)
 *  - discoverMovies(options)
 *
 * All requests are authenticated automatically by ApiService via tokenProvider that
 * returns VITE_TMDB_READ_ACCESS_TOKEN (Bearer token).
 */
export default class MovieService extends ApiService {
  /**
   * getMovies - flexible method that picks an endpoint:
   *  - /search/movie when `query` provided
   *  - /discover/movie when discover-like options provided (with_genres, sort_by)
   *  - /movie/popular otherwise
   */
  public getMovies(options: GetMovieOptions = {}): Promise<MovieListResponse> {
    const { page = 1, language = 'en-US', query, with_genres, sort_by, include_adult = false, region, retry = 0 } = options;

    const params: Record<string, any> = {
      page,
      language,
      include_adult,
    };

    if (region) params.region = region;

    // Search endpoint if query provided
    if (query && query.trim().length > 0) {
      params.query = query.trim();
      return this.apiGet<MovieListResponse>('/search/movie', {
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

      return this.apiGet<MovieListResponse>('/discover/movie', {
        axiosConfig: { params },
        retry,
      });
    }

    // Default: popular movies
    return this.getPopularMovie(page, { language, region, retry });
  }

  /**
   * getPopularMovie - convenience wrapper for /movie/popular
   */
  public getPopularMovie(page = 1, opts: { language?: string; region?: string; retry?: number } = {}): Promise<MovieListResponse> {
    const { language = 'en-US', region, retry = 0 } = opts;
    const params: Record<string, any> = { page, language };
    if (region) params.region = region;
    return this.apiGet<MovieListResponse>('/movie/popular', {
      axiosConfig: { params },
      retry,
    });
  }

  /**
   * getMovieById - fetch movie details by id
   *
   * @param movieId - TMDB movie id
   * @param appendToResponse - optional comma-separated string to append related data
   *                            (e.g., 'videos,credits,images')
   */
  public getMovieById(movieId: number | string, appendToResponse?: string): Promise<MovieDetails> {
    const params: Record<string, any> = {};
    if (appendToResponse) params.append_to_response = appendToResponse;
    return this.apiGet<MovieDetails>(`/movie/${movieId}`, {
      axiosConfig: { params },
      retry: 0,
    });
  }

  /**
   * searchMovie - direct search convenience wrapper
   */
  public searchMovie(
    query: string,
    page = 1,
    opts: { language?: string; include_adult?: boolean; region?: string; retry?: number } = {},
  ): Promise<MovieListResponse> {
    const { language = 'en-US', include_adult = false, region, retry = 0 } = opts;
    const params: Record<string, any> = { query: query.trim(), page, language, include_adult };
    if (region) params.region = region;
    return this.apiGet<MovieListResponse>('/search/movie', {
      axiosConfig: { params },
      retry,
    });
  }

  /**
   * discoverMovies - direct discover wrapper with flexible options
   */
  public discoverMovies(options: GetMovieOptions = {}): Promise<MovieListResponse> {
    const { page = 1, language = 'en-US', with_genres, sort_by, include_adult = false, region, retry = 0 } = options;

    const params: Record<string, any> = {
      page,
      language,
      include_adult,
    };

    if (region) params.region = region;
    if (with_genres) params.with_genres = Array.isArray(with_genres) ? with_genres.join(',') : with_genres;
    if (sort_by) params.sort_by = sort_by;

    return this.apiGet<MovieListResponse>('/discover/movie', {
      axiosConfig: { params },
      retry,
    });
  }
}

/**
 * Default singleton instance of MovieService.
 *
 * - Uses TMDB v3 base URL.
 * - Authentication handled via tokenProvider -> Authorization: Bearer <VITE_TMDB_READ_ACCESS_TOKEN>
 * - defaultParams remains empty because api_key is not used when using Bearer auth.
 */
export const movieService = new MovieService({
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
   const popular = await movieService.getPopularMovie(1);

   // Smart wrapper (search)
   const search = await movieService.getMovies({ query: 'inception' });

   // Discover with genres
   const discover = await movieService.getMovies({ with_genres: [28, 12], sort_by: 'popularity.desc' });

   // Get details with appended responses
   const details = await movieService.getMovieById(27205, 'credits,videos,images');

   // React Query example
   import { useQuery } from '@tanstack/react-query';
   function usePopularMovies(page = 1) {
     return useQuery(['movies', 'popular', page], () => movieService.getPopularMovie(page), {
       staleTime: 1000 * 60 * 2,
       keepPreviousData: true,
     });
   }
*/
