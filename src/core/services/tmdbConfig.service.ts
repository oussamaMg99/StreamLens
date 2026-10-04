// src/core/services/tmdbConfig.service.ts
//
// TMDB's /configuration/* endpoints: reference data that isn't tied to a media type, so
// it sits here rather than on TmdbListService — on that class it would exist twice, once
// per subclass, returning the same payload and caching it separately.
//
// This data changes a few times a year, so consumers should use a much longer staleTime
// than the app's usual 5 minutes.

import { ApiService } from './api.service';
import { TMDB_CONFIG } from './tmdb.config';

/** One entry of /configuration/languages. */
export type TmdbLanguage = {
  iso_639_1: string;
  english_name: string;
  /**
   * The endonym, and often an empty string in TMDB's data (e.g. Fijian). Fall back to
   * `english_name` when rendering, or rows come out blank.
   */
  name: string;
};

/** One entry of /configuration/countries. */
export type TmdbCountry = {
  iso_3166_1: string;
  english_name: string;
  /** The field the `language` param localizes; `english_name` stays English. */
  native_name: string;
};

export default class TmdbConfigService extends ApiService {
  /** The ISO 639-1 languages TMDB knows about. Not localized — names come as-is.
   * @returns A promise resolving to the list of languages.
   */
  public getLanguages(): Promise<TmdbLanguage[]> {
    return this.apiGet<TmdbLanguage[]>('/configuration/languages', { retry: 0 });
  }

  /** The TMDB-provided list of ISO 3166-1 countries.
   * @param language - The language for the country names (defaults to 'en').
   * @returns A promise resolving to the list of countries.
   */
  public getCountries(language = 'en'): Promise<TmdbCountry[]> {
    return this.apiGet<TmdbCountry[]>('/configuration/countries', { params: { language }, retry: 0 });
  }
}

/**
 * Default singleton instance of TmdbConfigService.
 */
export const tmdbConfigService = new TmdbConfigService(TMDB_CONFIG);
