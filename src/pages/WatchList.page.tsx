import { ReactNode, useContext, useState } from 'react';
import { Box, CircularProgress, Theme, Typography, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import colors from 'src/assets/themes/colors';
import NavBar from 'src/components/navbar/Navbar';
import Footer from 'src/components/footer/Footer.component';
import SummaryModal from 'src/components/modal/summary/SummaryModal.component';
import FilterPills from 'src/components/watchList/FilterPills.component';
import WatchListToolbar from 'src/components/watchList/WatchListToolbar.component';
import WatchListBoard from 'src/components/watchList/WatchListBoard.component';
import WatchListMobileList from 'src/components/watchList/WatchListMobileList.component';
import { WatchListEmptyState, WatchListGatePrompt, WatchListNoMatches } from 'src/components/watchList/WatchListStates.component';
import { STATUS_LABEL_KEY } from 'src/components/watchList/watchList.styles';
import AppContext from 'src/core/context/global/AppContext';
import { useWatchListBoard } from 'src/core/hooks/useWatchListBoard';
import { useRemoveFromWatchList, useSetMovieWatched } from 'src/core/hooks/useWatchListMutations';
import { AlertDialogProps } from 'src/core/models/alertDialog.model';
import { BoardItem, BoardTypeFilter } from 'src/core/models/watchListBoard.model';
import { Movie } from 'src/core/models/movie.model';
import { TvShow } from 'src/core/models/tvShow.model';
import { TYPE_FILTERS, visibleStatusFilters } from 'src/utils/watchListBoard.utils';
import { entryMetaFromDetails } from 'src/utils/watchListMeta.utils';
import { navbarHeight } from 'src/utils/constants';

const TYPE_LABEL_KEY: Record<BoardTypeFilter, string> = { all: 'all', movie: 'movies', tv: 'watchListTvShows' };

/**
 * Watch list - every saved title on a status board (Not started / In progress / Watched).
 * Desktop: columns, hidden by the status filter. Mobile (< md): status tabs over one list.
 */
const WatchList = () => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const board = useWatchListBoard();
  const { setSnackBarProps, setAlertDialogProps } = useContext(AppContext);
  const setMovieWatched = useSetMovieWatched();
  const removeFromList = useRemoveFromWatchList();
  const [selectedItem, setSelectedItem] = useState<Movie | TvShow | null>(null);

  // Partial on purpose, like ResumeShowCard: SummaryModal resolves everything through
  // useMediaDetails(media_type, id).
  const openItem = (item: BoardItem) => setSelectedItem({ media_type: item.media_type, id: item.id } as Movie | TvShow);

  // Same writes and messages as the Summary modal (SummaryModalOverviewTab). The mutation
  // hooks report errors and refresh the list (Insights shares the query, so it updates too).
  const success = (messageKey: string) => () => setSnackBarProps({ open: true, severity: 'success', message: t(messageKey) });

  const markMovieWatched = (item: BoardItem) => {
    if (item.media_type !== 'movie' || board.promptIfBlocked()) return;
    const meta = item.details ? entryMetaFromDetails(item.details) : undefined;
    setMovieWatched.mutate({ id: item.id, watched: true, meta }, { onSuccess: success('movieMarkedWatched') });
  };

  // Removing deletes the title's progress and watch dates too, so it's confirmed first.
  const remove = (item: BoardItem) => {
    if (board.promptIfBlocked()) return;
    setAlertDialogProps(
      new AlertDialogProps({
        open: true,
        showCancelButton: true,
        title: t('removeConfirmTitle', { title: item.title ?? '' }),
        content: t('removeConfirmBody'),
        confirmLabel: t('remove'),
        closeLabel: t('cancel'),
        onConfirm: () => {
          removeFromList.mutate({ media_type: item.media_type, id: item.id }, { onSuccess: success('removedFromWatchList') });
          return true;
        },
      }),
    );
  };

  const handlers = { onOpen: openItem, onMarkWatched: markMovieWatched, onRemove: remove };

  const typePills = TYPE_FILTERS.map(value => ({ value, label: t(TYPE_LABEL_KEY[value]), count: board.counts.type[value] }));
  const statusPills = visibleStatusFilters(board.filters.type).map(value => ({
    value,
    label: t(STATUS_LABEL_KEY[value]),
    count: board.counts.status[value],
  }));
  const stats = [
    { value: board.stats.saved, label: t('saved'), color: colors.text.primary },
    { value: board.stats.inProgress, label: t('inProgressLower'), color: colors.success.main },
    { value: board.stats.watched, label: t('watchedLower'), color: colors.primary.main },
  ];

  let content: ReactNode;
  if (board.isLoading) {
    content = (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress color='primary' />
      </Box>
    );
  } else if (board.access === 'signedOut' || board.access === 'unverified') {
    content = <WatchListGatePrompt access={board.access} onAction={board.promptIfBlocked} />;
  } else if (board.isEmpty) {
    content = <WatchListEmptyState />;
  } else {
    const results = !board.hasMatches ? (
      <WatchListNoMatches onClear={board.resetFilters} />
    ) : isMobile ? (
      <WatchListMobileList
        items={board.list}
        type={board.filters.type}
        status={board.filters.status}
        counts={board.counts}
        onStatusChange={status => board.updateFilters({ status })}
        {...handlers}
      />
    ) : (
      <WatchListBoard columns={board.columns} {...handlers} />
    );

    content = (
      <>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 4, flexWrap: 'wrap' }}>
          <Typography variant='h2' sx={{ fontWeight: 800, fontSize: { xs: 30, md: 46 } }}>
            {t('watchList')}
          </Typography>
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 5 }}>
              {stats.map(stat => (
                <Box key={stat.label}>
                  <Typography sx={{ fontWeight: 800, fontSize: 40, lineHeight: 1, color: stat.color }}>{stat.value}</Typography>
                  <Typography sx={{ mt: 1, fontWeight: 500, fontSize: 13, color: 'rgba(255,255,227,0.6)' }}>{stat.label}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <WatchListToolbar filters={board.filters} genres={board.genres} onChange={board.updateFilters} compact={isMobile} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
          <FilterPills
            ariaLabel={t('typeFilter')}
            options={typePills}
            value={board.filters.type}
            onChange={type => board.updateFilters({ type })}
            size={isMobile ? 'small' : 'medium'}
          />
          {/* On mobile the status filter is the tab row inside WatchListMobileList. */}
          {!isMobile && (
            <>
              <Box sx={{ width: '1px', alignSelf: 'stretch', my: 0.5, mx: 0.75, backgroundColor: 'rgba(255,255,255,0.15)' }} />
              <FilterPills
                ariaLabel={t('statusFilter')}
                options={statusPills}
                value={board.filters.status}
                onChange={status => board.updateFilters({ status })}
              />
            </>
          )}
        </Box>

        {results}
      </>
    );
  }

  return (
    <>
      <SummaryModal open={!!selectedItem} item={selectedItem ?? undefined} onClose={() => setSelectedItem(null)} />
      <NavBar />

      <Box
        component='main'
        sx={{
          pt: theme => `calc(${navbarHeight} + ${theme.spacing(isMobile ? 2.5 : 6)})`,
          pb: 6,
          px: { xs: 2, md: 6 },
          maxWidth: 1440,
          mx: 'auto',
          minHeight: '72vh',
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 1.75, md: 2.5 },
        }}
      >
        {content}
      </Box>

      <Footer />
    </>
  );
};

export default WatchList;
