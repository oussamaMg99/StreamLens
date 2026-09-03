import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import StarIcon from '@mui/icons-material/Star';
import GenreTag from '../tag/GenreTag.component';
import { Genre } from 'src/core/models/common.model';

interface SummaryModalInfoBarProps {
  mediaType?: 'movie' | 'tv';
  runtime?: number;
  releaseDate?: string;
  firstAirDate?: string;
  voteAverage?: number;
  voteCount?: number;
  genres?: Genre[];
}

/**
 * SummaryModalInfoBar - the runtime/date/rating/genres row shown under a SummaryModal's
 * title. Presentational only: SummaryModal owns fetching itemDetails and just passes the
 * handful of fields this row reads, rather than the whole (MovieDetails & TVShowDetails)
 * intersection type.
 */
const SummaryModalInfoBar = (props: SummaryModalInfoBarProps) => {
  const { mediaType, runtime, releaseDate, firstAirDate, voteAverage, voteCount, genres } = props;
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', gap: 2 }}>
      {mediaType === 'movie' && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          <AvTimerIcon />
          <Typography variant='h5'>{runtime ? `${runtime} ${t('minute(s)')}` : 'N/A'}</Typography>
        </Box>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        <CalendarMonthIcon />
        <Typography variant='h5'>{releaseDate ?? firstAirDate ?? 'N/A'}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        <StarIcon />
        <Typography variant='h5'>{`${voteAverage ?? 'N/A'} / 10 (${voteCount ?? 0} ${t('votes')})`}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        {genres?.map(genre => (
          <GenreTag key={genre.id} tagName={t(genre.name)} />
        ))}
      </Box>
    </Box>
  );
};

export default SummaryModalInfoBar;
