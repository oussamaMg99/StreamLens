// src/core/hooks/useWatchingRhythm.ts
import { useMemo } from 'react';
import { WatchListEntry } from 'src/core/models/watchList.model';
import {
  RhythmSummary,
  buildRhythm,
  dailyCountsFromTitles,
  dailyTitlesFromEntries,
  localDayKey,
  trackingSince,
} from 'src/utils/rhythm.utils';

/**
 * useWatchingRhythm - the "Watching rhythm" numbers for the last `weeks` weeks.
 * Computed on the device from the already-loaded watch list (each entry's watched_at,
 * read by dailyTitlesFromEntries): no extra reads. `rhythm` is undefined when nothing is
 * dated yet, and the section hides.
 */
export function useWatchingRhythm(args: { entries: WatchListEntry[] | undefined; weeks: number }) {
  const { entries, weeks } = args;
  return useMemo(() => {
    const now = new Date();
    const titles = dailyTitlesFromEntries(entries ?? [], now);
    const days = dailyCountsFromTitles(titles);
    const since = trackingSince(days);
    if (!since) return { rhythm: undefined as RhythmSummary | undefined, since: undefined };
    return { rhythm: buildRhythm(days, localDayKey(now), weeks, titles), since };
  }, [entries, weeks]);
}
