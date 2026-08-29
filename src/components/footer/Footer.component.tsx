import { Box, Typography, Stack, IconButton, Divider, Link } from '@mui/material';
import colors from 'src/assets/themes/colors';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useTranslation } from 'react-i18next';
import { RoutePaths } from 'src/types/Routes.type';
import { NavLink } from 'react-router';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <Box
      component='footer'
      sx={{
        mt: 6,
        px: { xs: 2, md: 6 },
        py: 4,
        borderTop: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Link
          component={NavLink}
          to={RoutePaths.Default}
          end
          underline='none'
          color='inherit'
          variant='h4'
          sx={{ cursor: 'pointer', fontWeight: 800, color: colors.primary.main }}
        >
          {t('appName')}
        </Link>

        <Stack direction='row' spacing={3}>
          <Link
            component={NavLink}
            to={RoutePaths.MOVIES}
            end
            underline='none'
            color='inherit'
            sx={{ cursor: 'pointer', '&:hover': { color: colors.primary.main } }}
          >
            {t('movies')}
          </Link>
          <Link
            component={NavLink}
            to={RoutePaths.TV_SHOWS}
            end
            underline='none'
            color='inherit'
            sx={{ cursor: 'pointer', '&:hover': { color: colors.primary.main } }}
          >
            {t('tvShows')}
          </Link>
          <Link
            component={NavLink}
            to={RoutePaths.ABOUT}
            end
            underline='none'
            color='inherit'
            sx={{ cursor: 'pointer', '&:hover': { color: colors.primary.main } }}
          >
            {t('about')}
          </Link>
        </Stack>

        <Stack direction='row' spacing={1}>
          <IconButton size='small' aria-label='facebook'>
            <FacebookIcon fontSize='small' color='primary' />
          </IconButton>
          <IconButton size='small' aria-label='instagram'>
            <InstagramIcon fontSize='small' color='primary' />
          </IconButton>
          <IconButton size='small' aria-label='github'>
            <GitHubIcon fontSize='small' color='primary' />
          </IconButton>
        </Stack>
      </Box>

      <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

      <Typography variant='body2' sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
        {`© ${new Date().getFullYear()} ${t('appName')}. ${t('allRightsReserved')}`}
      </Typography>
    </Box>
  );
};

export default Footer;
