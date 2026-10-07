import { useMemo } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import colors from 'src/assets/themes/colors';
import MediaCard from 'src/components/mediaGrid/MediaCard.component';
import { useMovies } from 'src/core/hooks/useMovies';
import { useTvShows } from 'src/core/hooks/useTvShows';
import { InsightGenre } from 'src/core/models/insights.model';
import { Movie } from 'src/core/services/movie.service';
import { TvShow } from 'src/core/services/tv.service';
import { watchListEntryId } from 'src/core/services/watchList.service';
import { MediaType } from 'src/types/global.type';
import MediaTypeToggle from './MediaTypeToggle.component';

const ROW_LENGTH = 12;

interface GenreSuggestionRowProps {
  rank: number;
  genre: InsightGenre;
  mediaType: MediaType;
  /** Omit when only one type has a genre at this rank; the toggle is then hidden. */
  onMediaTypeChange?: (value: MediaType) => void;
  /** watchListEntryId of every title already on the watch list (watched or saved). */
  excludeKeys: Set<string>;
  onItemClick: (item: Movie | TvShow) => void;
}

/**
 * One "picked for you" row: popular titles in a genre, minus anything the user already
 * has. Fetches a full discover page and trims after excluding, so a heavy watch list
 * doesn't leave the row short.
 */
const GenreSuggestionRow = (props: GenreSuggestionRowProps) => {
  const { rank, genre, mediaType, onMediaTypeChange, excludeKeys, onItemClick } = props;
  const { t } = useTranslation();

  // Both hooks are called (rules of hooks); only the one for the row's type fetches.
  const isMovieRow = mediaType === MediaType.Movie;
  const options = { with_genres: [genre.id], sort_by: 'popularity.desc' };
  const movies = useMovies(options, { enabled: isMovieRow });
  const shows = useTvShows(options, { enabled: !isMovieRow });
  const { data, isLoading } = isMovieRow ? movies : shows;

  const items = useMemo(
    () =>
      ((data?.results ?? []) as (Movie | TvShow)[])
        .filter(item => !excludeKeys.has(watchListEntryId(item)))
        .slice(0, ROW_LENGTH)
        .map(item => ({
          ...item,
          title: item.media_type === 'movie' ? item.title : item.name,
          posterPath: item.poster_path,
          year: (item.media_type === 'movie' ? item.release_date : item.first_air_date)?.slice(0, 4),
        })),
    [data, excludeKeys],
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: { xs: 0, md: 3.5 } }}>
        <Box
          sx={{
            width: 26,
            height: 26,
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            fontSize: 13,
            fontWeight: 700,
            color: colors.primary.main,
            backgroundColor: 'rgba(226,168,71,0.16)',
            border: '1px solid rgba(226,168,71,0.5)',
          }}
        >
          {rank}
        </Box>
        <Typography noWrap sx={{ fontWeight: 700, fontSize: 16, minWidth: 0 }}>
          {genre.name}
        </Typography>
        {onMediaTypeChange && (
          <Box sx={{ ml: 'auto', flex: 'none' }}>
            <MediaTypeToggle size='small' value={mediaType} onChange={onMediaTypeChange} />
          </Box>
        )}
      </Box>

      {isLoading ? (
        <Box sx={{ height: { xs: 177, md: 219 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress color='primary' size={28} />
        </Box>
      ) : items.length ? (
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1.5, md: 1.75 },
            overflowX: 'auto',
            scrollSnapType: 'x proximity',
            // Run to the screen edge on mobile, to the panel edge on desktop.
            mr: { xs: -2, md: 0 },
            pr: { xs: 2, md: 3.5 },
            pt: 0.5,
            pb: 1,
          }}
        >
          {items.map(item => (
            <Box key={`${item.media_type}_${item.id}`} sx={{ flex: 'none', width: { xs: 118, md: 146 }, scrollSnapAlign: 'start' }}>
              <MediaCard item={item} onClick={onItemClick} />
            </Box>
          ))}
        </Box>
      ) : (
        <Typography sx={{ fontSize: 13, color: 'rgba(255,255,227,0.5)', py: 2 }}>{t('noSuggestionsLeft')}</Typography>
      )}
    </Box>
  );
};

export default GenreSuggestionRow;
