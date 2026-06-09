import { useContext, useEffect, useState } from 'react';
import SummaryModal from 'src/components/modal/SummaryModal';
import NavBar from 'src/components/navbar/Navbar';
import HeroSection from 'src/components/section/HeroSection';
import PopularSection from 'src/components/section/PopularSection';
import AppContext from 'src/core/context/global/AppContext';
import { usePopularMovies } from 'src/core/hooks/usePopularMovies';
import { usePopularTvShows } from 'src/core/hooks/usePopularTvShows';
import { Movie } from 'src/core/services/movie.service';
import { TvShow } from 'src/core/services/tv.service';

const Home = () => {
  const { alertDialogProps, snackBarProps, setAlertDialogProps, setSnackBarProps } = useContext(AppContext);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<(TvShow & Movie) | null>(null);
  const { data: popularMoviesData, isLoading: moviesLoading, error: moviesError } = usePopularMovies(1);
  const { data: popularTvData, isLoading: tvLoading, error: tvError } = usePopularTvShows(1);

  const onItemClick = (item: TvShow & Movie) => {
    console.log('item clicked:', item);
    setSelectedItem(item);
    setIsSummaryModalOpen(true);
  };

  useEffect(() => {
    setSnackBarProps({
      message: 'Testing if SnackBar component works',
      severity: 'info',
      open: true,
    });
  }, []);

  useEffect(() => {
    setAlertDialogProps({
        loadingAnimation: true,
        open: true,
        title: 'AlertDialog Title',
        content: 'Testing if Alert Dialog component works ',
        confirmLabel: 'OK',
        closeLabel: 'Close',
        onConfirm: async () => {
          try {
            // Logic for confirm action
            return true;
          } catch (error: any) {
            setSnackBarProps({
              open: true,
              severity: 'error',
              message: error.message ? error.message : 'common.errorOccurred',
            });
          } finally {
            setAlertDialogProps();
          }
        },
      });
  }, []);

  return (
    <>
      <SummaryModal open={isSummaryModalOpen} item={selectedItem ?? undefined} onClose={() => setIsSummaryModalOpen(false)} />
      <NavBar />
      <HeroSection />
      <PopularSection loading={tvLoading} title='Popular TV Shows' data={popularTvData?.results ?? []} onItemClick={onItemClick} />
      <PopularSection loading={moviesLoading} title='Popular Movies' data={popularMoviesData?.results ?? []} onItemClick={onItemClick} />
    </>
  );
};

export default Home;
