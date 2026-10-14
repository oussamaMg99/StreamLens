import { TFunction } from 'i18next';
import colors from 'src/assets/themes/colors';
import type { Movie } from 'src/core/models/movie.model';
import { UnfinishedCollection } from 'src/utils/collections.utils';

export const TMDB_IMG = 'https://image.tmdb.org/t/p';

export const dimText = 'rgba(255,255,227,0.6)';
export const faintText = 'rgba(255,255,227,0.45)';
export const cardBorder = '1px solid rgba(255,255,255,0.08)';

export const focusRing = (offset: number) => ({
  '&:focus-visible': { outline: `2px solid ${colors.primary.main}`, outlineOffset: offset },
});

export const yearOf = (movie: Movie) => movie.release_date?.slice(0, 4) ?? '';

/** Released parts not watched yet: "3 left". */
export const leftText = (t: TFunction, item: UnfinishedCollection) => t('partsLeft', { count: item.total - item.watched });

/** Visual state of one poster in a strip. */
export type PartState = 'watched' | 'next' | 'todo' | 'coming';

export const partStatusLabel = (t: TFunction, state: PartState) =>
  ({ watched: t('partStatusWatched'), next: t('partStatusNext'), todo: t('partStatusTodo'), coming: t('partStatusComing') })[state];

/** Released parts, then upcoming ones, each tagged with how it should look. */
export const stripParts = (item: UnfinishedCollection) => [
  ...item.parts.map(part => ({
    movie: part.movie,
    number: part.number,
    state: (part.watched ? 'watched' : part.movie.id === item.next.id ? 'next' : 'todo') as PartState,
  })),
  ...item.upcoming.map((movie, index) => ({ movie, number: item.parts.length + index + 1, state: 'coming' as PartState })),
];
