import { Crew, MediaDetails } from './common.model';

export interface BelongsToCollection {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
}

/**
 * Full `/movie/{id}` response shape. Shared fields (including `videos`/`images`, only
 * present when requested via `append_to_response`) live on MediaDetails; `credits` stays
 * movie-specific here since movie Cast carries a `cast_id` TV Cast doesn't.
 */
export interface MovieDetails extends MediaDetails {
  media_type: 'movie';
  belongs_to_collection: BelongsToCollection;
  budget: number;
  imdb_id: string;
  original_title: string;
  release_date: string;
  revenue: number;
  runtime: number;
  title: string;
  video: boolean;
  credits?: Credits;
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
