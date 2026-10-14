import { Crew, MediaDetails } from './common.model';

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
 * Full `/tv/{id}` response shape. Shared fields (including `videos`/`images`, only
 * present when requested via `append_to_response`) live on MediaDetails; `credits` stays
 * tv-specific here since TV Cast lacks the `cast_id` movie Cast has.
 */
export interface TVShowDetails extends MediaDetails {
  media_type: 'tv';
  created_by: CreatedBy[];
  episode_run_time: any[];
  first_air_date: string;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: LastEpisodeToAir;
  name: string;
  next_episode_to_air: NextEpisodeToAir;
  networks: Network[];
  number_of_episodes: number;
  number_of_seasons: number;
  original_name: string;
  seasons: Season[];
  type: string;
  credits?: Credits;
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
