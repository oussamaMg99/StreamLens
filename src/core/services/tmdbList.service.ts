// src/core/services/tmdbList.service.ts

import { ApiService } from './api.service';
import { Media, MediaDetails } from '../models/common.model';

/**
 * Shared TMDB v3 "list" envelope shape, returned by /popular, /search/*, and /discover/*.
 */
export type TmdbListResponse<TItem> = {
  page: number;
  results: TItem[];
  total_pages: number;
  total_results: number;
};

/**
 * Options accepted by the smart list()/discoverDirect() wrappers.
 *
 * `region` only applies to endpoints that support it (currently movie); subclasses
 * that don't support it simply never populate/forward the field.
 */
export type TmdbListParams = {
  page?: number;
  language?: string;
  query?: string;
  with_genres?: number[] | string;
  sort_by?: string;
  include_adult?: boolean;
  region?: string;
  retry?: number;
};

/**
 * TmdbListService - shared base for TMDB "media list" endpoints (movie/tv).
 *
 * Holds the logic that was previously duplicated between MovieService and TvService:
 * discover-filter detection, `with_genres` joining, and param building for the
 * popular/search/discover/by-id endpoints. Subclasses set `mediaType` and expose
 * their own public method names that delegate to these protected helpers.
 */
export abstract class TmdbListService<TItem extends Media, TDetails extends MediaDetails> extends ApiService {
  protected abstract readonly mediaType: 'movie' | 'tv';

  /**
   * tagResults - TMDB's raw list-endpoint JSON never includes media_type; stamp it on
   * every result using the field this class already knows (this.mediaType), once, here,
   * instead of every page/component re-deriving it after the fact.
   */
  private tagResults(response: TmdbListResponse<Omit<TItem, 'media_type'>>): TmdbListResponse<TItem> {
    return {
      ...response,
      results: response.results.map(item => ({ ...item, media_type: this.mediaType }) as TItem),
    };
  }

  /**
   * list - flexible method that picks an endpoint:
   *  - /search/{mediaType} when `query` provided
   *  - /discover/{mediaType} when discover-like options provided (with_genres, sort_by)
   *  - /{mediaType}/popular otherwise
   */
  protected async list(options: TmdbListParams = {}): Promise<TmdbListResponse<TItem>> {
    const { page = 1, language = 'en-US', query, with_genres, sort_by, include_adult = false, region, retry = 0 } = options;

    const params: Record<string, any> = {
      page,
      language,
      include_adult,
    };

    if (region) params.region = region;

    if (query && query.trim().length > 0) {
      params.query = query.trim();
      const response = await this.apiGet<TmdbListResponse<Omit<TItem, 'media_type'>>>(`/search/${this.mediaType}`, {
        params,
        retry,
      });
      return this.tagResults(response);
    }

    const hasDiscoverFilters = (Array.isArray(with_genres) && with_genres.length > 0) || typeof with_genres === 'string' || !!sort_by;

    if (hasDiscoverFilters) {
      if (with_genres) {
        params.with_genres = Array.isArray(with_genres) ? with_genres.join(',') : with_genres;
      }
      if (sort_by) params.sort_by = sort_by;

      const response = await this.apiGet<TmdbListResponse<Omit<TItem, 'media_type'>>>(`/discover/${this.mediaType}`, {
        params,
        retry,
      });
      return this.tagResults(response);
    }

    return this.popular(page, { language, region, retry });
  }

  /**
   * popular - convenience wrapper for /{mediaType}/popular
   */
  protected async popular(
    page = 1,
    opts: { language?: string; region?: string; retry?: number } = {},
  ): Promise<TmdbListResponse<TItem>> {
    const { language = 'en-US', region, retry = 0 } = opts;
    const params: Record<string, any> = { page, language };
    if (region) params.region = region;
    const response = await this.apiGet<TmdbListResponse<Omit<TItem, 'media_type'>>>(`/${this.mediaType}/popular`, {
      params,
      retry,
    });
    return this.tagResults(response);
  }

  /**
   * byId - fetch details by id
   *
   * @param id - TMDB id
   * @param appendToResponse - optional comma-separated string to append related data
   *                            (e.g., 'videos,credits,images')
   */
  protected async byId(id: number | string, appendToResponse?: string): Promise<TDetails> {
    const params: Record<string, any> = {};
    if (appendToResponse) params.append_to_response = appendToResponse;
    const details = await this.apiGet<Omit<TDetails, 'media_type'>>(`/${this.mediaType}/${id}`, {
      params,
      retry: 0,
    });
    return { ...details, media_type: this.mediaType } as TDetails;
  }

  /**
   * searchDirect - direct search convenience wrapper
   */
  protected async searchDirect(
    query: string,
    page = 1,
    opts: { language?: string; include_adult?: boolean; region?: string; retry?: number } = {},
  ): Promise<TmdbListResponse<TItem>> {
    const { language = 'en-US', include_adult = false, region, retry = 0 } = opts;
    const params: Record<string, any> = { query: query.trim(), page, language, include_adult };
    if (region) params.region = region;
    const response = await this.apiGet<TmdbListResponse<Omit<TItem, 'media_type'>>>(`/search/${this.mediaType}`, {
      params,
      retry,
    });
    return this.tagResults(response);
  }

  /**
   * discoverDirect - direct discover wrapper with flexible options
   */
  protected async discoverDirect(options: TmdbListParams = {}): Promise<TmdbListResponse<TItem>> {
    const { page = 1, language = 'en-US', with_genres, sort_by, include_adult = false, region, retry = 0 } = options;

    const params: Record<string, any> = {
      page,
      language,
      include_adult,
    };

    if (region) params.region = region;
    if (with_genres) params.with_genres = Array.isArray(with_genres) ? with_genres.join(',') : with_genres;
    if (sort_by) params.sort_by = sort_by;

    const response = await this.apiGet<TmdbListResponse<Omit<TItem, 'media_type'>>>(`/discover/${this.mediaType}`, {
      params,
      retry,
    });
    return this.tagResults(response);
  }
}