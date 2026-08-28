// src/core/services/tv.service.ts

import { Movie } from './movie.service';
import { TMDB_CONFIG } from './tmdb.config';
import { TmdbListService, TmdbListResponse } from './tmdbList.service';
import { TVShowDetails } from '../models/tvShowDetails.model';

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
  media_type?: 'tv' | 'movie';
};

export type TvListResponse = TmdbListResponse<TvShow & Movie>;

/**
 * Options for discover & search endpoints
 *
 * Notes:
 * - Authentication is performed via Authorization: Bearer <VITE_TMDB_READ_ACCESS_TOKEN>
 * - No api_key query parameter is required when using Bearer token.
 * - Unlike movies, TMDB's /tv endpoints don't accept a `region` filter.
 */
export type GetTvOptions = {
  page?: number;
  language?: string;
  query?: string; // if present -> /search/tv
  with_genres?: number[] | string;
  sort_by?: string; // e.g. 'popularity.desc'
  include_adult?: boolean;
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
 *
 * The actual endpoint logic (discover-filter detection, param building, etc.) lives in
 * the shared TmdbListService base — this class just wires up media-type-specific names.
 */
export default class TvService extends TmdbListService<TvShow & Movie, TVShowDetails> {
  protected readonly mediaType = 'tv' as const;

  public getTvShows(options: GetTvOptions = {}): Promise<TvListResponse> {
    return this.list(options);
  }

  public getPopularTV(page = 1, opts: { language?: string; retry?: number } = {}): Promise<TvListResponse> {
    return this.popular(page, opts);
  }

  public getTVById(tvId: number | string, appendToResponse?: string): Promise<TVShowDetails> {
    return this.byId(tvId, appendToResponse);
  }

  public searchTV(
    query: string,
    page = 1,
    opts: { language?: string; include_adult?: boolean; retry?: number } = {},
  ): Promise<TvListResponse> {
    return this.searchDirect(query, page, opts);
  }

  public discoverTV(options: GetTvOptions = {}): Promise<TvListResponse> {
    return this.discoverDirect(options);
  }
}

/**
 * Default singleton instance of TvService.
 */
export const tvService = new TvService(TMDB_CONFIG);

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