// src/core/hooks/useTvShows.ts
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { tvService, TvListResponse, GetTvOptions } from 'src/core/services/tv.service';

/**
 * useTvShows - browse and search TV shows through one hook.
 *
 * Backed by tvService.getTvShows(options), which already picks the right TMDB
 * endpoint (/search/tv, /discover/tv, or /tv/popular) based on `options`.
 * Callers on the same page (a default browse view and a search bar) share one
 * queryKey shape here instead of each hand-rolling their own useQuery call.
 */
export function useTvShows(options: GetTvOptions = {}, queryOptions?: { enabled?: boolean }) {
  // See useMovies: the UI language is part of the request, so it's part of the key.
  const { i18n } = useTranslation();
  const language = options.language ?? i18n.language;

  return useQuery<TvListResponse>({
    queryKey: ['tv-shows', { ...options, language }],
    queryFn: (): Promise<TvListResponse> => tvService.getTvShows({ ...options, language }),
    staleTime: 1000 * 60 * 5,
    enabled: queryOptions?.enabled,
  });
}
