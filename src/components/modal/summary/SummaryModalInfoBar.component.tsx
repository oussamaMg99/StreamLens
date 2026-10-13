import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import StarIcon from '@mui/icons-material/Star';
import GenreTag from 'src/components/tag/GenreTag.component';
import LayersIcon from '@mui/icons-material/Layers';
import { SummaryModalDetails } from './SummaryModal.component';
import { isMovie, isTvShow } from 'src/utils/global.utils';
import { hiddenScrollbarSx } from './summaryModal.styles';

interface SummaryModalInfoBarProps {
  itemDetails?: SummaryModalDetails;
  /**
   * Mobile sheet: one wrapping, left-aligned meta line at body size, and the genres in
   * their own row that scrolls sideways. Default (desktop) layout is unchanged.
   */
  compact?: boolean;
}

/**
 * SummaryModalInfoBar - the runtime/date/rating/genres row shown under a SummaryModal's
 * title. Presentational only: SummaryModal owns fetching itemDetails and just passes it
 * down; movie-vs-tv fields are picked by narrowing itemDetails.media_type directly
 * (rather than a separate `item` prop, which would just be an indirect proxy for the
 * same discriminant).
 */
const SummaryModalInfoBar = (props: SummaryModalInfoBarProps) => {
  const { itemDetails, compact } = props;
  const { t } = useTranslation();
  const movieDetails = isMovie(itemDetails) ? itemDetails : undefined;
  const tvDetails = isTvShow(itemDetails) ? itemDetails : undefined;

  const textVariant = compact ? 'body2' : 'h5';
  const itemSx = compact
    ? {
        display: 'flex',
        alignItems: 'center',
        gap: 0.625,
        color: 'rgba(255,255,227,0.8)',
        '& svg': { fontSize: 16, color: 'rgba(255,255,227,0.6)' },
      }
    : { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 };

  const meta = (
    <>
      {movieDetails && (
        <Box sx={itemSx}>
          <AvTimerIcon />
          <Typography variant={textVariant} sx={compact ? { fontWeight: 500 } : undefined}>
            {movieDetails.runtime ? `${movieDetails.runtime} ${t('minute(s)')}` : 'N/A'}
          </Typography>
        </Box>
      )}
      <Box sx={itemSx}>
        <CalendarMonthIcon />
        <Typography variant={textVariant} sx={compact ? { fontWeight: 500 } : undefined}>
          {movieDetails?.release_date ?? tvDetails?.first_air_date ?? 'N/A'}
        </Typography>
      </Box>
      <Box sx={itemSx}>
        <StarIcon />
        <Typography variant={textVariant} sx={compact ? { fontWeight: 500 } : undefined}>
          {`${itemDetails?.vote_average ?? 'N/A'} / 10 (${itemDetails?.vote_count ?? 0} ${t('votes')})`}
        </Typography>
      </Box>
      {tvDetails && (
        <Box sx={itemSx}>
          <LayersIcon />
          <Typography variant={textVariant} sx={compact ? { fontWeight: 500 } : undefined}>
            {tvDetails.number_of_seasons ? t('seasonCount', { count: tvDetails.number_of_seasons }) : 'N/A'}
          </Typography>{' '}
          {'•'}
          <Typography variant={textVariant} sx={compact ? { fontWeight: 500 } : undefined}>
            {tvDetails.number_of_episodes ? t('episodeCount', { count: tvDetails.number_of_episodes }) : 'N/A'}
          </Typography>
        </Box>
      )}
    </>
  );

  const genres = itemDetails?.genres?.map(genre => <GenreTag key={genre.id} tagName={t(genre.name)} />);

  if (compact) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 0 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 1.75, rowGap: 0.75 }}>{meta}</Box>
        {!!genres?.length && (
          // Bleeds to the sheet edges so the row reads as scrollable.
          <Box sx={{ ...hiddenScrollbarSx, display: 'flex', gap: 1, mx: -2, px: 2, '& > *': { flex: 'none' } }}>{genres}</Box>
        )}
      </Box>
    );
  }

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
      {meta}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>{genres}</Box>
    </Box>
  );
};

export default SummaryModalInfoBar;
