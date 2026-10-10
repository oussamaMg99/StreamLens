// src/core/hooks/useHiddenGems.ts
import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { InsightsSummary } from 'src/core/models/insights.model';
import { Movie, movieService } from 'src/core/services/movie.service';
import { TvShow, tvService } from 'src/core/services/tv.service';
import { watchListEntryId } from 'src/core/services/watchList.service';
import { EXCLUDED_KEYWORD_IDS } from 'src/utils/constants';

export type HiddenGem = Movie | TvShow;

/** What makes a gem: a high score from a small audience. */
export const GEM_FILTERS = { vote_average_gte: 7.5, vote_count_gte: 50, vote_count_lte: 1000 } as const;

/**
 * Gems must have been out at least this long: a brand-new title's score comes from its
 * first few fans, and it's often already in the popular rows of "Picked for you".
 */
const MIN_AGE_MONTHS = 6;

/** Local YYYY-MM-DD, MIN_AGE_MONTHS ago (the format TMDB date filters take). */
const releasedBefore = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - MIN_AGE_MONTHS);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

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
 * useHiddenGems - highly rated, little-known movies and shows from the user's top genres,
 * movies and TV mixed in one list. "Picked for you" shows the popular titles of the same
 * genres; this is the less-seen side of them.
 *
 * One /discover call per type: score ≥ 7.5, 50–1000 votes, out for at least
 * MIN_AGE_MONTHS, in any of that type's top genres (pipe-joined with_genres means OR; a
 * comma would require every genre at once), and carrying none of EXCLUDED_KEYWORD_IDS.
 * A type with no top genres is skipped. Results
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
  const movieGenres = topGenres.movie.map(genre => genre.id).join('|');
  const tvGenres = topGenres.tv.map(genre => genre.id).join('|');
  const movieEnabled = enabled && !!movieGenres;
  const tvEnabled = enabled && !!tvGenres;
  const filters = {
    ...GEM_FILTERS,
    released_before: releasedBefore(),
    without_keywords: EXCLUDED_KEYWORD_IDS,
    sort_by: 'vote_average.desc',
    language,
  };

  const [movies, shows] = useQueries({
    queries: [
      {
        queryKey: ['hidden-gems', 'movie', movieGenres, filters],
        queryFn: () => movieService.discoverMovies({ ...filters, with_genres: movieGenres }),
        staleTime: 1000 * 60 * 5,
        enabled: movieEnabled,
      },
      {
        queryKey: ['hidden-gems', 'tv', tvGenres, filters],
        queryFn: () => tvService.discoverTV({ ...filters, with_genres: tvGenres }),
        staleTime: 1000 * 60 * 5,
        enabled: tvEnabled,
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

  // A skipped query stays isPending forever, so only the enabled ones count.
  const isLoading = (movieEnabled && movies.isPending) || (tvEnabled && shows.isPending);
  return { spotlight: isLoading ? undefined : ranked[0], gems: isLoading ? [] : ranked.slice(1), isLoading };
}
