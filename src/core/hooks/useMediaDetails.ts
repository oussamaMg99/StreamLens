// src/core/hooks/useMediaDetails.ts
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { movieService } from 'src/core/services/movie.service';
import { tvService } from 'src/core/services/tv.service';
import { MovieDetails } from 'src/core/models/movieDetails.model';
import { TVShowDetails } from 'src/core/models/tvShowDetails.model';
import { Media } from 'src/core/models/common.model';

export type MediaDetailsResult = MovieDetails | TVShowDetails | undefined;

/** Root of the details query key, so other code can invalidate or prefetch by it. */
export const MEDIA_DETAILS_QUERY_ROOT = 'media-details';

/** What the endpoints are asked to append; part of the key because it shapes the payload. */
const APPEND_TO_RESPONSE = 'credits,videos,images';

/**
 * Key, fetcher and staleTime of one title's details query. Exported so callers that need
 * many titles at once (useQueries, e.g. useInsightsSummary) hit the very same cache
 * entries as useMediaDetails instead of a parallel key.
 */
export const mediaDetailsQueryOptions = (item: Pick<Media, 'media_type' | 'id'> | undefined, language: string) => ({
  queryKey: [MEDIA_DETAILS_QUERY_ROOT, item?.media_type, item?.id, language, APPEND_TO_RESPONSE],
  queryFn: (): Promise<MediaDetailsResult> => {
    // Branching on media_type rather than isMovie/isTvShow: those guards are typed for
    // whole Movie/TvShow objects, and callers here may hold only { media_type, id } —
    // a watch-list entry, for instance.
    if (!item) return Promise.resolve(undefined);
    if (item.media_type === 'movie') return movieService.getMovieById(item.id, APPEND_TO_RESPONSE, language);
    return tvService.getTVById(item.id, APPEND_TO_RESPONSE, language);
  },
  staleTime: 1000 * 60 * 5,
});

/**
 * useMediaDetails - one title's full details, movie or TV.
 *
 * One query rather than a movie one and a tv one: the key, staleTime and error handling
 * are identical either way — only which endpoint to call differs. The key is shared by
 * every consumer (the Summary modal, the watch list, insights), so a title opened in one
 * is already cached for the others.
 */
export function useMediaDetails(item?: Pick<Media, 'media_type' | 'id'>, queryOptions?: { enabled?: boolean }) {
  // Language is part of the key: overview/tagline (and sometimes the title) come back
  // localized, so a language switch has to refetch rather than reuse the cached copy.
  const { i18n } = useTranslation();

  return useQuery<MediaDetailsResult>({
    ...mediaDetailsQueryOptions(item, i18n.language),
    enabled: (queryOptions?.enabled ?? true) && !!item,
  });
}
