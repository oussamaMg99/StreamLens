// src/core/hooks/useInsightsSummary.ts
import { InsightsSummary } from 'src/core/models/insights.model';
import { EMPTY_INSIGHTS, INSIGHTS_MOCK_SCENARIO, MOCK_INSIGHTS } from 'src/core/mocks/insights.mock';
import { useWatchListGate } from './useWatchListGate';

/**
 * useInsightsSummary - everything the Insights page renders, already aggregated.
 *
 * Mock-backed for prototyping. The real version derives the same shape from
 * useWatchList + useMediaDetails/season details:
 *   movies          → entries where media_type === 'movie' && watched
 *   tvShows         → tv entries with any non-empty watched[season]
 *   seasonsFinished → watched[season].length === Season.episode_count
 *   hoursWatched    → sum of movie runtime + watched episode runtimes
 *   topGenres       → genre counts per media type, top 3
 * Keep the return shape and the page won't need to change.
 *
 * Everything here comes from the watch list, which firestore.rules only lets a verified
 * owner read — so it stays empty until the gate says 'ready'. The real queries should
 * take `enabled: access === 'ready'` for the same reason.
 */
export function useInsightsSummary(): { data: InsightsSummary; isLoading: boolean } {
  const { access } = useWatchListGate();
  const ready = access === 'ready';
  return {
    data: ready && INSIGHTS_MOCK_SCENARIO === 'full' ? MOCK_INSIGHTS : EMPTY_INSIGHTS,
    isLoading: access === 'loading',
  };
}
