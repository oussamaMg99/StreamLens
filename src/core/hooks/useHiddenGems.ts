// src/core/hooks/useHiddenGems.ts
import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { InsightsSummary } from 'src/core/models/insights.model';
import { Movie, movieService } from 'src/core/services/movie.service';
import { TvShow, tvService } from 'src/core/services/tv.service';
import { watchListEntryId } from 'src/core/services/watchList.service';

export type HiddenGem = Movie | TvShow;

/** What makes a gem: a high score from a small audience. */
export const GEM_FILTERS = { vote_average_gte: 7.5, vote_count_gte: 50, vote_count_lte: 1000 } as const;

/** Spotlight + up to 8 in the grid. */
const MAX_GEMS = 9;

interface HiddenGemsResult {
  /** The #1 gem. Undefined when there's nothing to show (the section hides). */
  spotlight?: HiddenGem;
  /** The rest, best first, at most 8. */
  gems: HiddenGem[];
  isLoading: boolean;
}

/**
 * useHiddenGems - highly rated, little-known movies and shows from outside the user's top
 * genres, movies and TV mixed in one list.
 *
 * One /discover call per type (score ≥ 7.5, 50–1000 votes, top genres excluded). Results
 * are merged, anything already on the watch list is dropped, and they're ranked by score,
 * then by fewer votes. The spotlight is the best-ranked gem that has a backdrop, because
 * the spotlight card needs a landscape image.
 *
 * If one request fails the other still fills the list. If both fail, or nothing is left
 * after filtering, `spotlight` is undefined and the section stays hidden: this is an
 * optional discovery block, not something to show an error for.
 */
export function useHiddenGems(
  args: { topGenres: InsightsSummary['topGenres']; excludeKeys: Set<string> },
  queryOptions?: { enabled?: boolean },
): HiddenGemsResult {
  const { topGenres, excludeKeys } = args;
  const enabled = queryOptions?.enabled ?? true;
  const { i18n } = useTranslation();
  const language = i18n.language;
  const movieExclude = topGenres.movie.map(genre => genre.id);
  const tvExclude = topGenres.tv.map(genre => genre.id);

  const [movies, shows] = useQueries({
    queries: [
      {
        queryKey: ['hidden-gems', 'movie', movieExclude, language],
        queryFn: () =>
          movieService.discoverMovies({ ...GEM_FILTERS, without_genres: movieExclude, sort_by: 'vote_average.desc', language }),
        staleTime: 1000 * 60 * 5,
        enabled,
      },
      {
        queryKey: ['hidden-gems', 'tv', tvExclude, language],
        queryFn: () => tvService.discoverTV({ ...GEM_FILTERS, without_genres: tvExclude, sort_by: 'vote_average.desc', language }),
        staleTime: 1000 * 60 * 5,
        enabled,
      },
    ],
  });

  const ranked = useMemo(() => {
    const pool: HiddenGem[] = [...(movies.data?.results ?? []), ...(shows.data?.results ?? [])];
    const list = pool
      .filter(item => item.poster_path && !excludeKeys.has(watchListEntryId(item)))
      .sort((a, b) => b.vote_average - a.vote_average || a.vote_count - b.vote_count)
      .slice(0, MAX_GEMS);
    const spotlightIndex = list.findIndex(item => item.backdrop_path);
    if (spotlightIndex > 0) list.unshift(...list.splice(spotlightIndex, 1));
    return list;
  }, [movies.data, shows.data, excludeKeys]);

  const isLoading = enabled && (movies.isPending || shows.isPending);
  return { spotlight: isLoading ? undefined : ranked[0], gems: isLoading ? [] : ranked.slice(1), isLoading };
}
