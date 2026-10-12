import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useTranslation } from 'react-i18next';
import colors from 'src/assets/themes/colors';
import { getFirstName } from 'src/utils/global.utils';

interface InsightsHeroProps {
  name?: string;
  movies: number;
  tvShows: number;
  hoursWatched: number;
}

const StatCard = (props: { icon: ReactNode; label: string; value: ReactNode; caption: string }) => (
  <Box
    sx={{
      p: { xs: 0, md: 3 },
      borderRadius: '12px',
      backgroundColor: { xs: 'transparent', md: 'rgba(20,20,20,0.55)' },
      border: { xs: 'none', md: '1px solid rgba(255,255,255,0.10)' },
    }}
  >
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        gap: 1,
        mb: 1.75,
        fontSize: 13,
        fontWeight: 500,
        color: 'rgba(255,255,227,0.6)',
        '& svg': { fontSize: 17, color: colors.primary.main },
      }}
    >
      {props.icon}
      {props.label}
    </Box>
    <Typography sx={{ fontWeight: 800, lineHeight: 1, fontSize: { xs: 34, md: 44 } }}>{props.value}</Typography>
    {/* Mobile shows the label under the number instead of above it. */}
    <Typography sx={{ display: { xs: 'block', md: 'none' }, mt: 0.5, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,227,0.6)' }}>
      {props.label}
    </Typography>
    <Typography sx={{ display: { xs: 'none', md: 'block' }, mt: 1, fontSize: 13, color: 'rgba(255,255,227,0.5)' }}>
      {props.caption}
    </Typography>
  </Box>
);

/** Greeting + headline totals. Three panels on md+, a stacked block on mobile. */
const InsightsHero = (props: InsightsHeroProps) => {
  const { name, movies, tvShows, hoursWatched } = props;
  const { t } = useTranslation();
  const firstName = getFirstName(name);
  const days = Math.round(hoursWatched / 24);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', md: 'minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr)' },
        gap: { xs: 1.5, md: 2.5 },
        pb: { xs: 3, md: 0 },
        borderBottom: { xs: '1px solid rgba(226,168,71,0.2)', md: 'none' },
      }}
    >
      <Box
        sx={{
          gridColumn: { xs: '1 / -1', md: 'auto' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: { xs: 0, md: 3.5 },
          mb: { xs: 1, md: 0 },
          borderRadius: '12px',
          background: { xs: 'none', md: 'linear-gradient(135deg, rgba(226,168,71,0.22), rgba(226,168,71,0.04))' },
          border: { xs: 'none', md: '1px solid rgba(226,168,71,0.35)' },
        }}
      >
        <Typography
          sx={{
            display: { xs: 'block', md: 'none' },
            mb: 1,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: colors.primary.main,
          }}
        >
          {t('yourInsights')}
        </Typography>
        <Typography variant='h1' sx={{ fontWeight: 800, fontSize: { xs: 30, md: 32 }, lineHeight: 1.15, mb: 1 }}>
          {firstName ? t('insightsGreeting', { name: firstName }) : t('insightsGreetingAnonymous')}
        </Typography>
        <Typography variant='body2' sx={{ display: { xs: 'none', md: 'block' }, fontSize: 15, color: 'rgba(255,255,227,0.75)' }}>
          {t('insightsHeroSubtitle')}
        </Typography>
      </Box>

      <StatCard
        icon={<LocalMoviesIcon />}
        label={t('titlesWatched')}
        value={movies + tvShows}
        caption={`${t('moviesCount', { count: movies })} · ${t('showsCount', { count: tvShows })}`}
      />
      <StatCard
        icon={<ScheduleIcon />}
        label={t('hoursWatched')}
        value={
          <>
            {hoursWatched}
            <Box component='span' sx={{ fontSize: '0.5em', color: 'rgba(255,255,227,0.6)' }}>
              {' '}
              {t('hoursUnit')}
            </Box>
          </>
        }
        caption={t('aboutDaysOfScreenTime', { count: days })}
      />
    </Box>
  );
};

export default InsightsHero;
