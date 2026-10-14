import { useContext, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import NoPoster from 'src/assets/images/no-movie.png';
import colors from 'src/assets/themes/colors';
import { Result } from 'src/core/models/common.model';
import SummaryModalInfoBar from './SummaryModalInfoBar.component';
import { YouTubePlayer } from 'src/components/player/YouTubePlayer.component';
import { SummaryModalDetails } from './SummaryModal.component';
import { isMovie, isTvShow } from 'src/utils/global.utils';
import AppContext from 'src/core/context/global/AppContext';
import { useWatchListEntry } from 'src/core/hooks/useWatchList';
import { useAddToWatchList, useRemoveFromWatchList, useSetMovieWatched } from 'src/core/hooks/useWatchListMutations';
import { useWatchListGate } from 'src/core/hooks/useWatchListGate';
import { entryMetaFromDetails } from 'src/utils/watchListMeta.utils';
import { MOBILE_ACTIONS_BG } from './summaryModal.styles';

/** Overviews longer than this fold behind "More" on mobile (≈ 4 lines at 390px). */
const CLAMP_CHARS = 220;

interface SummaryModalOverviewTabProps {
  itemDetails?: SummaryModalDetails;
  /** Switches the modal to its Episodes tab (TV only); the tab state lives in SummaryModal. */
  onBrowseEpisodes?: () => void;
  /**
   * Mobile sheet: poster and info bar live in SummaryModalMobileHeader, the overview
   * folds to 4 lines, the trailer goes full width, and the actions move to a bar pinned
   * to the bottom of the sheet.
   */
  compact?: boolean;
}

const SummaryModalOverviewTab = (props: SummaryModalOverviewTabProps) => {
  const { itemDetails, onBrowseEpisodes, compact } = props;
  const { t } = useTranslation();
  const { setSnackBarProps } = useContext(AppContext);
  const [trailerVideoId, setTrailerVideoId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const gate = useWatchListGate();
  const watchListEntry = useWatchListEntry(itemDetails);
  const addToList = useAddToWatchList();
  const removeFromList = useRemoveFromWatchList();
  const setMovieWatched = useSetMovieWatched();
  const watchListPending = addToList.isPending || removeFromList.isPending || setMovieWatched.isPending;
  const movieWatched = watchListEntry?.media_type === 'movie' && watchListEntry.watched;

  /**
   * Blocked (signed out, or signed in but unverified — firestore.rules requires a
   * verified email), the button becomes the prompt rather than a dead control or a
   * write that's guaranteed to be denied.
   */
  const handleWatchListClick = () => {
    if (gate.promptIfBlocked()) return;
    if (!itemDetails) return;
    const entryRef = { media_type: itemDetails.media_type, id: itemDetails.id };
    const onSuccess = (messageKey: string) => () => setSnackBarProps({ open: true, severity: 'success', message: t(messageKey) });
    if (watchListEntry) removeFromList.mutate(entryRef, { onSuccess: onSuccess('removedFromWatchList') });
    else addToList.mutate({ ...entryRef, meta: entryMetaFromDetails(itemDetails) }, { onSuccess: onSuccess('savedToWatchList') });
  };

  /** Movies only: toggles watched, which also puts the movie on the list if needed. */
  const handleMovieWatchedClick = () => {
    if (gate.promptIfBlocked()) return;
    if (!isMovie(itemDetails)) return;
    const watched = !movieWatched;
    setMovieWatched.mutate(
      { id: itemDetails.id, watched, meta: entryMetaFromDetails(itemDetails) },
      {
        onSuccess: () =>
          setSnackBarProps({ open: true, severity: 'success', message: t(watched ? 'movieMarkedWatched' : 'movieMarkedUnwatched') }),
      },
    );
  };

  const isOfficialYoutubeTrailer = (video: Result) => {
    return video.type === 'Trailer' && video.official && video.site === 'YouTube';
  };

  useEffect(() => {
    if (itemDetails?.videos?.results) {
      const officialTrailer = itemDetails.videos.results.find(isOfficialYoutubeTrailer);
      setTrailerVideoId(officialTrailer ? officialTrailer.key : null);
    }
  }, [itemDetails]);

  const title = isMovie(itemDetails) ? itemDetails.title : isTvShow(itemDetails) ? itemDetails.name : 'Untitled';
  const overview = itemDetails?.overview || t('noSummaryAvailable');
  const foldable = compact && overview.length > CLAMP_CHARS;

  // In the mobile bar both buttons share the width, so labels must stay short:
  // "Saved" replaces "Remove from watch list" (tapping it still removes).
  const watchListLabel = watchListEntry ? (compact ? t('summaryModalSaved') : t('removeFromWatchList')) : t('saveToWatchList');
  const buttonSx = compact ? { flex: 1, minWidth: 0, minHeight: 48, whiteSpace: 'nowrap' } : undefined;

  const actions = (
    <>
      {/* Empty title renders no tooltip, so unblocked users just get the button. */}
      <Tooltip title={gate.blockedHint}>
        <Button
          variant='contained'
          startIcon={watchListEntry ? <BookmarkAddedIcon /> : <BookmarkAddIcon />}
          // 'loading' access: the session is still being restored, so a click would
          // prompt sign-in for someone who is actually signed in.
          disabled={gate.access === 'loading' || watchListPending || !itemDetails}
          onClick={handleWatchListClick}
          aria-pressed={compact ? !!watchListEntry : undefined}
          sx={buttonSx}
        >
          {watchListLabel}
        </Button>
      </Tooltip>
      {isMovie(itemDetails) && (
        <Tooltip title={gate.blockedHint}>
          <Button
            variant={movieWatched ? 'contained' : 'outlined'}
            aria-pressed={movieWatched}
            startIcon={movieWatched ? <CheckCircleIcon /> : <CheckCircleOutlinedIcon />}
            disabled={gate.access === 'loading' || watchListPending}
            onClick={handleMovieWatchedClick}
            sx={{ ...buttonSx, ...(movieWatched && { color: colors.onPrimary }) }}
          >
            {movieWatched ? t('markedAsWatched') : t('markAsWatched')}
          </Button>
        </Tooltip>
      )}
      {isTvShow(itemDetails) && (
        <Button variant='outlined' startIcon={<FormatListBulletedIcon />} onClick={onBrowseEpisodes} sx={buttonSx}>
          {t('browseEpisodes')}
        </Button>
      )}
    </>
  );

  if (compact) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, px: 2, pt: 2.25, pb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
            <Typography
              sx={{
                fontSize: 15,
                lineHeight: 1.6,
                ...(foldable &&
                  !expanded && { display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }),
              }}
            >
              {overview}
            </Typography>
            {foldable && (
              <Button
                variant='text'
                onClick={() => setExpanded(value => !value)}
                aria-expanded={expanded}
                sx={{ minHeight: 32, px: 0, minWidth: 0, fontWeight: 600, textTransform: 'none' }}
              >
                {expanded ? t('showLess') : t('more')}
              </Button>
            )}
          </Box>
          {trailerVideoId && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography
                sx={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,227,0.6)' }}
              >
                {t('trailer')}
              </Typography>
              {/* Full width at 16:9; see README if YouTubePlayer sets its own size. */}
              <YouTubePlayer
                videoId={trailerVideoId}
                sx={{
                  width: '100%',
                  aspectRatio: '16 / 9',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  '& iframe': { width: '100%', height: '100%' },
                }}
              />
            </Box>
          )}
        </Box>
        {/* Sticky inside the sheet's single scroll container, so it stays pinned while reading. */}
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            zIndex: 2,
            display: 'flex',
            gap: 1.25,
            px: 2,
            pt: 1.5,
            pb: 'calc(12px + env(safe-area-inset-bottom))',
            backgroundColor: MOBILE_ACTIONS_BG,
            borderTop: '1px solid rgba(226, 168, 71, 0.2)',
          }}
        >
          {actions}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 0, m: 0 }}>
      <SummaryModalInfoBar itemDetails={itemDetails} />
      {/* Poster and overview */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },

          justifyContent: 'space-evenly',
          alignItems: 'center',
        }}
      >
        {/* Poster image */}
        <img
          width={200}
          height={300}
          style={{ borderRadius: 10 }}
          src={itemDetails?.poster_path ? `https://image.tmdb.org/t/p/w200${itemDetails.poster_path}` : NoPoster}
          alt={title}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: { xs: '100%', sm: '48%' } }}>
          <Typography gutterBottom>{itemDetails?.overview ?? t('noSummaryAvailable')}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'center' }}>{actions}</Box>
          {trailerVideoId && <YouTubePlayer videoId={trailerVideoId} sx={{ display: 'flex', justifyContent: 'center' }} />}
        </Box>
      </Box>
    </Box>
  );
};

export default SummaryModalOverviewTab;
