import { Box, Typography } from '@mui/material';
import { TvShow } from 'src/core/services/tv.service';
import NoPoster from 'src/assets/images/no-movie.png';
import { Movie } from 'src/core/services/movie.service';

interface PopularCardProps {
  item: TvShow & Movie;
  onClick?: (item: TvShow & Movie) => void;
}

const PopularCard = (props: PopularCardProps) => {
  const { item, onClick } = props;
  return (
    <Box key={item.id} sx={{ width: 200, margin: theme => theme.spacing(2), cursor: 'pointer' }} onClick={() => onClick?.(item)}>
      <img
        style={{ borderRadius: 10, marginBottom: 8 }}
        width={200}
        src={item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : NoPoster}
        alt={item.name ?? item.original_title ?? 'Untitled'}
      />
      <Typography variant='h6' color='text.primary' textAlign='center' noWrap>
        {item.name ?? item.original_title ?? 'Untitled'}
      </Typography>
    </Box>
  );
};

export default PopularCard;
