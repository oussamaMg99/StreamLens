import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import colors from 'src/assets/themes/colors';

interface WatchSplitProps {
  movies: number;
  tvShows: number;
  seasonsFinished: number;
}

/**
 * Movies vs TV split bar. Labels sit inside the bar on md+ (design 4b) and above a
 * thinner bar on mobile (design 4a mobile), where a 42% segment is too narrow for text.
 */
const WatchSplit = (props: WatchSplitProps) => {
  const { movies, tvShows, seasonsFinished } = props;
  const { t } = useTranslation();
  const theme = useTheme();
  // noSsr: read the media query on the first render, so desktop doesn't flash the mobile layout.
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true });

  const total = movies + tvShows;
  const moviePct = total ? Math.round((movies / total) * 100) : 0;
  const tvPct = total ? 100 - moviePct : 0;
  const moviePctLabel = t('percentValue', { value: moviePct });
  const tvPctLabel = t('percentValue', { value: tvPct });
  const seasonsLabel = t('seasonsFinishedCount', { count: seasonsFinished });
  const showsLabel = t('showsCount', { count: tvShows });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      {!isMdUp && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600 }}>
          <Box component='span' sx={{ color: colors.primary.main }}>
            {moviePctLabel} {t('movies')}
          </Box>
          <Box component='span' sx={{ color: colors.success.main }}>
            {t('tvShows')} {tvPctLabel}
          </Box>
        </Box>
      )}

      <Box
        role='img'
        aria-label={t('watchSplitAria', { movies: moviePct, shows: tvPct })}
        sx={{ display: 'flex', gap: '3px', height: { xs: 14, md: 40 }, borderRadius: { xs: '7px', md: '10px' }, overflow: 'hidden' }}
      >
        <Box
          sx={{
            width: `${moviePct}%`,
            display: 'flex',
            alignItems: 'center',
            px: 2,
            backgroundColor: colors.primary.main,
            color: colors.onPrimary,
            fontWeight: 700,
            fontSize: 15,
            whiteSpace: 'nowrap',
            transition: 'width .4s ease',
          }}
        >
          {isMdUp && `${moviePctLabel} · ${t('movies')}`}
        </Box>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: 2,
            backgroundColor: colors.success.main,
            color: colors.onSuccess,
            fontWeight: 700,
            fontSize: 15,
            whiteSpace: 'nowrap',
          }}
        >
          {isMdUp && `${t('tvShows')} · ${tvPctLabel}`}
        </Box>
      </Box>

      <Typography sx={{ fontSize: { xs: 12, md: 13 }, color: 'rgba(255,255,227,0.5)' }}>
        {isMdUp
          ? t('seasonsFinishedAcross', { seasons: seasonsLabel, shows: showsLabel })
          : [t('moviesCount', { count: movies }), showsLabel, seasonsLabel].join(' · ')}
      </Typography>
    </Box>
  );
};

export default WatchSplit;
