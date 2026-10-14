import { ReactNode } from 'react';
import { Box, Button, Typography } from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';
import colors from 'src/assets/themes/colors';
import { RoutePaths } from 'src/types/Routes.type';

/** Same layout as InsightsGatePrompt / InsightsEmptyState: ringed icon, title, body, actions. */
const StateLayout = (props: { icon: ReactNode; title: string; body: string; actions: ReactNode }) => (
  <Box
    sx={{
      maxWidth: 820,
      width: '100%',
      mx: 'auto',
      py: { xs: 4, md: 8 },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 1.75,
    }}
  >
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
        '& svg': { fontSize: 30 },
      }}
    >
      {props.icon}
    </Box>
    <Typography variant='h1' sx={{ fontWeight: 800, fontSize: { xs: 24, md: 30 } }}>
      {props.title}
    </Typography>
    <Typography sx={{ maxWidth: 480, fontSize: { xs: 15, md: 16 }, color: 'rgba(255,255,227,0.7)' }}>{props.body}</Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.5, mt: 1 }}>{props.actions}</Box>
  </Box>
);

const outlinedSx = { minHeight: 44, borderColor: 'rgba(226,168,71,0.6)' };

export const WatchListEmptyState = () => {
  const { t } = useTranslation();
  return (
    <StateLayout
      icon={<BookmarkBorderIcon />}
      title={t('emptyTitle')}
      body={t('emptyBody')}
      actions={
        <>
          <Button component={NavLink} to={RoutePaths.MOVIES} variant='contained' sx={{ color: colors.onPrimary, minHeight: 44 }}>
            {t('browseMovies')}
          </Button>
          <Button component={NavLink} to={RoutePaths.TV_SHOWS} variant='outlined' sx={outlinedSx}>
            {t('browseTvShows')}
          </Button>
        </>
      }
    />
  );
};

/** onAction = useWatchListGate's promptIfBlocked (auth modal, or the verify-email dialog). */
export const WatchListGatePrompt = (props: { access: 'signedOut' | 'unverified'; onAction: () => void }) => {
  const { t } = useTranslation();
  const signedOut = props.access === 'signedOut';
  return (
    <StateLayout
      icon={signedOut ? <LockOutlinedIcon /> : <MarkEmailUnreadOutlinedIcon />}
      title={signedOut ? t('signInTitle') : t('verifyTitle')}
      body={signedOut ? t('signInBody') : t('verifyBody')}
      actions={
        <Button variant='contained' onClick={props.onAction} sx={{ color: colors.onPrimary, minHeight: 44 }}>
          {signedOut ? t('signIn') : t('verifyYourEmail')}
        </Button>
      }
    />
  );
};

export const WatchListNoMatches = (props: { onClear: () => void }) => {
  const { t } = useTranslation();
  return (
    <StateLayout
      icon={<SearchOffIcon />}
      title={t('noMatchesTitle')}
      body={t('noMatchesBody')}
      actions={
        <Button variant='outlined' onClick={props.onClear} sx={outlinedSx}>
          {t('clearFilters')}
        </Button>
      }
    />
  );
};
