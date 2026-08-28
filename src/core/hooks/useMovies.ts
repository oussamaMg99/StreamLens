// src/core/hooks/useMovies.ts
import { useQuery } from '@tanstack/react-query';
import { movieService, MovieListResponse, GetMovieOptions } from 'src/core/services/movie.service';

/**
 * useMovies - browse and search movies through one hook.
 *
 * Backed by movieService.getMovies(options), which already picks the right TMDB
 * endpoint (/search/movie, /discover/movie, or /movie/popular) based on `options`.
 * Callers on the same page (a default browse view and a search bar) share one
 * queryKey shape here instead of each hand-rolling their own useQuery call.
 */
export function useMovies(options: GetMovieOptions = {}) {
  return useQuery<MovieListResponse>({
    queryKey: ['movies', options],
    queryFn: (): Promise<MovieListResponse> => movieService.getMovies(options),
    staleTime: 1000 * 60 * 5,
  });
}