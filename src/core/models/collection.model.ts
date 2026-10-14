// src/core/models/collection.model.ts
// Response shape for TMDB's /collection/{collection_id}: a film series (e.g. "The Lord of
// the Rings Collection") and its movies. Which collection a movie belongs to comes from
// MovieDetails.belongs_to_collection, stored on watch-list entries as collection_id.

import type { Movie } from './movie.model';

export interface Collection {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  /** The series' movies. TMDB omits media_type; MovieService.getCollection stamps it. */
  parts: Movie[];
}
