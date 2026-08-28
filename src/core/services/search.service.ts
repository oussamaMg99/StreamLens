import { ApiService } from './api.service';
import { Movie } from './movie.service';
import { TMDB_CONFIG } from './tmdb.config';
import { TmdbListResponse } from './tmdbList.service';
import { TvShow } from './tv.service';
import { Person } from '../models/person.model';

export type SearchAllResponse = TmdbListResponse<TvShow & Movie & Person>;

type SearchOptions = {
  query: string;
  include_adult?: boolean;
  language?: string;
  page?: number;
  retry?: number;
};

/**
 * SearchService - TMDB v3 wrapper for Search endpoints.
 *
 * Methods implemented:
 *  - searchAll(options) -> smart wrapper for multi-search
 *
 * All requests are authenticated automatically by ApiService via tokenProvider that
 * returns VITE_TMDB_READ_ACCESS_TOKEN (Bearer token).
 */

export default class SearchService extends ApiService {
  /**
   * searchAll - multi-search endpoint that searches Movies, TV shows, and People in a single request.
   *  - /search/multi when `query` provided, otherwise rejects with an error.
   *  - Accepts options for query, include_adult, language, page, and retry.
   *  - Returns a Promise that resolves to an array of results (TvShow & Movie & Person).
   */

  public searchAll(options: SearchOptions): Promise<SearchAllResponse> {
    const { query, include_adult = false, language = 'en-US', page = 1, retry = 0 } = options;
    const params = { query, include_adult, language, page };
    if (!query || query.trim().length === 0) {
      return Promise.reject(new Error('Query is required for search'));
    }
    return this.apiGet<SearchAllResponse>('/search/multi', {
      params,
      retry,
    });
  }
}

/**
 * Default singleton instance of SearchService.
 */

export const searchService = new SearchService(TMDB_CONFIG);

/* ---------------------------------------------------------------------------
   Usage examples
   ---------------------------------------------------------------------------

   // Multi search (Movies, TV shows, People in a single request)
   const search = await searchService.searchAll({ query: 'inception' });

*/