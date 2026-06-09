import { useQuery } from '@tanstack/react-query';
import { movieService, MovieListResponse } from 'src/core/services/movie.service';

const POPULAR_MOVIES_KEY = ['popular-movies'];

export function usePopularMovies(page = 1) {
  return useQuery({
    queryKey: [...POPULAR_MOVIES_KEY, page],
    queryFn: (): Promise<MovieListResponse> => movieService.getPopularMovie(page),
    staleTime: 1000 * 60 * 5,
  });
}
