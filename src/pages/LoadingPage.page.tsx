import { Box, CircularProgress } from '@mui/material';

const LoadingPage = () => {
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <CircularProgress color='primary' />
    </Box>
  );
};

export default LoadingPage;
