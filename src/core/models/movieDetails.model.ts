import { Genre, ProductionCompany, ProductionCountry, SpokenLanguage, Videos, Crew, Images } from './common.model';

export interface BelongsToCollection {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
}

/**
 * Fields always present on a plain `/movie/{id}` response, with no `append_to_response`.
 */
export interface MovieDetailsBase {
  adult: boolean;
  backdrop_path: string;
  belongs_to_collection: BelongsToCollection;
  budget: number;
  genres: Genre[];
  homepage: string;
  id: number;
  imdb_id: string;
  origin_country: string[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  release_date: string;
  revenue: number;
  runtime: number;
  softcore: boolean;
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

/**
 * Full `/movie/{id}` response shape. `videos`/`credits`/`images` are each only present
 * when their name is included in the `append_to_response` query param (see
 * MovieService.getMovieById / TmdbListService.byId, where it's an optional argument) —
 * marked optional here so a call made without requesting them doesn't get typed as if
 * they were guaranteed.
 */
export interface MovieDetails extends MovieDetailsBase {
  videos?: Videos;
  credits?: Credits;
  images?: Images;
}

// Movie-specific: TMDB's movie cast entries carry a `cast_id` (and an optional
// `profile_path`) that TV cast entries don't — see common.model.ts for the fragments
// (Videos/Result/Crew/Images/Backdrop/Logo/Poster) that are identical between the two.
export interface Credits {
  cast: Cast[];
  crew: Crew[];
}

export interface Cast {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path?: string;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}
