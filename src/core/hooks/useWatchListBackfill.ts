// src/core/hooks/useWatchListBackfill.ts
//
// One-time migration — removable once every stored list has been backfilled (no entry
// matches needsBackfill any more). Watch-list entries saved before they carried
// metadata (genre_ids, runtime / episode_counts / minutes_watched) are filled in here
// from their TMDB details, in one transaction, the first time Insights is opened.
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { UseQueryResult, useQueries, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import AppContext from 'src/core/context/global/AppContext';
import { WatchListEntry } from 'src/core/models/watchList.model';
import { WATCH_LIST_QUERY_ROOT, backfillEntryMeta } from 'src/core/services/watchList.service';
import { BackfillPatch, backfillPatchFromDetails, needsBackfill, watchListEntryId } from 'src/utils/watchListMeta.utils';
import { MediaDetailsResult, mediaDetailsQueryOptions } from './useMediaDetails';

/**
 * Backfills the legacy entries of `entries` (no-op when there are none, the normal case).
 * `pending` stays true until the attempt finishes and the list has been refetched, so
 * Insights never renders half-migrated stats. A failure is logged and not retried in
 * this session; the next visit tries again.
 */
export function useWatchListBackfill(entries: WatchListEntry[] | undefined, enabled: boolean): { pending: boolean } {
  const { user } = useContext(AppContext);
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  const legacy = useMemo(() => (entries ?? []).filter(needsBackfill), [entries]);

  const combine = useCallback(
    (results: UseQueryResult<MediaDetailsResult>[]) => ({
      // A failed lookup (e.g. a title removed from TMDB) isn't pending; it just gets no patch.
      settled: results.every(result => !result.isPending),
      patches: Object.fromEntries(
        results.flatMap((result, index): [string, BackfillPatch][] =>
          result.data ? [[watchListEntryId(legacy[index]), backfillPatchFromDetails(legacy[index], result.data)]] : [],
        ),
      ),
    }),
    [legacy],
  );
  const details = useQueries({
    queries: legacy.map(entry => ({ ...mediaDetailsQueryOptions(entry, i18n.language), enabled })),
    combine,
  });

  const started = useRef(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!enabled || !user || !legacy.length || !details.settled || started.current) return;
    started.current = true;
    const uid = user.uid;
    const run = async () => {
      try {
        if (Object.keys(details.patches).length) {
          await backfillEntryMeta(uid, details.patches);
          // Awaited so `pending` only clears once the migrated list is in the cache.
          await queryClient.invalidateQueries({ queryKey: [WATCH_LIST_QUERY_ROOT, uid] });
        }
      } catch (error) {
        console.error('Watch-list metadata backfill failed', error);
      } finally {
        setFinished(true);
      }
    };
    void run();
  }, [enabled, user, legacy.length, details.settled, details.patches, queryClient]);

  return { pending: enabled && legacy.length > 0 && !finished };
}
