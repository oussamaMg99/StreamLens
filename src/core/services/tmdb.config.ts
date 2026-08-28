import { ApiServiceConfig } from './api.service';

/**
 * Shared bootstrap config for every TMDB v3 service singleton.
 *
 * - Authentication is via Authorization: Bearer <VITE_TMDB_READ_ACCESS_TOKEN>.
 * - defaultParams stays empty because api_key is not used when using Bearer auth.
 */
export const TMDB_CONFIG: ApiServiceConfig = {
  baseURL: 'https://api.themoviedb.org/3',
  defaultParams: {},
  tokenProvider: () => {
    return import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN ?? null;
  },
  timeout: 15_000,
};