import { MovieDetails } from 'src/core/models/movieDetails.model';
import { TVShowDetails } from 'src/core/models/tvShowDetails.model';
import { Movie } from 'src/core/services/movie.service';
import { TvShow } from 'src/core/services/tv.service';
import { MediaType } from 'src/types/global.type';

// These guards' parameter type covers both the "list item" (Movie/TvShow) and "details"
// (MovieDetails/TVShowDetails) families, so one pair of functions works everywhere a
// media_type discriminant needs checking, instead of each call site re-deriving
// `x?.media_type === 'movie'`. The `item is Movie` predicate looks like it would lose
// MovieDetails-only fields (runtime, release_date, ...) when narrowing a MovieDetails
// value, but it doesn't: when the call-site variable's actual type (e.g. MovieDetails)
// is narrower than the guard's own parameter type, TS narrows to the *intersection* of
// the two rather than replacing it outright — so `isMovie(movieDetailsValue)` narrows to
// `MovieDetails & Movie`, which still carries every MovieDetails-specific field.
export const isMovie = (item?: Movie | TvShow | MovieDetails | TVShowDetails): item is Movie => {
  return item?.media_type === MediaType.Movie;
};
export const isTvShow = (item?: Movie | TvShow | MovieDetails | TVShowDetails): item is TvShow => {
  return item?.media_type === MediaType.TVShow;
};
