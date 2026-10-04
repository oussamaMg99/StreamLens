import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import NavBar from 'src/components/navbar/Navbar';
import Footer from 'src/components/footer/Footer.component';
import { navbarHeight } from 'src/utils/constants';

/**
 * Placeholder shell so the route exists. The insights themselves are the next step.
 */
const Insights = () => {
  const { t } = useTranslation();

  return (
    <>
      <NavBar />
      <Box sx={{ pt: theme => `calc(${navbarHeight} + ${theme.spacing(4)})`, px: { xs: 2, md: 6 }, minHeight: '72vh' }}>
        <Typography variant='h3'>{t('insights')}</Typography>
      </Box>
      <Footer />
    </>
  );
};

export default Insights;
