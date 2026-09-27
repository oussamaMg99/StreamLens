// src/core/hooks/useWatchListMutations.ts
//
// Write side of the watch list, one hook per service function. Components call these
// rather than the service directly: the hook supplies the uid, refreshes the cached list
// so every view of it updates, reports failures through the global snackbar, and exposes
// isPending for disabling the control mid-write.

import { useContext } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import AppContext from 'src/core/context/global/AppContext';
import {
  WATCH_LIST_QUERY_ROOT,
  addToWatchList,
  removeEntry,
  setEpisodeWatched,
  setMovieWatched,
} from 'src/core/services/watchList.service';
import { WatchListEntry } from 'src/core/models/watchList.model';

/**
 * Shared wiring for every watch-list mutation: run `write` for the signed-in user, then
 * invalidate that user's list so readers refetch. Signed out it rejects instead of
 * writing — callers gate on `user` and prompt sign-in, so this is a guard, not a path
 * users hit.
 */
const useWatchListMutation = <TVariables>(write: (uid: string, variables: TVariables) => Promise<void>) => {
  const { user, setSnackBarProps } = useContext(AppContext);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: TVariables) => {
      if (!user) return Promise.reject(new Error('Not signed in'));
      return write(user.uid, variables);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [WATCH_LIST_QUERY_ROOT, user?.uid] }),
    onError: () => setSnackBarProps({ open: true, severity: 'error', message: t('errorOccurred') }),
  });
};

type EntryRef = Pick<WatchListEntry, 'media_type' | 'id'>;

/** Adds a title with no progress yet. */
export const useAddToWatchList = () => useWatchListMutation<EntryRef>((uid, entry) => addToWatchList(uid, entry));

/** Removes a title and its progress. */
export const useRemoveFromWatchList = () => useWatchListMutation<EntryRef>((uid, entry) => removeEntry(uid, entry));

export const useSetMovieWatched = () =>
  useWatchListMutation<{ id: number; watched: boolean }>((uid, { id, watched }) => setMovieWatched(uid, id, watched));

export const useSetEpisodeWatched = () =>
  useWatchListMutation<{ tvId: number; season: number; episode: number; watched: boolean }>((uid, { tvId, season, episode, watched }) =>
    setEpisodeWatched(uid, tvId, season, episode, watched),
  );
