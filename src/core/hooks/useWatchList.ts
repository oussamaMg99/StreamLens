// src/core/hooks/useWatchList.ts
import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WATCH_LIST_QUERY_ROOT, getWatchList } from 'src/core/services/watchList.service';
import { WatchListEntry, WatchListResponse } from 'src/core/models/watchList.model';
import AppContext from 'src/core/context/global/AppContext';

/**
 * useWatchList - the signed-in user's watch list.
 *
 * The key is scoped by uid so one account's cached list can't be handed to the next one
 * after a re-login, and the query stays dormant until there's a user, so signed-out
 * visitors never fire an unauthorised Firestore read.
 */
export function useWatchList(uid?: string, queryOptions?: { enabled?: boolean }) {
  return useQuery<WatchListResponse>({
    queryKey: [WATCH_LIST_QUERY_ROOT, uid],
    queryFn: () => getWatchList(uid as string),
    staleTime: 1000 * 60 * 5,
    enabled: (queryOptions?.enabled ?? true) && uid !== undefined,
  });
}

/**
 * The signed-in user's entry for one title, or undefined when it isn't on the list (or
 * nobody is signed in). Saves every caller from repeating the uid + find dance.
 */
export function useWatchListEntry(item?: Pick<WatchListEntry, 'media_type' | 'id'>) {
  const { user } = useContext(AppContext);
  const { data } = useWatchList(user?.uid);
  if (!item) return undefined;
  return data?.watch_list.find(entry => entry.media_type === item.media_type && entry.id === item.id);
}
