import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Pagination, Typography } from '@mui/material';
import SummaryModal from 'src/components/modal/SummaryModal';
import NavBar from 'src/components/navbar/Navbar';
import MediaGrid from 'src/components/mediaGrid/MediaGrid.component';
import { navbarHeight } from 'src/utils/constants';
import { useMovies } from 'src/core/hooks/useMovies';
import { Movie } from 'src/core/services/movie.service';
import Footer from 'src/components/footer/Footer.component';

const Movies = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Movie | null>(null);
  const { data, isLoading } = useMovies({ page });

  // /movie/popular (and /discover/movie) responses don't include media_type — tag it
  // ourselves, same as Home.page.tsx does, so SummaryModal knows which details endpoint to call.
  const items = data?.results.map(movie => ({
    ...movie,
    media_type: 'movie' as const,
    title: movie.title,
    posterPath: movie.poster_path,
    year: movie.release_date?.slice(0, 4),
    rating: movie.vote_average ? movie.vote_average.toFixed(1) : undefined,
  }));

  const handleItemClick = (item: Movie) => {
    setSelectedItem(item);
    setIsSummaryModalOpen(true);
  };

  return (
    <>
      <SummaryModal open={isSummaryModalOpen} item={selectedItem ?? undefined} onClose={() => setIsSummaryModalOpen(false)} />
      <NavBar />
      <Box sx={{ pt: theme => `calc(${navbarHeight} + ${theme.spacing(4)})`, px: { xs: 2, md: 6 } }}>
        <Typography variant='h2' sx={{ fontWeight: 800 }}>
          {t('movies')}
        </Typography>
      </Box>
      <MediaGrid loading={isLoading} items={items} onItemClick={handleItemClick} />
      {data && data.total_pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pb: 6 }}>
          <Pagination count={Math.min(data.total_pages, 500)} page={page} onChange={(_, value) => setPage(value)} color='primary' />
        </Box>
      )}
      <Footer />
    </>
  );
};

export default Movies;
