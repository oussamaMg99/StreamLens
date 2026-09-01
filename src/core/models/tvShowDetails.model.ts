import { Genre, ProductionCompany, ProductionCountry, SpokenLanguage, Videos, Crew, Images } from './common.model';

export interface CreatedBy {
  id: number;
  credit_id: string;
  name: string;
  original_name: string;
  gender: number;
  profile_path: string;
}

export interface LastEpisodeToAir {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date: string;
  episode_number: number;
  episode_type: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string;
}

export interface NextEpisodeToAir {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date: string;
  episode_number: number;
  episode_type: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string;
}

export interface Network {
  id: number;
  logo_path: string;
  name: string;
  origin_country: string;
}

export interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  vote_average: number;
}

/**
 * Fields always present on a plain `/tv/{id}` response, with no `append_to_response`.
 */
export interface TVShowDetailsBase {
  adult: boolean;
  backdrop_path: string;
  created_by: CreatedBy[];
  episode_run_time: any[];
  first_air_date: string;
  genres: Genre[];
  homepage: string;
  id: number;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: LastEpisodeToAir;
  name: string;
  next_episode_to_air: NextEpisodeToAir;
  networks: Network[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  seasons: Season[];
  softcore: boolean;
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number;
}

/**
 * Full `/tv/{id}` response shape. `videos`/`credits`/`images` are each only present
 * when their name is included in the `append_to_response` query param (see
 * TvService.getTVById / TmdbListService.byId, where it's an optional argument) —
 * marked optional here so a call made without requesting them doesn't get typed as if
 * they were guaranteed.
 */
export interface TVShowDetails extends TVShowDetailsBase {
  videos?: Videos;
  credits?: Credits;
  images?: Images;
}

// TV-specific: TMDB's TV cast entries don't carry a `cast_id` the way movie cast entries
// do, and `profile_path` isn't marked optional here (see the movie model's Cast for the
// difference) — see common.model.ts for the fragments (Videos/Result/Crew/Images/
// Backdrop/Logo/Poster) that are identical between the two.
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
  profile_path: string;
  character: string;
  credit_id: string;
  order: number;
}
