import { useContext, useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { movieService, Movie } from 'src/core/services/movie.service';
import { tvService, TvShow } from 'src/core/services/tv.service';
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

export type SummaryModalDetails = (MovieDetails & TVShowDetails) | undefined;
interface SummaryModalProps {
  // You can add props here if needed
  open: boolean;
  item?: (TvShow & Movie) | TvShow | Movie;
  onClose: () => void;
}

const SummaryModal = (props: SummaryModalProps) => {
  const { open, item, onClose } = props;
  const { setSnackBarProps } = useContext(AppContext);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const [itemDetails, setItemDetails] = useState<SummaryModalDetails>();
  const [tabValue, setTabValue] = useState('1');

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const fetchItemDetails = async () => {
    setLoading(true);
    try {
      let details: SummaryModalDetails;
      if (item?.media_type === 'movie') {
        details = await movieService.getMovieById(item.id, 'credits,videos,images');
      } else if (item?.media_type === 'tv') {
        details = await tvService.getTVById(item.id, 'credits,videos,images');
      }

      setItemDetails(details);
    } catch {
      setSnackBarProps({
        open: true,
        message: t('errorLoadingItemDetails'),
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (open) {
      fetchItemDetails();
    }
    // You can perform side effects here if needed
  }, [open]);
  return (
    <Dialog maxWidth='md' onClose={onClose} open={open}>
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
            gap: 2,
            backgroundImage: itemDetails?.backdrop_path
              ? `linear-gradient(to top, ${colors.phantomBlack.replace('0.6', '1')} 0%, rgba(20,20,20,0.4) 45%, rgba(20,20,20,0.2) 100%), url(https://image.tmdb.org/t/p/original${itemDetails.backdrop_path})`
              : `linear-gradient(135deg, #5A431C 0%, #1f0303 100%)`,
            backgroundSize: 'cover',
          }}
        >
          {/* Title */}
          <Typography sx={{ textAlign: 'center' }} color='primary' variant='h1'>
            {itemDetails?.name ?? itemDetails?.title ?? 'Untitled'}
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
              sx={{ borderBottom: 1, borderColor: 'divider' }}
              onChange={handleTabChange}
            >
              <Tab label={t('overview')} value='1' />
              <Tab
                label={t('episodes') + (itemDetails?.seasons ? ` • ${t('seasonsCount', { count: itemDetails.seasons.length })}` : '')}
                value='2'
              />
            </TabList>
            <TabPanel sx={{ p: 0 }} value='1' tabIndex={0}>
              <SummaryModalOverviewTab itemDetails={itemDetails} item={item} />
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value='2' tabIndex={0}>
              {itemDetails?.seasons && <SummaryModalEpisodesTab seasons={itemDetails.seasons} />}
            </TabPanel>
          </TabContext>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default SummaryModal;
