export enum MediaType {
  Movie = 'movie',
  TVShow = 'tv',
}

/** Localized genre name for a TMDB id; undefined when the genre list doesn't have it. */
export type GenreNameLookup = (type: 'movie' | 'tv', id: number) => string | undefined;
