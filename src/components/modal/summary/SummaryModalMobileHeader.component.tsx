import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import NoPoster from 'src/assets/images/no-movie.png';
import { SummaryModalDetails } from './SummaryModal.component';
import SummaryModalStatusPill from './SummaryModalStatusPill.component';
import SummaryModalInfoBar from './SummaryModalInfoBar.component';
import { TMDB_IMG } from './summaryModal.styles';

interface SummaryModalMobileHeaderProps {
  itemDetails?: SummaryModalDetails;
  title: string;
  onClose: () => void;
}

/**
 * Mobile-only header of the Summary sheet: backdrop strip, a 96×144 poster beside a
 * left-aligned title and status pill, then the compact info bar. It scrolls away with the
 * content; SummaryModal swaps in a compact title bar once it's gone.
 */
const SummaryModalMobileHeader = ({ itemDetails, title, onClose }: SummaryModalMobileHeaderProps) => (
  <Box component='header'>
    <Box
      sx={{
        position: 'relative',
        height: 210,
        backgroundColor: 'rgba(20, 20, 20, 0.6)',
        backgroundImage: itemDetails?.backdrop_path ? `url(${TMDB_IMG}/w780${itemDetails.backdrop_path})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // Fade into the sheet so the overlapping poster and title stay readable.
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(20,20,20,0.2) 0%, rgba(42,26,12,0.95) 100%)',
        },
      }}
    >
      <IconButton
        aria-label='close'
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 10,
          insetInlineEnd: 10,
          zIndex: 1,
          width: 44,
          height: 44,
          color: 'primary.main',
          backgroundColor: 'rgba(20, 20, 20, 0.6)',
          '&:hover': { backgroundColor: 'rgba(20, 20, 20, 0.8)' },
        }}
      >
        <CloseIcon />
      </IconButton>
    </Box>

    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 1.75, px: 2, mt: '-72px' }}>
      <Box
        component='img'
        src={itemDetails?.poster_path ? `${TMDB_IMG}/w200${itemDetails.poster_path}` : NoPoster}
        alt={title}
        sx={{ flex: 'none', width: 96, height: 144, objectFit: 'cover', borderRadius: '8px', boxShadow: '0 10px 24px rgba(0,0,0,0.5)' }}
      />
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, pb: 0.5 }}>
        <Typography
          component='h1'
          color='primary'
          sx={{ fontWeight: 800, fontSize: 24, lineHeight: 1.15, textWrap: 'balance', overflowWrap: 'anywhere' }}
        >
          {title}
        </Typography>
        {itemDetails?.status && (
          <SummaryModalStatusPill
            status={itemDetails.status as 'Returning Series' | 'In Production' | 'Ended' | 'Canceled'}
            sx={{ mx: 0 }}
          />
        )}
      </Box>
    </Box>

    <Box sx={{ px: 2, pt: 1.75, pb: 2 }}>
      <SummaryModalInfoBar itemDetails={itemDetails} compact />
    </Box>
  </Box>
);

export default SummaryModalMobileHeader;
