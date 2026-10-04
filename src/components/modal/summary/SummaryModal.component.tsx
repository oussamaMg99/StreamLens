import { useContext, useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { Movie } from 'src/core/services/movie.service';
import { TvShow } from 'src/core/services/tv.service';
import { useTranslation } from 'react-i18next';
import colors from 'src/assets/themes/colors';
import { TVShowDetails } from 'src/core/models/tvShowDetails.model';
import { MovieDetails } from 'src/core/models/movieDetails.model';
import SummaryModalSkeleton from './SummaryModalSkeleton.component';
import SummaryModalOverviewTab from './SummaryModalOverviewTab.component';
import SummaryModalEpisodesTab from './SummaryModalEpisodesTab.component';
import SummaryModalStatusPill from './SummaryModalStatusPill.component';
import AppContext from 'src/core/context/global/AppContext';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { isMovie, isTvShow } from 'src/utils/global.utils';
import { useMediaDetails } from 'src/core/hooks/useMediaDetails';

// MovieDetails/TVShowDetails now carry their own media_type discriminant (see
// common.model.ts's MediaDetails base), so this is just a convenience alias for the
// family of components under this file — no local tagging needed anymore.
export type SummaryModalDetails = MovieDetails | TVShowDetails | undefined;

interface SummaryModalProps {
  // You can add props here if needed
  open: boolean;
  item?: Movie | TvShow;
  onClose: () => void;
}

const SummaryModal = (props: SummaryModalProps) => {
  const { open, item, onClose } = props;
  const { setSnackBarProps } = useContext(AppContext);
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState('1');

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  // Shared with every other consumer of the same title (see useMediaDetails): the modal
  // only adds `enabled: open`, so nothing is fetched for a closed dialog.
  const { data, isLoading: loading, error } = useMediaDetails(item, { enabled: open });
  // Re-bound through a plain-union local: TanStack Query's inferred `data` type doesn't
  // narrow via `media_type` discriminant checks as cleanly as an ordinary union does.
  const itemDetails: SummaryModalDetails = data;

  useEffect(() => {
    if (error) {
      setSnackBarProps({
        open: true,
        message: t('errorLoadingItemDetails'),
        severity: 'error',
      });
    }
  }, [error]);

  const tvDetails = isTvShow(itemDetails) ? itemDetails : undefined;
  const title = isMovie(itemDetails) ? itemDetails.title : (tvDetails?.name ?? 'Untitled');

  return (
    <Dialog maxWidth='md' fullWidth onClose={onClose} open={open}>
      <IconButton
        aria-label='close'
        onClick={onClose}
        sx={theme => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.primary.main,
        })}
      >
        <CloseIcon />
      </IconButton>
      {loading ? (
        <SummaryModalSkeleton />
      ) : (
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            // Darkest at the top (behind the title/status pill) fading out toward the
            // bottom — the overlay needs to be strongest exactly where the fixed-color
            // text sits, regardless of how bright the backdrop image itself is there.
            backgroundImage: /* itemDetails?.backdrop_path
              ? `linear-gradient(to bottom, ${colors.phantomBlack.replace('0.6', '1')} 0%, rgba(20,20,20,0.55) 35%, rgba(20,20,20,0.15) 100%), url(https://image.tmdb.org/t/p/original${itemDetails.backdrop_path})`
              :  */ `linear-gradient(135deg, #5A431C 0%, #1f0303 100%)`,
            backgroundSize: 'cover',
          }}
        >
          {/* Title */}
          <Typography sx={{ textAlign: 'center', textShadow: '0 2px 6px rgba(0,0,0,0.6)' }} color='primary' variant='h1'>
            {title}
          </Typography>
          {/* Status */}
          {itemDetails?.status && (
            <SummaryModalStatusPill status={itemDetails?.status as 'Returning Series' | 'In Production' | 'Ended' | 'Canceled'} />
          )}
          <TabContext value={tabValue}>
            <TabList
              centered
              aria-label='lab tabs'
              indicatorColor='primary'
              sx={{ borderBottom: 1, borderColor: 'rgba(226, 168, 71, 0.25)' }}
              onChange={handleTabChange}
            >
              <Tab label={t('overview')} value='1' />
              {isTvShow(item) && (
                <Tab
                  label={t('episodes') + (tvDetails?.seasons ? ` • ${t('seasonsCount', { count: tvDetails.seasons.length })}` : '')}
                  value='2'
                />
              )}
            </TabList>

            <TabPanel sx={{ p: 0 }} value='1'>
              <SummaryModalOverviewTab itemDetails={itemDetails} />
            </TabPanel>
            {isTvShow(item) && (
              <TabPanel sx={{ p: 0 }} value='2'>
                {/* key by show: remounting resets the picked season, so opening another
                    show doesn't inherit the previous one's selection. */}
                {tvDetails && <SummaryModalEpisodesTab key={tvDetails.id} item={item} itemDetails={tvDetails} />}
              </TabPanel>
            )}
          </TabContext>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default SummaryModal;
