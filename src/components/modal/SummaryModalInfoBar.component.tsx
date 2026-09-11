import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import StarIcon from '@mui/icons-material/Star';
import GenreTag from '../tag/GenreTag.component';
import LayersIcon from '@mui/icons-material/Layers';
import { SummaryModalDetails } from './SummaryModal';
import { isMovie, isTvShow } from 'src/utils/global.utils';

interface SummaryModalInfoBarProps {
  itemDetails?: SummaryModalDetails;
}

/**
 * SummaryModalInfoBar - the runtime/date/rating/genres row shown under a SummaryModal's
 * title. Presentational only: SummaryModal owns fetching itemDetails and just passes it
 * down; movie-vs-tv fields are picked by narrowing itemDetails.media_type directly
 * (rather than a separate `item` prop, which would just be an indirect proxy for the
 * same discriminant).
 */
const SummaryModalInfoBar = (props: SummaryModalInfoBarProps) => {
  const { itemDetails } = props;
  const { t } = useTranslation();
  const movieDetails = isMovie(itemDetails) ? itemDetails : undefined;
  const tvDetails = isTvShow(itemDetails) ? itemDetails : undefined;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'center',
        gap: 2,
        maxWidth: '100%',
        flexWrap: 'wrap',
      }}
    >
      {movieDetails && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          <AvTimerIcon />
          <Typography variant='h5'>{movieDetails.runtime ? `${movieDetails.runtime} ${t('minute(s)')}` : 'N/A'}</Typography>
        </Box>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        <CalendarMonthIcon />
        <Typography variant='h5'>{movieDetails?.release_date ?? tvDetails?.first_air_date ?? 'N/A'}</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        <StarIcon />
        <Typography variant='h5'>{`${itemDetails?.vote_average ?? 'N/A'} / 10 (${itemDetails?.vote_count ?? 0} ${t('votes')})`}</Typography>
      </Box>
      {tvDetails && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          <LayersIcon />
          <Typography variant='h5'>
            {tvDetails.number_of_seasons ? `${tvDetails.number_of_seasons} ${t('seasons')}` : 'N/A'}
          </Typography>{' '}
          {'•'}
          <Typography variant='h5'>{tvDetails.number_of_episodes ? `${tvDetails.number_of_episodes} ${t('episodes')}` : 'N/A'}</Typography>
        </Box>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        {itemDetails?.genres?.map(genre => (
          <GenreTag key={genre.id} tagName={t(genre.name)} />
        ))}
      </Box>
    </Box>
  );
};

export default SummaryModalInfoBar;
