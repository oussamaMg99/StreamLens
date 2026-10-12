// src/core/hooks/useGenres.ts
import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { movieService } from 'src/core/services/movie.service';
import { tvService } from 'src/core/services/tv.service';

/** TMDB's genre lists practically never change. */
const GENRES_STALE_TIME = 1000 * 60 * 60 * 24;

const fetchGenres = (type: 'movie' | 'tv', language: string) =>
  type === 'movie' ? movieService.getMovieGenres(language) : tvService.getTvGenres(language);

/**
 * useGenres - TMDB genre id → name for one media type, in the UI language.
 *
 * The watch list stores genre ids only (names would freeze in the language they were
 * saved in), so this is where they become text. Two details:
 * - keepPreviousData: on a language switch the old names stay up until the new list
 *   lands, instead of the caller dropping back to a loading state.
 * - TMDB returns an empty name for genres it hasn't translated (Arabic, mostly); those
 *   fall back to the English list, fetched only when the UI isn't already English.
 */
export function useGenres(type: 'movie' | 'tv') {
  const { i18n } = useTranslation();
  const language = i18n.language;

  const localized = useQuery({
    queryKey: ['genres', type, language],
    queryFn: () => fetchGenres(type, language),
    staleTime: GENRES_STALE_TIME,
    placeholderData: keepPreviousData,
  });
  const english = useQuery({
    queryKey: ['genres', type, 'en'],
    queryFn: () => fetchGenres(type, 'en'),
    staleTime: GENRES_STALE_TIME,
    enabled: language !== 'en',
  });

  const names = useMemo(() => {
    const map = new Map<number, string>();
    for (const genre of english.data?.genres ?? []) map.set(genre.id, genre.name);
    for (const genre of localized.data?.genres ?? []) if (genre.name) map.set(genre.id, genre.name);
    return map;
  }, [english.data, localized.data]);

  // Pending only on the very first load: placeholder data keeps it false on a switch.
  return { names, isPending: localized.isPending };
}
