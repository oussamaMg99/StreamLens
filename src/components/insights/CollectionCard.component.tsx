import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import colors from 'src/assets/themes/colors';
import NoPoster from 'src/assets/images/no-movie.png';
import { Movie } from 'src/core/services/movie.service';
import { UnfinishedCollection } from 'src/utils/collections.utils';

interface CollectionCardProps {
  item: UnfinishedCollection;
  /** Opens the next part in the Summary modal. */
  onClick: (movie: Movie) => void;
}

/**
 * A started-but-unfinished film series: the next part's poster, the series name, the next
 * part's title and the progress. The movie counterpart of ResumeShowCard, styled the same
 * so the two sections read as a pair. Names come localized from TMDB, never stored.
 */
const CollectionCard = (props: CollectionCardProps) => {
  const { item, onClick } = props;
  const { collection, watched, total, next } = item;
  const { t } = useTranslation();
  const pct = Math.round((watched / total) * 100);

  return (
    <Box
      component='button'
      type='button'
      onClick={() => onClick(next)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.25,
        minWidth: { xs: 260, sm: 0 },
        flex: { xs: 'none', sm: 'initial' },
        textAlign: 'start',
        fontFamily: 'inherit',
        color: 'inherit',
        cursor: 'pointer',
        borderRadius: '10px',
        backgroundColor: 'rgba(20,20,20,0.5)',
        border: '1px solid rgba(255,255,255,0.08)',
        transition: 'border-color .15s ease',
        '&:hover': { borderColor: 'rgba(226,168,71,0.5)' },
        '&:focus-visible': { outline: `2px solid ${colors.primary.main}`, outlineOffset: 2 },
      }}
    >
      <Box
        component='img'
        src={next.poster_path ? `https://image.tmdb.org/t/p/w154${next.poster_path}` : NoPoster}
        alt=''
        loading='lazy'
        sx={{ width: 44, height: 66, flex: 'none', borderRadius: '6px', objectFit: 'cover', backgroundColor: colors.phantomBlack }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 700, fontSize: 14 }}>
          <bdi>{collection.name}</bdi>
        </Typography>
        <Typography noWrap sx={{ mt: 0.375, fontSize: 12, color: 'rgba(255,255,227,0.55)' }}>
          {t('nextInCollection', { title: next.title })}
        </Typography>
        <Typography sx={{ mt: 0.25, mb: 0.875, fontSize: 12, color: 'rgba(255,255,227,0.55)' }}>
          {t('collectionProgress', { watched, total })}
        </Typography>
        <Box
          role='progressbar'
          aria-valuenow={watched}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={t('collectionProgress', { watched, total })}
          sx={{ height: 4, borderRadius: 2, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.14)' }}
        >
          <Box sx={{ height: 4, width: `${pct}%`, backgroundColor: colors.primary.main }} />
        </Box>
      </Box>
    </Box>
  );
};

export default CollectionCard;
