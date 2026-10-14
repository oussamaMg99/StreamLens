import { Box, useTheme } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTranslation } from 'react-i18next';
import colors from 'src/assets/themes/colors';
import type { Movie } from 'src/core/models/movie.model';
import { UnfinishedCollection } from 'src/utils/collections.utils';
import CollectionPartsStrip from './CollectionPartsStrip.component';
import { TMDB_IMG, dimText, focusRing, leftText, yearOf } from './collection.helpers';

interface CollectionSpotlightProps {
  /** The series closest to finished: the first item of useUnfinishedCollections. */
  item: UnfinishedCollection;
  onPartClick: (movie: Movie) => void;
}

/**
 * The lead series. Top: one button for the next part, with the backdrop, the series
 * name, title and year, the overview and the progress. Bottom: the poster strip.
 * md+ the backdrop sits beside the text and the strip runs under both, inside one card.
 * Below md the card stacks, and the strip moves out under it and scrolls edge to edge.
 */
const CollectionSpotlight = (props: CollectionSpotlightProps) => {
  const { item, onPartClick } = props;
  const { collection, next, watched, total } = item;
  const { t } = useTranslation();
  const theme = useTheme();

  const year = yearOf(next);
  const progress = t('collectionProgress', { watched, total });
  const backdrop = next.backdrop_path || collection.backdrop_path;
  const tag = t('upNextPart', { part: item.parts.findIndex(part => part.movie.id === next.id) + 1, total });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 0 } }}>
      <Box
        sx={{
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: 'rgba(20,20,20,0.6)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <Box
          component='button'
          type='button'
          aria-label={t('collectionAria', { name: collection.name, progress, title: next.title, year: year || '—' })}
          onClick={() => onPartClick(next)}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1.3fr) minmax(0,1fr)' },
            width: '100%',
            p: 0,
            border: 0,
            background: 'transparent',
            textAlign: 'start',
            font: 'inherit',
            color: 'inherit',
            cursor: 'pointer',
            transition: 'background-color .15s ease',
            '&:hover': { backgroundColor: 'rgba(226,168,71,0.05)' },
            ...focusRing(-2),
          }}
        >
          <Box
            component='span'
            sx={{ position: 'relative', display: 'block', aspectRatio: '16 / 9', backgroundColor: colors.phantomBlack }}
          >
            {backdrop && (
              <Box
                component='img'
                src={`${TMDB_IMG}/w780${backdrop}`}
                alt=''
                loading='lazy'
                sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            <Box
              component='span'
              sx={{
                position: 'absolute',
                top: { xs: 10, md: 14 },
                insetInlineStart: { xs: 10, md: 14 },
                px: { xs: 1.125, md: 1.25 },
                py: 0.625,
                borderRadius: '6px',
                fontSize: { xs: 11, md: 12 },
                fontWeight: 700,
                color: colors.text.primary,
                backgroundColor: 'rgba(20,20,20,0.75)',
              }}
            >
              {tag}
            </Box>
          </Box>

          <Box
            component='span'
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: { xs: 1, md: 1.5 },
              minWidth: 0,
              p: { xs: 1.75, md: '26px 28px' },
            }}
          >
            <Box
              component='span'
              sx={{
                fontSize: { xs: 11, md: 12 },
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: colors.primary.main,
              }}
            >
              <bdi>{collection.name}</bdi>
            </Box>
            <Box component='span' sx={{ fontSize: { xs: 20, md: 28 }, fontWeight: 800, lineHeight: 1.15, color: colors.text.primary }}>
              <bdi>{next.title}</bdi>
            </Box>
            {year && (
              <Box component='span' sx={{ fontSize: { xs: 12, md: 13 }, fontWeight: 500, color: dimText }}>
                {year}
              </Box>
            )}
            {next.overview && (
              <Box
                component='span'
                sx={{
                  display: { xs: 'none', md: '-webkit-box' },
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'rgba(255,255,227,0.7)',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {next.overview}
              </Box>
            )}
            <Box
              component='span'
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mt: { md: 0.5 } }}
            >
              <Box component='span' sx={{ fontSize: 13, color: dimText }}>
                <Box component='span' sx={{ fontWeight: 700, color: colors.text.primary }}>
                  {progress}
                </Box>
                {` · ${leftText(t, item)}`}
              </Box>
              <Box
                component='span'
                sx={{
                  display: { xs: 'none', md: 'inline-flex' },
                  alignItems: 'center',
                  gap: 0.75,
                  fontSize: 14,
                  fontWeight: 600,
                  color: colors.primary.main,
                }}
              >
                {t('viewDetails')}
                <ArrowForwardIcon sx={{ fontSize: 16, transform: theme.direction === 'rtl' ? 'scaleX(-1)' : 'none' }} />
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <CollectionPartsStrip item={item} onPartClick={onPartClick} />
        </Box>
      </Box>

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <CollectionPartsStrip item={item} onPartClick={onPartClick} />
      </Box>
    </Box>
  );
};

export default CollectionSpotlight;
