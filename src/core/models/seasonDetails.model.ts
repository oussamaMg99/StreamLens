// src/core/models/seasonDetails.model.ts
// Response shape for TMDB's /tv/{tv_id}/season/{season_number} — the per-episode data
// that isn't included in the season summaries on /tv/{id} itself (see Season in
// tvShowDetails.model.ts, which only has id/name/poster_path/episode_count/air_date).

export interface SeasonDetails {
  id: number;
  air_date: string;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  vote_average: number;
  episodes: Episode[];
}

export interface Episode {
  id: number;
  air_date: string;
  episode_number: number;
  episode_type: string;
  name: string;
  overview: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string;
  vote_average: number;
  vote_count: number;
}
