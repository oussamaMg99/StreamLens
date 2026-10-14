import { Media } from './common.model';

/**
 * Basic TMDB v3 TV result shape.
 * Expand as your UI needs more data.
 */
export interface TvShow extends Media {
  media_type: 'tv';
  origin_country: string[];
  original_name: string;
  first_air_date: string;
  name: string;
}
