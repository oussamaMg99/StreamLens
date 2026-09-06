import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import StarIcon from '@mui/icons-material/Star';
import GenreTag from '../tag/GenreTag.component';
import { TvShow } from 'src/core/services/tv.service';
import { TVShowDetails } from 'src/core/models/tvShowDetails.model';
import { MovieDetails } from 'src/core/models/movieDetails.model';
import { Movie } from 'src/core/services/movie.service';

interface SummaryModalInfoBarProps {
  item?: (TvShow & Movie) | TvShow | Movie;
  itemDetails?: MovieDetails & TVShowDetails;
}

/**
 * SummaryModalInfoBar - the runtime/date/rating/genres row shown under a SummaryModal's
 * title. Presentational only: SummaryModal owns fetching itemDetails and just passes the
 * handful of fields this row reads, rather than the whole (MovieDetails & TVShowDetails)
 * intersection type.
 */
const SummaryModalInfoBar = (props: SummaryModalInfoBarProps) => {
  const { item, itemDetails } = props;
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', gap: 2 }}>
      {item?.media_type === 'movie' && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          <AvTimerIcon />
          <Typography variant='h5'>{itemDetails?.runtime ? `${itemDetails.runtime} ${t('minute(s)')}` : 'N/A'}</Typography>
        </Box>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        <CalendarMonthIcon />
        <Typography variant='h5'>{itemDetails?.release_date ?? itemDetails?.first_air_date ?? 'N/A'}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        <StarIcon />
        <Typography variant='h5'>{`${itemDetails?.vote_average ?? 'N/A'} / 10 (${itemDetails?.vote_count ?? 0} ${t('votes')})`}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        {itemDetails?.genres?.map(genre => (
          <GenreTag key={genre.id} tagName={t(genre.name)} />
        ))}
      </Box>
    </Box>
  );
};

export default SummaryModalInfoBar;
