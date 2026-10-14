import { ReactNode } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import MediaCard, { MediaCardData } from './MediaCard.component';

interface MediaGridProps<T extends MediaCardData> {
  title?: string;
  titleAction?: ReactNode;
  loading?: boolean;
  items?: T[];
  onItemClick: (item: T) => void;
}

/**
 * MediaGrid - responsive grid of MediaCards, with an optional heading (+ an optional
 * action next to it, e.g. a "See all" link) and loading state.
 *
 * Used by Home's teaser rows (title + a "See all" link + a small slice of items) and
 * by the Movies/TV Shows pages' full browsing grids (page itself owns the heading there).
 */
const MediaGrid = <T extends MediaCardData>({ title, titleAction, loading, items, onItemClick }: MediaGridProps<T>) => {
  if (loading) {
    return (
      <Box sx={{ width: '100%', minHeight: '30vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress color='primary' />
      </Box>
    );
  }

  return (
    <Box component='section' sx={{ px: { xs: 2, md: 6 }, py: { xs: 3, md: 5 } }}>
      {(title || titleAction) && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          {title && (
            <Typography variant='h3' sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              {title}
            </Typography>
          )}
          {titleAction}
        </Box>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
            lg: 'repeat(6, 1fr)',
          },
          gap: { xs: 1.5, md: 2 },
        }}
      >
        {items?.map(item => (
          <MediaCard key={item.id} item={item} onClick={onItemClick} />
        ))}
      </Box>
    </Box>
  );
};

export default MediaGrid;
