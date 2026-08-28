// src/core/services/movie.service.ts

import { MovieDetails } from '../models/movieDetails.model';
import { TmdbListService, TmdbListResponse } from './tmdbList.service';
import { TMDB_CONFIG } from './tmdb.config';
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
  media_type?: 'tv' | 'movie';
};

export type MovieListResponse = TmdbListResponse<TvShow & Movie>;

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
 *
 * The actual endpoint logic (discover-filter detection, param building, etc.) lives in
 * the shared TmdbListService base — this class just wires up media-type-specific names.
 */
export default class MovieService extends TmdbListService<TvShow & Movie, MovieDetails> {
  protected readonly mediaType = 'movie' as const;

  public getMovies(options: GetMovieOptions = {}): Promise<MovieListResponse> {
    return this.list(options);
  }

  public getPopularMovie(page = 1, opts: { language?: string; region?: string; retry?: number } = {}): Promise<MovieListResponse> {
    return this.popular(page, opts);
  }

  public getMovieById(movieId: number | string, appendToResponse?: string): Promise<MovieDetails> {
    return this.byId(movieId, appendToResponse);
  }

  public searchMovie(
    query: string,
    page = 1,
    opts: { language?: string; include_adult?: boolean; region?: string; retry?: number } = {},
  ): Promise<MovieListResponse> {
    return this.searchDirect(query, page, opts);
  }

  public discoverMovies(options: GetMovieOptions = {}): Promise<MovieListResponse> {
    return this.discoverDirect(options);
  }
}

/**
 * Default singleton instance of MovieService.
 */
export const movieService = new MovieService(TMDB_CONFIG);

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