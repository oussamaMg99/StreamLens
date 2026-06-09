// src/core/hooks/usePopularTvShows.ts
import { useQuery } from '@tanstack/react-query';
import { tvService, TvListResponse } from 'src/core/services/tv.service';

const POPULAR_TV_KEY = ['popular-tv'];

export function usePopularTvShows(page = 1) {
  return useQuery<TvListResponse>({
    queryKey: [...POPULAR_TV_KEY, page],
    queryFn: (): Promise<TvListResponse> => tvService.getPopularTV(page),
    staleTime: 1000 * 60 * 5,
  });
}
