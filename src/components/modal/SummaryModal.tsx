import { useContext, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';

import { Movie } from 'src/core/services/movie.service';
import { TvShow } from 'src/core/services/tv.service';
import NoPoster from 'src/assets/images/no-movie.png';
import { Box } from '@mui/material';
import AppContext from 'src/core/context/global/AppContext';

interface SummaryModalProps {
  // You can add props here if needed
  open: boolean;
  item?: TvShow & Movie;
  onClose: () => void;
}

const SummaryModal = (props: SummaryModalProps) => {
  const { open, item, onClose } = props;
  const { popularMovies, popularTVShows } = useContext(AppContext);
  useEffect(() => {
    if (open) {
      console.log('Modal opened for item:', item);
      console.log('Popular Movies from Context:', popularMovies);
      console.log('Popular TV Shows from Context:', popularTVShows);
    }
    // You can perform side effects here if needed
  }, [open]);
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle sx={{ m: 0, p: 2, textAlign: 'center' }}>
        <Typography color='primary' variant='h3'>
          {item?.name ?? item?.original_title ?? 'Untitled'}
        </Typography>
      </DialogTitle>
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
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: 2 }}>
          <img
            style={{ borderRadius: 10, marginBottom: 8 }}
            src={item?.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : NoPoster}
            alt={item?.name ?? item?.original_title ?? 'Untitled'}
          />
          <Box sx={{ ml: { xs: 0, sm: 2 }, mt: { xs: 2, sm: 0 } }}>
            <Typography variant='h6' gutterBottom>
              Release Date: {item?.release_date ?? item?.first_air_date ?? 'N/A'}
            </Typography>
            <Typography variant='h6' gutterBottom>
              Rating: {item?.vote_average ?? 'N/A'} / 10 ({item?.vote_count ?? 0} votes)
            </Typography>
            <Typography gutterBottom>{item?.overview ?? 'No summary available.'}</Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onClose}>
          Save to watch list
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SummaryModal;
