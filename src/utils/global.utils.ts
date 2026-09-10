import { Movie } from 'src/core/services/movie.service';
import { TvShow } from 'src/core/services/tv.service';
import { MediaType } from 'src/types/global.type';

export const isMovie = (item?: Movie | TvShow): item is Movie => {
  return item?.media_type === MediaType.Movie;
};
export const isTvShow = (item?: Movie | TvShow): item is TvShow => {
  return item?.media_type === MediaType.TVShow;
};
