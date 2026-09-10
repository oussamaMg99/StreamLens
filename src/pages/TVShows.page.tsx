import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Pagination, Typography } from '@mui/material';
import SummaryModal from 'src/components/modal/SummaryModal';
import NavBar from 'src/components/navbar/Navbar';
import MediaGrid from 'src/components/mediaGrid/MediaGrid.component';
import { navbarHeight } from 'src/utils/constants';
import { useTvShows } from 'src/core/hooks/useTvShows';
import { TvShow } from 'src/core/services/tv.service';
import Footer from 'src/components/footer/Footer.component';
import { SearchResultItem } from 'src/components/search/SearchBar.component';

const TVShows = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TvShow | null>(null);
  const [submittedQuery, setSubmittedQuery] = useState('');
  const { data, isLoading } = useTvShows({ page }, { enabled: !submittedQuery });
  const {
    data: searchData,
    isLoading: searchLoading,
    error: searchError,
  } = useTvShows({ query: submittedQuery }, { enabled: submittedQuery.trim().length > 0 });

  // tvService (via TmdbListService) already tags every result with media_type, so this
  // mapping is purely about the MediaCardData shape MediaGrid expects.
  const items = data?.results.map(tv => ({
    ...tv,
    title: tv.name,
    posterPath: tv.poster_path,
    year: tv.first_air_date?.slice(0, 4),
    rating: tv.vote_average ? tv.vote_average.toFixed(1) : undefined,
  }));

  const searchResults = searchData?.results;
  const searchResultItems: SearchResultItem[] = searchResults?.map(tv => ({ id: tv.id, title: tv.name, posterPath: tv.poster_path })) ?? [];

  const handleItemClick = (item: TvShow) => {
    setSelectedItem(item);
    setIsSummaryModalOpen(true);
  };

  const onSearch = (query: string) => setSubmittedQuery(query);

  const handleSelectSearchResult = (item: SearchResultItem) => {
    const found = searchResults?.find(result => result.id === item.id);
    setSelectedItem(found ?? null);
    setIsSummaryModalOpen(true);
  };

  const pagination = data && data.total_pages > 1 && (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Pagination count={Math.min(data.total_pages, 500)} page={page} onChange={(_, value) => setPage(value)} color='primary' />
    </Box>
  );

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
          {t('tvShows')}
        </Typography>
      </Box>
      {pagination}
      <MediaGrid loading={isLoading} items={items} onItemClick={handleItemClick} />
      {pagination && <Box sx={{ pb: 6 }}>{pagination}</Box>}
      <Footer />
    </>
  );
};

export default TVShows;
