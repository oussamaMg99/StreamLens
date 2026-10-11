import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import colors from 'src/assets/themes/colors';
import NoPoster from 'src/assets/images/no-movie.png';
import type { Movie } from 'src/core/services/movie.service';
import { UnfinishedCollection } from 'src/utils/collections.utils';
import { TMDB_IMG, cardBorder, dimText, focusRing, leftText, stripParts, yearOf } from './collection.helpers';

/** Mini posters shown at most; longer series still get one bar segment per part. */
const MINI_POSTERS = 8;

interface CollectionCardProps {
  item: UnfinishedCollection;
  /** Opens the next part in the Summary modal. */
  onClick: (movie: Movie) => void;
}

/**
 * A series in "More to finish". From md: mini poster strip | name, count, next part,
 * segmented bar, parts left. Below md the mini posters are dropped and the card is a
 * full-width row. The segmented bar has one segment per released part and is
 * decorative: "1 of 4" next to it says the same, and the button's label carries it.
 */
const CollectionCard = (props: CollectionCardProps) => {
  const { item, onClick } = props;
  const { collection, next, watched, total } = item;
  const { t } = useTranslation();
  const year = yearOf(next);
  const progress = t('collectionProgress', { watched, total });
  const minis = stripParts(item).slice(0, MINI_POSTERS);

  return (
    <Box
      component='button'
      type='button'
      aria-label={t('collectionAria', { name: collection.name, progress, title: next.title, year: year || '—' })}
      onClick={() => onClick(next)}
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'auto minmax(0,1fr)' },
        alignItems: 'center',
        gap: 2.25,
        p: { xs: 1.5, md: 1.75 },
        textAlign: 'start',
        font: 'inherit',
        color: 'inherit',
        cursor: 'pointer',
        borderRadius: '10px',
        backgroundColor: 'rgba(20,20,20,0.5)',
        border: cardBorder,
        transition: 'border-color .15s ease',
        '&:hover': { borderColor: 'rgba(226,168,71,0.5)' },
        ...focusRing(2),
      }}
    >
      <Box component='span' aria-hidden='true' sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.625 }}>
        {minis.map(({ movie, state }) => (
          <Box
            key={movie.id}
            component='img'
            src={movie.poster_path ? `${TMDB_IMG}/w92${movie.poster_path}` : NoPoster}
            alt=''
            loading='lazy'
            sx={{
              width: 36,
              height: 54,
              borderRadius: '4px',
              objectFit: 'cover',
              backgroundColor: colors.phantomBlack,
              opacity: state === 'todo' || state === 'coming' ? 0.38 : 1,
              boxShadow: state === 'next' ? `0 0 0 2px ${colors.primary.main}` : 'none',
            }}
          />
        ))}
      </Box>

      <Box component='span' sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, minWidth: 0 }}>
        <Box component='span' sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1.25 }}>
          <Box
            component='span'
            sx={{
              fontSize: { xs: 14, md: 15 },
              fontWeight: 700,
              color: colors.text.primary,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <bdi>{collection.name}</bdi>
          </Box>
          <Box component='span' sx={{ flex: 'none', fontSize: 12, fontWeight: 600, color: dimText }}>
            {progress}
          </Box>
        </Box>
        <Box
          component='span'
          sx={{
            fontSize: { xs: 12, md: 13 },
            color: 'rgba(255,255,227,0.65)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {t('nextInCollection', { title: '' })}
          <Box component='bdi' sx={{ color: colors.text.primary }}>
            {next.title}
          </Box>
          {year && ` · ${year}`}
        </Box>
        <Box component='span' aria-hidden='true' sx={{ display: 'flex', gap: '3px' }}>
          {item.parts.map(part => (
            <Box
              key={part.movie.id}
              component='span'
              sx={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: part.watched ? colors.primary.main : 'rgba(255,255,255,0.14)' }}
            />
          ))}
        </Box>
        <Box component='span' sx={{ display: { xs: 'none', md: 'block' }, fontSize: 12, color: 'rgba(255,255,227,0.5)' }}>
          {leftText(t, item)}
        </Box>
      </Box>
    </Box>
  );
};

export default CollectionCard;
