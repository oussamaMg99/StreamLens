import { useEffect, useState } from 'react';
import { Box, Typography, Button, Chip, CircularProgress, Stack, Divider, IconButton } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import { useTranslation } from 'react-i18next';
import SummaryModal from 'src/components/modal/SummaryModal';
import NavBar from 'src/components/navbar/Navbar';
import colors from 'src/assets/themes/colors';
import { navbarHeight } from 'src/utils/constants';
import { usePopularMovies } from 'src/core/hooks/usePopularMovies';
import { usePopularTvShows } from 'src/core/hooks/usePopularTvShows';
import { Movie } from 'src/core/services/movie.service';
import { TvShow } from 'src/core/services/tv.service';
import NoPoster from 'src/assets/images/no-movie.png';

export type MediaItem = TvShow & Movie;

const Home = () => {
  const { t } = useTranslation();
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const { data: popularMoviesData, isLoading: moviesLoading } = usePopularMovies(1);
  const { data: popularTvData, isLoading: tvLoading } = usePopularTvShows(1);

  const enrichedPopularMoviesData = popularMoviesData?.results.map(movie => ({
    ...movie,
    media_type: 'movie',
  }));
  const enrichedPopularTvData = popularTvData?.results.map(tv => ({
    ...tv,
    media_type: 'tv',
  }));

  const onItemClick = (item: MediaItem) => {
    setSelectedItem(item);
    setIsSummaryModalOpen(true);
  };

  const featuredItems = [...(enrichedPopularMoviesData?.slice(0, 3) ?? []), ...(enrichedPopularTvData?.slice(0, 3) ?? [])];

  return (
    <>
      <SummaryModal open={isSummaryModalOpen} item={selectedItem ?? undefined} onClose={() => setIsSummaryModalOpen(false)} />
      <NavBar />

      {/* Hero / Featured */}
      {featuredItems.length > 0 ? (
        <HeroCarousel items={featuredItems} onItemClick={onItemClick} t={t} />
      ) : (
        <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress color='primary' />
        </Box>
      )}

      {/* Trending Movies */}
      <MediaGridSection title={t('popularMovies')} loading={moviesLoading} items={enrichedPopularMoviesData} onItemClick={onItemClick} />

      {/* Popular TV Shows */}
      <MediaGridSection title={t('popularTVShows')} loading={tvLoading} items={enrichedPopularTvData} onItemClick={onItemClick} />

      {/* Footer */}
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
          <Typography variant='h4' sx={{ fontWeight: 800, color: colors.primary.main }}>
            {t('appName')}
          </Typography>

          <Stack direction='row' spacing={3}>
            <Typography variant='body2' sx={{ cursor: 'pointer', '&:hover': { color: colors.primary.main } }}>
              {t('movies')}
            </Typography>
            <Typography variant='body2' sx={{ cursor: 'pointer', '&:hover': { color: colors.primary.main } }}>
              {t('tvShows')}
            </Typography>
            <Typography variant='body2' sx={{ cursor: 'pointer', '&:hover': { color: colors.primary.main } }}>
              {t('about')}
            </Typography>
          </Stack>

          <Stack direction='row' spacing={1}>
            <IconButton size='small' aria-label='facebook'>
              <FacebookIcon fontSize='small' color='primary' />
            </IconButton>
            <IconButton size='small' aria-label='instagram'>
              <InstagramIcon fontSize='small' color='primary' />
            </IconButton>
            <IconButton size='small' aria-label='x'>
              <XIcon fontSize='small' color='primary' />
            </IconButton>
          </Stack>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

        <Typography variant='body2' sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
          {`© ${new Date().getFullYear()} ${t('appName')}. ${t('allRightsReserved')}`}
        </Typography>
      </Box>
    </>
  );
};

interface HeroCarouselProps {
  items: MediaItem[];
  onItemClick: (item: MediaItem) => void;
  t: (key: string) => string;
}

const HeroCarousel = ({ items, onItemClick, t }: HeroCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [items.length]);

  return (
    <Box sx={{ position: 'relative', minHeight: { xs: '70vh', md: '85vh' }, overflow: 'hidden' }}>
      {items.map((item, index) => {
        const isMovie = Boolean(item.title);
        const title = item.title ?? item.name ?? item.original_title ?? item.original_name;
        return (
          <Box
            key={`${isMovie ? 'movie' : 'tv'}-${item.id}`}
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'flex-end',
              opacity: index === activeIndex ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              pointerEvents: index === activeIndex ? 'auto' : 'none',
              backgroundImage: item.backdrop_path
                ? `linear-gradient(to top, ${colors.phantomBlack.replace('0.6', '1')} 0%, rgba(20,20,20,0.4) 45%, rgba(20,20,20,0.2) 100%), url(https://image.tmdb.org/t/p/original${item.backdrop_path})`
                : `linear-gradient(135deg, #5A431C 0%, #1f0303 100%)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: 760,
                px: { xs: 2, md: 6 },
                pb: { xs: 8, md: 10 },
                pt: theme => `calc(${navbarHeight} + ${theme.spacing(4)})`,
              }}
            >
              <Chip
                label={isMovie ? t('popularMovies') : t('popularTVShows')}
                size='small'
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  backgroundColor: colors.primary.main,
                  color: colors.primary.contrastText,
                }}
              />
              <Typography
                variant='h2'
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  lineHeight: 1.15,
                }}
              >
                {title}
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  mb: 3,
                  color: 'rgba(255,255,255,0.85)',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 3,
                  overflow: 'hidden',
                }}
              >
                {item.overview}
              </Typography>
              <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap', rowGap: 1.5 }}>
                <Button
                  variant='contained'
                  color='primary'
                  startIcon={<PlayArrowIcon />}
                  onClick={() => onItemClick(item)}
                  sx={{ px: 4, py: 1, fontWeight: 700 }}
                >
                  {t('watch')}
                </Button>
                <Button
                  variant='outlined'
                  color='inherit'
                  startIcon={<InfoOutlinedIcon />}
                  onClick={() => onItemClick(item)}
                  sx={{
                    px: 4,
                    py: 1,
                    fontWeight: 700,
                    borderColor: 'rgba(255,255,255,0.6)',
                    '&:hover': { borderColor: colors.primary.main, color: colors.primary.main },
                  }}
                >
                  {t('explore')}
                </Button>
              </Stack>
            </Box>
          </Box>
        );
      })}

      {/* Bullet indicators */}
      {items.length > 1 && (
        <Stack
          direction='row'
          spacing={1.5}
          sx={{
            position: 'absolute',
            bottom: { xs: 16, md: 24 },
            left: 0,
            right: 0,
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          {items.map((_, index) => (
            <Box
              key={index}
              role='button'
              aria-label={`Show featured item ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                cursor: 'pointer',
                backgroundColor: index === activeIndex ? colors.primary.main : 'rgba(255,255,255,0.7)',
                transform: index === activeIndex ? 'scale(1.2)' : 'scale(1)',
                transition: 'background-color 0.3s ease, transform 0.3s ease',
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

interface MediaGridSectionProps {
  title: string;
  loading?: boolean;
  items?: MediaItem[];
  onItemClick: (item: MediaItem) => void;
}

const MediaGridSection = ({ title, loading, items, onItemClick }: MediaGridSectionProps) => {
  if (loading) {
    return (
      <Box sx={{ width: '100%', minHeight: '30vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress color='primary' />
      </Box>
    );
  }

  return (
    <Box component='section' sx={{ px: { xs: 2, md: 6 }, py: { xs: 3, md: 5 } }}>
      <Typography variant='h3' sx={{ fontWeight: 700, mb: 3, textTransform: 'uppercase' }}>
        {title}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
            lg: 'repeat(6, 1fr)',
          },
          gap: { xs: 1.5, md: 2 },
        }}
      >
        {items?.map(item => (
          <MediaCard key={item.id} item={item} onClick={onItemClick} />
        ))}
      </Box>
    </Box>
  );
};

interface MediaCardProps {
  item: MediaItem;
  onClick: (item: MediaItem) => void;
}

const MediaCard = ({ item, onClick }: MediaCardProps) => {
  const title = item.title ?? item.name ?? item.original_title ?? item.original_name;
  const year = (item.release_date ?? item.first_air_date)?.slice(0, 4);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  return (
    <Box
      onClick={() => onClick(item)}
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        aspectRatio: '2 / 3',
        backgroundColor: colors.phantomBlack,
        boxShadow: '0px 4px 12px rgba(0,0,0,0.2)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-4px) scale(1.02)',
          boxShadow: '0px 8px 20px rgba(0,0,0,0.35)',
          '& .media-overlay': { opacity: 1 },
        },
      }}
    >
      <Box
        component='img'
        src={item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : NoPoster}
        alt={title}
        loading='lazy'
        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />

      {rating && (
        <Chip
          icon={<StarIcon sx={{ fontSize: 16, color: colors.primary.main }} />}
          label={rating}
          size='small'
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: colors.text.primary,
            fontWeight: 700,
            '& .MuiChip-icon': { ml: '6px' },
          }}
        />
      )}

      <Box
        className='media-overlay'
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 1.5,
          opacity: { xs: 1, md: 0 },
          transition: 'opacity 0.25s ease',
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)',
        }}
      >
        <Typography variant='subtitle2' color='text.primary' noWrap sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {year && (
          <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {year}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Home;
