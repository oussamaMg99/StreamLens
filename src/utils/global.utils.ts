import { Movie } from 'src/core/services/movie.service';
import { TvShow } from 'src/core/services/tv.service';
import { MediaType } from 'src/types/global.type';

export const isMovie = (item?: (TvShow & Movie) | TvShow | Movie): item is Movie => {
  return item?.media_type === MediaType.Movie;
};
export const isTvShow = (item?: (TvShow & Movie) | TvShow | Movie): item is TvShow => {
  return item?.media_type === MediaType.TVShow;
};
