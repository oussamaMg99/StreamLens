import { forwardRef, ReactElement, Ref, UIEvent, useContext, useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { Theme, useMediaQuery } from '@mui/material';
import { Movie } from 'src/core/services/movie.service';
import { TvShow } from 'src/core/services/tv.service';
import { useTranslation } from 'react-i18next';
import { TVShowDetails } from 'src/core/models/tvShowDetails.model';
import { MovieDetails } from 'src/core/models/movieDetails.model';
import SummaryModalSkeleton from './SummaryModalSkeleton.component';
import SummaryModalOverviewTab from './SummaryModalOverviewTab.component';
import SummaryModalEpisodesTab from './SummaryModalEpisodesTab.component';
import SummaryModalStatusPill from './SummaryModalStatusPill.component';
import SummaryModalMobileHeader from './SummaryModalMobileHeader.component';
import AppContext from 'src/core/context/global/AppContext';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { isMovie, isTvShow } from 'src/utils/global.utils';
import { useMediaDetails } from 'src/core/hooks/useMediaDetails';
import { MOBILE_BAR_HEIGHT, MOBILE_SHEET_BG, SCROLLED_THRESHOLD } from './summaryModal.styles';

// MovieDetails/TVShowDetails now carry their own media_type discriminant (see
// common.model.ts's MediaDetails base), so this is just a convenience alias for the
// family of components under this file — no local tagging needed anymore.
export type SummaryModalDetails = MovieDetails | TVShowDetails | undefined;

interface SummaryModalProps {
  open: boolean;
  item?: Movie | TvShow;
  onClose: () => void;
}

/** Full-screen sheets slide up from the bottom; the desktop dialog keeps MUI's fade. */
const SlideUp = forwardRef(function SlideUp(props: TransitionProps & { children: ReactElement }, ref: Ref<unknown>) {
  return <Slide direction='up' ref={ref} {...props} />;
});

const SummaryModal = (props: SummaryModalProps) => {
  const { open, item, onClose } = props;
  const { setSnackBarProps } = useContext(AppContext);
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState('1');
  // Below sm (600px) the dialog becomes a full-screen sheet with one scroll.
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  // Mobile only: once the header has scrolled away, a compact title bar takes its place.
  const [scrolled, setScrolled] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const next = event.currentTarget.scrollTop > SCROLLED_THRESHOLD;
    if (next !== scrolled) setScrolled(next);
  };

  // A fresh sheet always starts at the top with the full header.
  useEffect(() => {
    if (!open) setScrolled(false);
  }, [open]);

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

  const tabs = (
    <TabList
      centered={!isMobile}
      variant={isMobile ? 'fullWidth' : 'standard'}
      aria-label='lab tabs'
      indicatorColor='primary'
      sx={{
        borderBottom: 1,
        borderColor: 'rgba(226, 168, 71, 0.25)',
        // Mobile: the tabs stay reachable while the page scrolls, tucked under the
        // compact bar once it shows.
        ...(isMobile && {
          position: 'sticky',
          top: scrolled ? MOBILE_BAR_HEIGHT : 0,
          zIndex: 2,
          backgroundColor: MOBILE_SHEET_BG,
          transition: 'top .15s ease',
          '& .MuiTab-root': { minHeight: 48 },
        }),
      }}
      onChange={handleTabChange}
    >
      <Tab label={t('overview')} value='1' />
      {isTvShow(item) && (
        <Tab label={t('episodes') + (tvDetails?.seasons ? ` • ${t('seasonsCount', { count: tvDetails.seasons.length })}` : '')} value='2' />
      )}
    </TabList>
  );

  const panels = (
    <>
      <TabPanel sx={{ p: 0 }} value='1'>
        <SummaryModalOverviewTab itemDetails={itemDetails} compact={isMobile} onBrowseEpisodes={() => setTabValue('2')} />
      </TabPanel>
      {isTvShow(item) && (
        <TabPanel sx={{ p: 0 }} value='2'>
          {/* key by show: remounting resets the picked season, so opening another
              show doesn't inherit the previous one's selection. */}
          {tvDetails && <SummaryModalEpisodesTab key={tvDetails.id} item={item} itemDetails={tvDetails} compact={isMobile} />}
        </TabPanel>
      )}
    </>
  );

  return (
    <Dialog
      maxWidth='md'
      fullWidth
      fullScreen={isMobile}
      // MUI 9: slots/slotProps replace TransitionComponent/PaperProps.
      slots={{ transition: isMobile ? SlideUp : undefined }}
      slotProps={{ paper: { sx: { position: 'relative', ...(isMobile && { backgroundColor: MOBILE_SHEET_BG }) } } }}
      onClose={onClose}
      open={open}
    >
      {/* While loading there's no header yet, so phones get the regular close button too. */}
      {isMobile && !loading ? (
        // Compact bar: invisible over the header, fades in once it has scrolled away.
        // The header's own close button covers the unscrolled state.
        <Box
          aria-hidden={!scrolled}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 3,
            height: MOBILE_BAR_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            pl: 2,
            pr: 1,
            backgroundColor: '#21150C',
            borderBottom: '1px solid rgba(226, 168, 71, 0.2)',
            opacity: scrolled ? 1 : 0,
            pointerEvents: scrolled ? 'auto' : 'none',
            transition: 'opacity .15s ease',
          }}
        >
          <Typography noWrap color='primary' sx={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: 16 }}>
            {title}
          </Typography>
          <IconButton
            aria-label='close'
            onClick={onClose}
            tabIndex={scrolled ? 0 : -1}
            sx={{ width: 44, height: 44, color: 'primary.main' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      ) : (
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
      )}
      {loading ? (
        <SummaryModalSkeleton />
      ) : isMobile ? (
        // One scroll container for the whole sheet: header, sticky tabs, tab content and
        // the Overview's sticky action bar all live inside it.
        <DialogContent
          onScroll={handleScroll}
          sx={{
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'hidden',
            backgroundImage: 'linear-gradient(160deg, #5A431C 0%, #1f0303 60%)',
          }}
        >
          <SummaryModalMobileHeader itemDetails={itemDetails} title={title} onClose={onClose} />
          <TabContext value={tabValue}>
            {tabs}
            {panels}
          </TabContext>
        </DialogContent>
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
            {tabs}
            {panels}
          </TabContext>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default SummaryModal;
