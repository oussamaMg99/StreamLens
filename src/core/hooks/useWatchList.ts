// src/core/hooks/useWatchList.ts
import { useQuery } from '@tanstack/react-query';
import { getWatchList } from 'src/core/services/watchList.service';
import { WatchListResponse } from 'src/core/models/watchList.model';

/**
 * useWatchList - the signed-in user's watch list.
 *
 * The key is scoped by uid so one account's cached list can't be handed to the next one
 * after a re-login, and the query stays dormant until there's a user, so signed-out
 * visitors never fire an unauthorised Firestore read.
 */
export function useWatchList(uid?: string, queryOptions?: { enabled?: boolean }) {
  return useQuery<WatchListResponse>({
    queryKey: ['watch-list', uid],
    queryFn: () => getWatchList(uid as string),
    staleTime: 1000 * 60 * 5,
    enabled: (queryOptions?.enabled ?? true) && uid !== undefined,
  });
}
