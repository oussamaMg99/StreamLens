// src/core/hooks/useInsightsSummary.ts
import { useContext, useMemo } from 'react';
import AppContext from 'src/core/context/global/AppContext';
import { EMPTY_INSIGHTS, InsightsSummary } from 'src/core/models/insights.model';
import { buildInsightsSummary } from 'src/utils/insights.utils';
import { useGenres } from './useGenres';
import { useWatchList } from './useWatchList';
import { useWatchListBackfill } from './useWatchListBackfill';
import { useWatchListGate } from './useWatchListGate';

/**
 * useInsightsSummary - everything the Insights page renders, already aggregated.
 *
 * One Firestore read plus the two (long-cached) genre lists: every watch-list entry
 * carries the metadata Insights needs, captured when it was written, and
 * buildInsightsSummary does the counting. Older entries without that metadata are
 * migrated once by useWatchListBackfill, which holds the loading state until it's done.
 *
 * The watch list is only readable by a verified owner (firestore.rules), so nothing is
 * fetched until the gate says 'ready'; until then the summary is EMPTY_INSIGHTS.
 */
export function useInsightsSummary(): { data: InsightsSummary; isLoading: boolean } {
  const { user } = useContext(AppContext);
  const { access } = useWatchListGate();
  const ready = access === 'ready';

  const { data: watchList, isPending: listPending } = useWatchList(user?.uid, { enabled: ready });
  const entries = watchList?.watch_list;
  const movieGenres = useGenres('movie');
  const tvGenres = useGenres('tv');
  const backfill = useWatchListBackfill(entries, ready);

  const data = useMemo(() => {
    if (!ready || !entries) return EMPTY_INSIGHTS;
    return buildInsightsSummary(entries, (type, id) => (type === 'movie' ? movieGenres.names : tvGenres.names).get(id));
  }, [ready, entries, movieGenres.names, tvGenres.names]);

  return {
    data,
    isLoading: access === 'loading' || (ready && (listPending || movieGenres.isPending || tvGenres.isPending || backfill.pending)),
  };
}
