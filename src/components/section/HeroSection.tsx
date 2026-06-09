import { Box, Typography, Button, Stack } from '@mui/material';
import heroBG from '../../assets/images/hero-bg.jpg';
import { navbarHeight } from 'src/utils/constants';

const HeroSection = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        color: 'white',
        textAlign: 'center',
        backgroundImage: `url(${heroBG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 2, maxWidth: '800px' }}>
        <Typography
          variant='h2'
          sx={{
            fontWeight: 800,
            mb: 2,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Discover Cinematic Stories That Breathe Life
        </Typography>

        <Typography
          variant='body1'
          sx={{
            mb: 4,
            color: 'rgba(255,255,255,0.85)',
            fontSize: '1.1rem',
          }}
        >
          Explore a curated collection of movies and TV shows that transport you beyond the ordinary. Every frame tells a story waiting to
          be experienced.
        </Typography>

        <Stack direction='row' spacing={2} justifyContent='center' sx={{ flexWrap: 'wrap' }}>
          <Button
            variant='contained'
            color='primary'
            sx={{
              px: 4,
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            Explore
          </Button>
          <Button
            variant='outlined'
            color='inherit'
            sx={{
              px: 4,
              py: 1,
              fontWeight: 600,
              textTransform: 'none',
              borderColor: 'rgba(255,255,255,0.6)',
              '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
            }}
          >
            Watch
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default HeroSection;
