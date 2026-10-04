import { useContext, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import NoPoster from 'src/assets/images/no-movie.png';
import { Result } from 'src/core/models/common.model';
import SummaryModalInfoBar from './SummaryModalInfoBar.component';
import { YouTubePlayer } from 'src/components/player/YouTubePlayer.component';
import { SummaryModalDetails } from './SummaryModal.component';
import { isMovie, isTvShow } from 'src/utils/global.utils';
import AppContext from 'src/core/context/global/AppContext';
import { useWatchListEntry } from 'src/core/hooks/useWatchList';
import { useAddToWatchList, useRemoveFromWatchList } from 'src/core/hooks/useWatchListMutations';
import { useWatchListGate } from 'src/core/hooks/useWatchListGate';

interface SummaryModalOverviewTabProps {
  itemDetails?: SummaryModalDetails;
}

const SummaryModalOverviewTab = (props: SummaryModalOverviewTabProps) => {
  const { itemDetails } = props;
  const { t } = useTranslation();
  const { setSnackBarProps } = useContext(AppContext);
  const [trailerVideoId, setTrailerVideoId] = useState<string | null>(null);

  const gate = useWatchListGate();
  const watchListEntry = useWatchListEntry(itemDetails);
  const addToList = useAddToWatchList();
  const removeFromList = useRemoveFromWatchList();
  const watchListPending = addToList.isPending || removeFromList.isPending;

  /**
   * Blocked (signed out, or signed in but unverified — firestore.rules requires a
   * verified email), the button becomes the prompt rather than a dead control or a
   * write that's guaranteed to be denied.
   */
  const handleWatchListClick = () => {
    if (gate.promptIfBlocked()) return;
    if (!itemDetails) return;
    const entryRef = { media_type: itemDetails.media_type, id: itemDetails.id };
    const mutation = watchListEntry ? removeFromList : addToList;
    const messageKey = watchListEntry ? 'removedFromWatchList' : 'savedToWatchList';
    mutation.mutate(entryRef, {
      onSuccess: () => setSnackBarProps({ open: true, severity: 'success', message: t(messageKey) }),
    });
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
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'center' }}>
            {/* Empty title renders no tooltip, so unblocked users just get the button. */}
            <Tooltip title={gate.blockedHint}>
              <Button
                variant='contained'
                startIcon={watchListEntry ? <BookmarkAddedIcon /> : <BookmarkAddIcon />}
                // 'loading' access: the session is still being restored, so a click would
                // prompt sign-in for someone who is actually signed in.
                disabled={gate.access === 'loading' || watchListPending || !itemDetails}
                onClick={handleWatchListClick}
              >
                {watchListEntry ? t('removeFromWatchList') : t('saveToWatchList')}
              </Button>
            </Tooltip>
            {isTvShow(itemDetails) && (
              <Button variant='outlined' startIcon={<FormatListBulletedIcon />} onClick={() => {}}>
                {t('browseEpisodes')}
              </Button>
            )}
          </Box>
          {trailerVideoId && <YouTubePlayer videoId={trailerVideoId} sx={{ display: 'flex', justifyContent: 'center' }} />}
        </Box>
      </Box>
    </Box>
  );
};

export default SummaryModalOverviewTab;
