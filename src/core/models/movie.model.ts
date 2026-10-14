import { Media } from './common.model';

/**
 * Basic TMDB v3 movie result shape.
 * Expand as your UI needs more data.
 */
export interface Movie extends Media {
  media_type: 'movie';
  original_title: string;
  release_date: string;
  title: string;
  video: boolean;
}
