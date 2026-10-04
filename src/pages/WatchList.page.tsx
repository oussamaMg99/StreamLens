import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import NavBar from 'src/components/navbar/Navbar';
import Footer from 'src/components/footer/Footer.component';
import { navbarHeight } from 'src/utils/constants';

/**
 * Placeholder shell so the route exists. The list itself (entries resolved against
 * TMDB, per-season progress, filters, the signed-out/unverified gate states) is the
 * next step.
 */
const WatchList = () => {
  const { t } = useTranslation();

  return (
    <>
      <NavBar />
      <Box sx={{ pt: theme => `calc(${navbarHeight} + ${theme.spacing(4)})`, px: { xs: 2, md: 6 }, minHeight: '72vh' }}>
        <Typography variant='h3'>{t('watchList')}</Typography>
      </Box>
      <Footer />
    </>
  );
};

export default WatchList;
