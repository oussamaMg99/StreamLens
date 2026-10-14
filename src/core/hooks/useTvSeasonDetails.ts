// src/core/hooks/useTvSeasonDetails.ts
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { tvService } from 'src/core/services/tv.service';
import { SeasonDetails } from 'src/core/models/seasonDetails.model';

/**
 * useTvSeasonDetails - fetch a single season's episode list (tvService.getSeasonDetails),
 * for the Episodes tab. Stays dormant (via `enabled`) until both tvId and seasonNumber
 * are known, e.g. before a show/season has been picked yet.
 */
export function useTvSeasonDetails(tvId?: number, seasonNumber?: number, queryOptions?: { enabled?: boolean }) {
  // Episode names and overviews are localized, so the language belongs in the key.
  const { i18n } = useTranslation();

  return useQuery<SeasonDetails>({
    queryKey: ['tv-season', tvId, seasonNumber, i18n.language],
    queryFn: () => tvService.getSeasonDetails(tvId as number, seasonNumber as number, { language: i18n.language }),
    staleTime: 1000 * 60 * 5,
    enabled: (queryOptions?.enabled ?? true) && tvId !== undefined && seasonNumber !== undefined,
  });
}
