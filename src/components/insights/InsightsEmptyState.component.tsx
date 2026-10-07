import { Box, Button, Typography } from '@mui/material';
import PieChartIcon from '@mui/icons-material/PieChart';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';
import colors from 'src/assets/themes/colors';
import { RoutePaths } from 'src/types/Routes.type';
import { getFirstName } from 'src/utils/global.utils';

/** New-user state: what to do next, and what each insight needs before it appears. */
const InsightsEmptyState = (props: { name?: string }) => {
  const { t } = useTranslation();
  const firstName = getFirstName(props.name);
  const locked = [
    { title: t('moviesVsTvShows'), hint: t('unlocksAfterFirstTitle') },
    { title: t('yourTopGenres'), hint: t('unlocksAfterThreeTitles') },
    { title: t('pickedForYou'), hint: t('unlocksWithTopGenres') },
  ];

  return (
    <Box sx={{ maxWidth: 820, width: '100%', mx: 'auto', display: 'flex', flexDirection: 'column', gap: 4, py: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1.75 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            color: colors.primary.main,
            backgroundColor: 'rgba(226,168,71,0.14)',
            border: '1px solid rgba(226,168,71,0.5)',
          }}
        >
          <PieChartIcon sx={{ fontSize: 30 }} />
        </Box>
        <Typography variant='h1' sx={{ fontWeight: 800, fontSize: { xs: 26, md: 32 } }}>
          {firstName ? t('insightsEmptyTitle', { name: firstName }) : t('insightsEmptyTitleAnonymous')}
        </Typography>
        <Typography sx={{ maxWidth: 520, fontSize: { xs: 15, md: 16 }, color: 'rgba(255,255,227,0.7)' }}>
          {t('insightsEmptyBody')}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.5, mt: 1 }}>
          <Button component={NavLink} to={RoutePaths.MOVIES} variant='contained' sx={{ color: colors.onPrimary, minHeight: 44 }}>
            {t('browseMovies')}
          </Button>
          <Button
            component={NavLink}
            to={RoutePaths.TV_SHOWS}
            variant='outlined'
            sx={{ minHeight: 44, borderColor: 'rgba(226,168,71,0.6)' }}
          >
            {t('browseTvShows')}
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
        {locked.map(item => (
          <Box
            key={item.title}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.75,
              px: 2.25,
              py: 2,
              borderRadius: '10px',
              border: '1px dashed rgba(255,255,255,0.16)',
            }}
          >
            <Box sx={{ width: 36, height: 36, flex: 'none', borderRadius: '50%', border: '1.5px solid rgba(255,255,227,0.3)' }} />
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: 15, color: 'rgba(255,255,227,0.8)' }}>{item.title}</Typography>
              <Typography sx={{ mt: 0.25, fontSize: 13, color: 'rgba(255,255,227,0.5)' }}>{item.hint}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default InsightsEmptyState;
