import { useEffect, useState } from 'react';
import { Box, Typography, Button, Chip, CircularProgress, Stack } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router';
import SummaryModal from 'src/components/modal/SummaryModal';
import NavBar from 'src/components/navbar/Navbar';
import MediaGrid from 'src/components/mediaGrid/MediaGrid.component';
import colors from 'src/assets/themes/colors';
import { navbarHeight } from 'src/utils/constants';
import { useMovies } from 'src/core/hooks/useMovies';
import { useTvShows } from 'src/core/hooks/useTvShows';
import { Movie } from 'src/core/services/movie.service';
import { TvShow } from 'src/core/services/tv.service';
import { RoutePaths } from 'src/types/Routes.type';
import Footer from 'src/components/footer/Footer.component';

export type MediaItem = TvShow & Movie;

const TEASER_COUNT = 6;

const Home = () => {
  const { t } = useTranslation();
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const { data: popularMoviesData, isLoading: moviesLoading } = useMovies({});
  const { data: popularTvData, isLoading: tvLoading } = useTvShows({});

  const displayMovies = popularMoviesData?.results.map(movie => ({
    ...movie,
    media_type: 'movie',
    title: movie.title,
    posterPath: movie.poster_path,
    year: movie.release_date?.slice(0, 4),
    rating: movie.vote_average ? movie.vote_average.toFixed(1) : undefined,
  }));
  const displayTv = popularTvData?.results.map(tv => ({
    ...tv,
    media_type: 'tv',
    title: tv.name,
    posterPath: tv.poster_path,
    year: tv.first_air_date?.slice(0, 4),
    rating: tv.vote_average ? tv.vote_average.toFixed(1) : undefined,
  }));

  const onItemClick = (item: MediaItem) => {
    setSelectedItem(item);
    setIsSummaryModalOpen(true);
  };

  const featuredItems = [...(displayMovies?.slice(0, 3) ?? []), ...(displayTv?.slice(0, 3) ?? [])];

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
      <MediaGrid
        title={t('popularMovies')}
        titleAction={
          <Button component={NavLink} to={RoutePaths.MOVIES} end color='primary'>
            {t('seeAll')}
          </Button>
        }
        loading={moviesLoading}
        items={displayMovies?.slice(0, TEASER_COUNT)}
        onItemClick={onItemClick}
      />

      {/* Popular TV Shows */}
      <MediaGrid
        title={t('popularTVShows')}
        titleAction={
          <Button component={NavLink} to={RoutePaths.TV_SHOWS} end color='primary'>
            {t('seeAll')}
          </Button>
        }
        loading={tvLoading}
        items={displayTv?.slice(0, TEASER_COUNT)}
        onItemClick={onItemClick}
      />

      {/* Footer */}
      <Footer />
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

export default Home;
