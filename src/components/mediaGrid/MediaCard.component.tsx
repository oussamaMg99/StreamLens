import { Box, Chip, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import colors from 'src/assets/themes/colors';
import NoPoster from 'src/assets/images/no-movie.png';

/**
 * Minimal, media-agnostic display shape for a poster card.
 *
 * Callers compute title/year/rating/posterPath at their own mapping site (where
 * the real Movie/TvShow type is already known) and spread them onto the item —
 * the same pattern already used for SearchResultItem in SearchBar.component.tsx —
 * so this component never needs to guess between movie/tv field names.
 */
export interface MediaCardData {
  id: number;
  title: string;
  posterPath?: string;
  year?: string;
  rating?: string;
}

interface MediaCardProps<T extends MediaCardData> {
  item: T;
  onClick: (item: T) => void;
}

/**
 * MediaCard - poster card used by Home's teaser rows and the Movies/TV Shows
 * pages' full grids. Extracted from Home.page.tsx so it isn't duplicated across
 * those pages.
 */
const MediaCard = <T extends MediaCardData>({ item, onClick }: MediaCardProps<T>) => {
  return (
    <Box
      onClick={() => onClick(item)}
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        aspectRatio: '2 / 3',
        backgroundColor: colors.phantomBlack,
        boxShadow: '0px 4px 12px rgba(0,0,0,0.2)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-4px) scale(1.02)',
          boxShadow: '0px 8px 20px rgba(0,0,0,0.35)',
          '& .media-overlay': { opacity: 1 },
        },
      }}
    >
      <Box
        component='img'
        src={item.posterPath ? `https://image.tmdb.org/t/p/w300${item.posterPath}` : NoPoster}
        alt={item.title}
        loading='lazy'
        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />

      {item.rating && (
        <Chip
          icon={<StarIcon sx={{ fontSize: 16, color: colors.primary.main }} />}
          label={item.rating}
          size='small'
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: colors.text.primary,
            fontWeight: 700,
            '& .MuiChip-icon': { ml: '6px' },
          }}
        />
      )}

      <Box
        className='media-overlay'
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 1.5,
          opacity: { xs: 1, md: 0 },
          transition: 'opacity 0.25s ease',
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)',
        }}
      >
        <Typography variant='subtitle2' color='text.primary' noWrap sx={{ fontWeight: 700 }}>
          {item.title}
        </Typography>
        {item.year && (
          <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {item.year}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default MediaCard;
