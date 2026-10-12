import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useUnfinishedCollections } from 'src/core/hooks/useUnfinishedCollections';
import { WatchListEntry } from 'src/core/models/watchList.model';
import { Movie } from 'src/core/services/movie.service';
import InsightSection from './InsightSection.component';
import CollectionSpotlight from './collection/CollectionSpotlight.component';
import CollectionCard from './collection/CollectionCard.component';
import FinishCollectionsSkeleton from './collection/FinishCollectionsSkeleton.component';

interface FinishCollectionsProps {
  /** The watch list; undefined until it has loaded. */
  entries: WatchListEntry[] | undefined;
  onItemClick: (item: Movie) => void;
}

/**
 * "Finish the collection" (design 6a): film series the user has started but not finished.
 * The series closest to done gets the spotlight (next part + poster strip of every part);
 * the rest are compact "More to finish" cards, 2 columns from md, stacked below.
 *
 * Skeleton while loading; renders nothing when no series is unfinished. Every poster and
 * card is a button that opens the Summary modal for that film.
 */
const FinishCollections = (props: FinishCollectionsProps) => {
  const { entries, onItemClick } = props;
  const { t } = useTranslation();
  const { items, isLoading } = useUnfinishedCollections({ entries });

  if (!isLoading && !items.length) return null;

  const [lead, ...others] = items;

  return (
    <InsightSection title={t('finishTheCollection')} description={t('finishTheCollectionHint')}>
      {isLoading ? (
        <FinishCollectionsSkeleton />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2.25 } }}>
          <CollectionSpotlight item={lead} onPartClick={onItemClick} />

          {others.length > 0 && (
            <>
              <Typography
                component='h3'
                sx={{
                  mt: { xs: 1, md: 0.5 },
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,227,0.5)',
                }}
              >
                {t('moreToFinish')}
              </Typography>
              <Box
                component='ul'
                sx={{
                  listStyle: 'none',
                  m: 0,
                  p: 0,
                  display: 'grid',
                  gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' },
                  gap: { xs: 1, md: 1.5 },
                }}
              >
                {others.map(item => (
                  <Box component='li' key={item.collection.id} sx={{ minWidth: 0 }}>
                    <CollectionCard item={item} onClick={onItemClick} />
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Box>
      )}
    </InsightSection>
  );
};

export default FinishCollections;
