import { ReactNode, useContext, useMemo, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import NavBar from 'src/components/navbar/Navbar';
import Footer from 'src/components/footer/Footer.component';
import SummaryModal from 'src/components/modal/summary/SummaryModal.component';
import InsightsHero from 'src/components/insights/InsightsHero.component';
import InsightSection, { InsightBadge } from 'src/components/insights/InsightSection.component';
import WatchSplit from 'src/components/insights/WatchSplit.component';
import GenresInsight from 'src/components/insights/GenresInsight.component';
import GenreSuggestionRow from 'src/components/insights/GenreSuggestionRow.component';
import ResumeShowCard from 'src/components/insights/ResumeShowCard.component';
import InsightsEmptyState from 'src/components/insights/InsightsEmptyState.component';
import InsightsGatePrompt from 'src/components/insights/InsightsGatePrompt.component';
import AppContext from 'src/core/context/global/AppContext';
import { useInsightsSummary } from 'src/core/hooks/useInsightsSummary';
import { useWatchList } from 'src/core/hooks/useWatchList';
import { useWatchListGate } from 'src/core/hooks/useWatchListGate';
import { watchListEntryId } from 'src/core/services/watchList.service';
import { Movie } from 'src/core/services/movie.service';
import { TvShow } from 'src/core/services/tv.service';
import { MediaType } from 'src/types/global.type';
import { navbarHeight } from 'src/utils/constants';

/** Default type per suggestion row; each row can be switched independently. */
const DEFAULT_ROW_TYPES: MediaType[] = [MediaType.Movie, MediaType.TVShow, MediaType.Movie];

/**
 * Insights - a feed of InsightSections under a summary hero. To add an insight, add a
 * section to the feed below; the layout needs no other change.
 */
const Insights = () => {
  const { t } = useTranslation();
  const { user } = useContext(AppContext);
  const { access, promptIfBlocked } = useWatchListGate();
  const { data: summary, isLoading } = useInsightsSummary();
  // Unverified users are denied by firestore.rules, so don't spend a read finding that out.
  const { data: watchList } = useWatchList(user?.uid, { enabled: access === 'ready' });

  const [rowTypes, setRowTypes] = useState<MediaType[]>(DEFAULT_ROW_TYPES);
  const [selectedItem, setSelectedItem] = useState<Movie | TvShow | null>(null);

  // Suggestions skip everything already on the list, watched or only saved.
  const excludeKeys = useMemo(() => new Set((watchList?.watch_list ?? []).map(watchListEntryId)), [watchList]);

  // One row per rank that has a genre in either type. A row falls back to the other type
  // when the chosen one has nothing at that rank, and only offers the switch when both do.
  const suggestionRows = DEFAULT_ROW_TYPES.flatMap((_, index) => {
    const movieGenre = summary.topGenres.movie[index];
    const tvGenre = summary.topGenres.tv[index];
    if (!movieGenre && !tvGenre) return [];
    const preferMovie = rowTypes[index] === MediaType.Movie;
    const type = (preferMovie && movieGenre) || !tvGenre ? MediaType.Movie : MediaType.TVShow;
    const genre = type === MediaType.Movie ? movieGenre : tvGenre;
    return [{ index, type, genre, switchable: !!movieGenre && !!tvGenre }];
  });

  const isEmpty = summary.movies + summary.tvShows === 0;
  const openItem = (item: Movie | TvShow) => setSelectedItem(item);
  const setRowType = (index: number, next: MediaType) => setRowTypes(prev => prev.map((value, i) => (i === index ? next : value)));

  let content: ReactNode;
  if (access === 'loading' || isLoading) {
    content = (
      <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress color='primary' />
      </Box>
    );
  } else if (access === 'signedOut' || access === 'unverified') {
    content = <InsightsGatePrompt access={access} onAction={promptIfBlocked} />;
  } else if (isEmpty) {
    content = <InsightsEmptyState name={user?.displayName} />;
  } else {
    content = (
      <>
        <InsightsHero name={user?.displayName} movies={summary.movies} tvShows={summary.tvShows} hoursWatched={summary.hoursWatched} />

        <InsightSection title={t('moviesVsTvShows')} description={t('moviesVsTvShowsHint')}>
          <WatchSplit movies={summary.movies} tvShows={summary.tvShows} seasonsFinished={summary.seasonsFinished} />
        </InsightSection>

        <GenresInsight topGenres={summary.topGenres} movies={summary.movies} tvShows={summary.tvShows} />

        {suggestionRows.length > 0 && (
          <InsightSection bleedRight title={t('pickedForYou')} description={t('pickedForYouHint')}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 2.75 } }}>
              {suggestionRows.map(row => (
                <GenreSuggestionRow
                  key={row.index}
                  rank={row.index + 1}
                  genre={row.genre}
                  mediaType={row.type}
                  onMediaTypeChange={row.switchable ? next => setRowType(row.index, next) : undefined}
                  excludeKeys={excludeKeys}
                  onItemClick={openItem}
                />
              ))}
            </Box>
          </InsightSection>
        )}

        {summary.resume.length > 0 && (
          <InsightSection dashed bleedRight title={t('pickUpWhereYouLeftOff')} badge={<InsightBadge label={t('new')} />}>
            <Box
              sx={{
                display: { xs: 'flex', sm: 'grid' },
                gridTemplateColumns: { sm: 'repeat(2, minmax(0,1fr))', lg: 'repeat(4, minmax(0,1fr))' },
                gap: 1.75,
                overflowX: { xs: 'auto', sm: 'visible' },
                mr: { xs: -2, sm: 0 },
                pr: { xs: 2, md: 3.5 },
                pb: { xs: 1, sm: 0 },
              }}
            >
              {summary.resume.map(show => (
                <ResumeShowCard key={show.id} show={show} onClick={openItem} />
              ))}
            </Box>
          </InsightSection>
        )}
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
          pt: theme => `calc(${navbarHeight} + ${theme.spacing(4)})`,
          px: { xs: 2, md: 6 },
          maxWidth: 1440,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 0, md: 2.5 },
        }}
      >
        {content}
      </Box>

      <Footer />
    </>
  );
};

export default Insights;
