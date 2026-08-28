import { useContext, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Typography from '@mui/material/Typography';
import { movieService, Movie } from 'src/core/services/movie.service';
import { tvService, TvShow } from 'src/core/services/tv.service';
import NoPoster from 'src/assets/images/no-movie.png';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import colors from 'src/assets/themes/colors';
import GenreTag from '../tag/GenreTag.component';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { TVShowDetails } from 'src/core/models/tvShowDetails.model';
import { MovieDetails } from 'src/core/models/movieDetails.model';
import SummaryModalSkeleton from './SummaryModalSkeleton.component';

interface SummaryModalProps {
  // You can add props here if needed
  open: boolean;
  item?: TvShow & Movie;
  onClose: () => void;
}

const SummaryModal = (props: SummaryModalProps) => {
  const { open, item, onClose } = props;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  type detailsType = (MovieDetails & TVShowDetails) | undefined;
  const [itemDetails, setItemDetails] = useState<detailsType>();

  const fetchItemDetails = async () => {
    setLoading(true);
    try {
      let details: detailsType;
      if (item?.media_type === 'movie') {
        details = await movieService.getMovieById(item.id, 'credits,videos,images');
      } else if (item?.media_type === 'tv') {
        details = await tvService.getTVById(item.id, 'credits,videos,images');
      }

      setItemDetails(details);
    } catch (error) {
      console.error('Error loading item details:', error);
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
            backgroundImage: itemDetails?.backdrop_path
              ? `linear-gradient(to top, ${colors.phantomBlack.replace('0.6', '1')} 0%, rgba(20,20,20,0.4) 45%, rgba(20,20,20,0.2) 100%), url(https://image.tmdb.org/t/p/original${itemDetails.backdrop_path})`
              : `linear-gradient(135deg, #5A431C 0%, #1f0303 100%)`,
            backgroundSize: 'cover',
          }}
        >
          {/* Title */}
          <Typography sx={{ my: 2, py: 2, textAlign: 'center' }} color='primary' variant='h1'>
            {itemDetails?.name ?? itemDetails?.title ?? 'Untitled'}
          </Typography>
          {/* Info bar */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', mb: 2, gap: 2 }}>
            {item?.media_type == 'movie' && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                <AvTimerIcon />
                <Typography variant='h5'>{itemDetails?.runtime ? `${itemDetails.runtime} ${t('minute(s)')}` : 'N/A'}</Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              <CalendarMonthIcon />
              <Typography variant='h5'>{itemDetails?.release_date ?? itemDetails?.first_air_date ?? 'N/A'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              <StarIcon />
              <Typography variant='h5'>
                {`${itemDetails?.vote_average ?? 'N/A'} / 10 (${itemDetails?.vote_count ?? 0} ${t('votes')})`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              {itemDetails?.genres?.map(genre => (
                <GenreTag key={genre.id} tagName={t(genre.name)} />
              ))}
            </Box>
          </Box>
          {/* Poster and overview */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              mb: 2,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Poster image */}
            <img
              width={200}
              height={300}
              style={{ borderRadius: 10, marginBottom: 8 }}
              src={itemDetails?.poster_path ? `https://image.tmdb.org/t/p/w200${itemDetails.poster_path}` : NoPoster}
              alt={itemDetails?.name ?? itemDetails?.title ?? 'Untitled'}
            />
            <Box sx={{ ml: { xs: 0, sm: 4 }, mt: { xs: 2, sm: 0 }, width: { xs: '100%', sm: '48%' } }}>
              <Typography gutterBottom>{itemDetails?.overview ?? t('noSummaryAvailable')}</Typography>
              <Box sx={{ my: 4, display: 'flex', flexDirection: 'row', gap: 2, mt: 2, justifyContent: 'center' }}>
                <Button variant='contained' startIcon={<PlayArrowIcon />} onClick={onClose}>
                  {t('watchTrailer')}
                </Button>
                <Button variant='contained' startIcon={<BookmarkAddIcon />} onClick={onClose}>
                  {t('saveToWatchList')}
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default SummaryModal;
