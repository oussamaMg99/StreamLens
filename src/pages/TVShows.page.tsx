import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Pagination, Typography } from '@mui/material';
import SummaryModal from 'src/components/modal/SummaryModal';
import NavBar from 'src/components/navbar/Navbar';
import MediaGrid from 'src/components/mediaGrid/MediaGrid.component';
import { navbarHeight } from 'src/utils/constants';
import { useTvShows } from 'src/core/hooks/useTvShows';
import { TvShow } from 'src/core/services/tv.service';

const TVShows = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TvShow | null>(null);
  const { data, isLoading } = useTvShows({ page });

  // /tv/popular (and /discover/tv) responses don't include media_type — tag it
  // ourselves, same as Home.page.tsx does, so SummaryModal knows which details endpoint to call.
  const items = data?.results.map(tv => ({
    ...tv,
    media_type: 'tv' as const,
    title: tv.name,
    posterPath: tv.poster_path,
    year: tv.first_air_date?.slice(0, 4),
    rating: tv.vote_average ? tv.vote_average.toFixed(1) : undefined,
  }));

  const handleItemClick = (item: TvShow) => {
    setSelectedItem(item);
    setIsSummaryModalOpen(true);
  };

  return (
    <>
      <SummaryModal open={isSummaryModalOpen} item={selectedItem ?? undefined} onClose={() => setIsSummaryModalOpen(false)} />
      <NavBar />
      <Box sx={{ pt: theme => `calc(${navbarHeight} + ${theme.spacing(4)})`, px: { xs: 2, md: 6 } }}>
        <Typography variant='h2' sx={{ fontWeight: 800 }}>
          {t('tvShows')}
        </Typography>
      </Box>
      <MediaGrid loading={isLoading} items={items} onItemClick={handleItemClick} />
      {data && data.total_pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pb: 6 }}>
          <Pagination count={Math.min(data.total_pages, 500)} page={page} onChange={(_, value) => setPage(value)} color='primary' />
        </Box>
      )}
    </>
  );
};

export default TVShows;