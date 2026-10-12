// src/core/hooks/useUnfinishedCollections.ts
import { useMemo } from 'react';
import { UseQueryResult, useQueries } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { WatchListEntry } from 'src/core/models/watchList.model';
import { Collection } from 'src/core/models/collection.model';
import { movieService } from 'src/core/services/movie.service';
import { UnfinishedCollection, unfinishedCollections, watchedCollectionIds } from 'src/utils/collections.utils';

/** Today as a local YYYY-MM-DD, the format TMDB release dates use. */
const localToday = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

/** Module-level so it's stable: TanStack re-runs an inline combine on every render. */
const combineCollections = (results: UseQueryResult<Collection>[]) => ({
  // A failed series lookup just drops that series from the section.
  data: results.flatMap(result => (result.data ? [result.data] : [])),
  pending: results.some(result => result.isPending),
});

/**
 * useUnfinishedCollections - the film series the user has started but not finished, for
 * "Finish the collection".
 *
 * Which series to look at comes from the watch list alone: each watched movie entry
 * stores its collection_id. Only the series themselves are fetched (/collection/{id}),
 * one cached call per distinct series, in the UI language so names and titles are
 * localized. unfinishedCollections does the counting.
 */
export function useUnfinishedCollections(
  args: { entries: WatchListEntry[] | undefined },
  queryOptions?: { enabled?: boolean },
): { items: UnfinishedCollection[]; isLoading: boolean } {
  const { entries } = args;
  const enabled = (queryOptions?.enabled ?? true) && !!entries;
  const { i18n } = useTranslation();
  const language = i18n.language;
  const ids = useMemo(() => watchedCollectionIds(entries ?? []), [entries]);

  const collections = useQueries({
    queries: ids.map(id => ({
      queryKey: ['collection', id, language],
      queryFn: () => movieService.getCollection(id, { language }),
      staleTime: 1000 * 60 * 5,
      enabled,
    })),
    combine: combineCollections,
  });

  const items = useMemo(() => (entries ? unfinishedCollections(entries, collections.data, localToday()) : []), [entries, collections.data]);

  const isLoading = enabled && collections.pending;
  return { items: isLoading ? [] : items, isLoading };
}
