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
import { SearchResultItem } from 'src/components/search/SearchBar.component';

type TaggedMovie = Movie & { media_type: 'movie' };

const Movies = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TaggedMovie | null>(null);
  const [submittedQuery, setSubmittedQuery] = useState('');
  const { data, isLoading } = useMovies({ page }, { enabled: !submittedQuery });
  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchError,
  } = useMovies({ query: submittedQuery }, { enabled: submittedQuery.trim().length > 0 });

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

  // /search/movie responses don't carry media_type either — tag them the same way so a
  // selected search result can be handed to SummaryModal just like a browse-grid item.
  const searchResults: TaggedMovie[] | undefined = searchData?.results.map(movie => ({ ...movie, media_type: 'movie' as const }));
  const searchResultItems: SearchResultItem[] =
    searchResults?.map(movie => ({ id: movie.id, title: movie.title, posterPath: movie.poster_path })) ?? [];

  const handleItemClick = (item: Movie) => {
    setSelectedItem({ ...item, media_type: 'movie' });
    setIsSummaryModalOpen(true);
  };

  const onSearch = (query: string) => setSubmittedQuery(query);

  const handleSelectSearchResult = (item: SearchResultItem) => {
    const found = searchResults?.find(result => result.id === item.id);
    setSelectedItem(found ?? null);
    setIsSummaryModalOpen(true);
  };

  return (
    <>
      <SummaryModal open={isSummaryModalOpen} item={selectedItem ?? undefined} onClose={() => setIsSummaryModalOpen(false)} />
      <NavBar
        enableSearch={true}
        onSearch={onSearch}
        searchResults={searchResultItems}
        searchLoading={searchLoading}
        searchError={!!searchError}
        onSelectSearchResult={handleSelectSearchResult}
      />
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
