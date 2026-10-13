// src/core/hooks/useWatchListBoard.ts
import { useContext, useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import AppContext from 'src/core/context/global/AppContext';
import { MediaDetailsResult, mediaDetailsQueryOptions } from 'src/core/hooks/useMediaDetails';
import { useGenres } from 'src/core/hooks/useGenres';
import { useWatchList } from 'src/core/hooks/useWatchList';
import { useWatchListGate } from 'src/core/hooks/useWatchListGate';
import { WatchListEntry } from 'src/core/models/watchList.model';
import { BoardColumn, BoardFilters, DEFAULT_BOARD_FILTERS } from 'src/core/models/watchListBoard.model';
import {
  buildBoardItems,
  filterCounts,
  genreOptions,
  isFiltered,
  matchesFilters,
  nextFilters,
  sortItems,
  visibleColumns,
} from 'src/utils/watchListBoard.utils';

const NO_ENTRIES: WatchListEntry[] = [];
// Module-level so useQueries can keep the combined array stable between renders.
const dataOnly = (results: { data?: MediaDetailsResult }[]) => results.map(result => result.data);

/**
 * useWatchListBoard - everything the Watch list page renders.
 *
 * One Firestore read (the list), one details query per entry for the localized title and
 * poster (same cache keys as useMediaDetails, so the Summary modal opens without a
 * refetch), and the two genre lists. Status, progress and the next episode come from the
 * entry alone (watched + episode_counts).
 */
export function useWatchListBoard() {
  const { user } = useContext(AppContext);
  const { access, promptIfBlocked } = useWatchListGate();
  const { i18n } = useTranslation();
  const ready = access === 'ready';

  const { data: watchList, isPending: listPending } = useWatchList(user?.uid, { enabled: ready });
  const entries = watchList?.watch_list ?? NO_ENTRIES;
  const details = useQueries({
    queries: entries.map(entry => ({ ...mediaDetailsQueryOptions(entry, i18n.language), enabled: ready })),
    combine: dataOnly,
  });
  const movieGenres = useGenres('movie');
  const tvGenres = useGenres('tv');

  const [filters, setFilters] = useState<BoardFilters>(DEFAULT_BOARD_FILTERS);
  const updateFilters = (change: Partial<BoardFilters>) => setFilters(current => nextFilters(current, change));
  const resetFilters = () => setFilters(current => ({ ...DEFAULT_BOARD_FILTERS, sort: current.sort }));

  const items = useMemo(
    () =>
      buildBoardItems(
        entries,
        index => details[index],
        (type, id) => (type === 'movie' ? movieGenres.names : tvGenres.names).get(id),
      ),
    [entries, details, movieGenres.names, tvGenres.names],
  );

  const derived = useMemo(() => {
    const sorted = sortItems(
      items.filter(item => matchesFilters(item, filters, { status: true })),
      filters.sort,
      i18n.language,
    );
    const columns: BoardColumn[] = visibleColumns(filters).map(status => ({
      status,
      items: sorted.filter(item => item.status === status),
    }));
    return {
      columns,
      /** Mobile: one list, the status filter applied. */
      list: sorted.filter(item => filters.status === 'all' || item.status === filters.status),
      hasMatches: sorted.length > 0,
      counts: filterCounts(items, filters),
      genres: genreOptions(items, i18n.language),
      stats: {
        saved: items.length,
        inProgress: items.filter(item => item.status === 'inProgress').length,
        watched: items.filter(item => item.status === 'watched').length,
      },
    };
  }, [items, filters, i18n.language]);

  return {
    access,
    promptIfBlocked,
    isLoading: access === 'loading' || (ready && (listPending || movieGenres.isPending || tvGenres.isPending)),
    isEmpty: ready && !listPending && entries.length === 0,
    filters,
    isFiltered: isFiltered(filters),
    updateFilters,
    resetFilters,
    ...derived,
  };
}
