import { Box } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';
import colors from 'src/assets/themes/colors';
import NoPoster from 'src/assets/images/no-movie.png';
import type { Movie } from 'src/core/services/movie.service';
import { UnfinishedCollection } from 'src/utils/collections.utils';
import { TMDB_IMG, faintText, focusRing, partStatusLabel, stripParts, yearOf } from './collection.helpers';

interface CollectionPartsStripProps {
  item: UnfinishedCollection;
  onPartClick: (movie: Movie) => void;
}

/**
 * Every part of the series in release order, one poster each:
 * watched = full colour + amber check · next = amber ring + "Next" tag ·
 * not watched = dimmed · not released = dimmed + "Coming 2027" under it.
 *
 * md+ the posters share the row (72–140px each); below md it's an edge-to-edge
 * horizontal scroll of 64px posters. Long series scroll on desktop too instead of
 * shrinking. In RTL flex order follows the document, so part 1 sits on the right.
 */
const CollectionPartsStrip = (props: CollectionPartsStripProps) => {
  const { item, onPartClick } = props;
  const { t } = useTranslation();
  const progress = t('collectionProgress', { watched: item.watched, total: item.total });

  return (
    <Box
      component='ul'
      aria-label={t('collectionStripAria', { name: item.collection.name, progress })}
      sx={{
        listStyle: 'none',
        m: 0,
        display: 'flex',
        gap: { xs: 1, md: 1.25 },
        overflowX: 'auto',
        // Mobile: run to the screen edge like the other scrolling rows.
        mr: { xs: -2, md: 0 },
        p: { xs: '2px 16px 6px 2px', md: '16px 18px 18px' },
        borderTop: { xs: 'none', md: '1px solid rgba(255,255,255,0.08)' },
      }}
    >
      {stripParts(item).map(({ movie, number, state }) => {
        const year = yearOf(movie);
        const dim = state === 'todo' || state === 'coming';
        return (
          <Box component='li' key={movie.id} sx={{ flex: { xs: '0 0 64px', md: '1 1 0' }, minWidth: { md: 72 }, maxWidth: { md: 140 } }}>
            <Box
              component='button'
              type='button'
              aria-label={t('partAria', { part: number, title: movie.title, year: year || '—', status: partStatusLabel(t, state) })}
              onClick={() => onPartClick(movie)}
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 0.75, md: 0.875 },
                p: 0,
                border: 0,
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'start',
                font: 'inherit',
                color: 'inherit',
                borderRadius: '6px',
                ...focusRing(3),
              }}
            >
              <Box
                component='span'
                sx={{
                  position: 'relative',
                  display: 'block',
                  width: '100%',
                  aspectRatio: '2 / 3',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  backgroundColor: colors.phantomBlack,
                  boxShadow: state === 'next' ? `0 0 0 2px ${colors.primary.main}` : 'none',
                }}
              >
                <Box
                  component='img'
                  src={movie.poster_path ? `${TMDB_IMG}/w185${movie.poster_path}` : NoPoster}
                  alt=''
                  loading='lazy'
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: dim ? 0.38 : 1 }}
                />
                {state === 'watched' && (
                  <Box
                    component='span'
                    aria-hidden='true'
                    sx={{
                      position: 'absolute',
                      top: { xs: 4, md: 6 },
                      insetInlineEnd: { xs: 4, md: 6 },
                      width: { xs: 18, md: 20 },
                      height: { xs: 18, md: 20 },
                      borderRadius: '50%',
                      backgroundColor: colors.primary.main,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckIcon sx={{ fontSize: { xs: 12, md: 14 }, color: colors.onPrimary }} />
                  </Box>
                )}
                {state === 'next' && (
                  <Box
                    component='span'
                    aria-hidden='true'
                    sx={{
                      position: 'absolute',
                      insetInline: { xs: 4, md: 6 },
                      bottom: { xs: 4, md: 6 },
                      py: 0.25,
                      borderRadius: '4px',
                      textAlign: 'center',
                      fontSize: { xs: 10, md: 11 },
                      fontWeight: 700,
                      color: colors.onPrimary,
                      backgroundColor: colors.primary.main,
                    }}
                  >
                    {t('nextTag')}
                  </Box>
                )}
              </Box>
              <Box
                component='span'
                aria-hidden='true'
                sx={{
                  fontSize: { xs: 11, md: 12 },
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: state === 'next' ? colors.primary.main : state === 'watched' ? colors.text.primary : faintText,
                }}
              >
                {state === 'coming' ? (year ? t('comingYear', { year }) : t('comingSoon')) : `${number} · ${year}`}
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default CollectionPartsStrip;
