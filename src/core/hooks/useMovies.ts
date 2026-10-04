// src/core/hooks/useMovies.ts
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { movieService, MovieListResponse, GetMovieOptions } from 'src/core/services/movie.service';

/**
 * useMovies - browse and search movies through one hook.
 *
 * Backed by movieService.getMovies(options), which already picks the right TMDB
 * endpoint (/search/movie, /discover/movie, or /movie/popular) based on `options`.
 * Callers on the same page (a default browse view and a search bar) share one
 * queryKey shape here instead of each hand-rolling their own useQuery call.
 */
export function useMovies(options: GetMovieOptions = {}, queryOptions?: { enabled?: boolean }) {
  // TMDB localizes titles and overviews, so the UI language is part of the request and
  // therefore part of the key — otherwise switching language serves the cached
  // translation. An explicit options.language still wins.
  const { i18n } = useTranslation();
  const language = options.language ?? i18n.language;

  return useQuery<MovieListResponse>({
    queryKey: ['movies', { ...options, language }],
    queryFn: (): Promise<MovieListResponse> => movieService.getMovies({ ...options, language }),
    staleTime: 1000 * 60 * 5,
    enabled: queryOptions?.enabled,
  });
}
