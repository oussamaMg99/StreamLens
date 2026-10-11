import { Box, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useUnfinishedCollections } from 'src/core/hooks/useUnfinishedCollections';
import { WatchListEntry } from 'src/core/models/watchList.model';
import { Movie } from 'src/core/services/movie.service';
import CollectionCard from './CollectionCard.component';
import InsightSection from './InsightSection.component';

interface FinishCollectionsProps {
  /** The watch list; undefined until it has loaded. */
  entries: WatchListEntry[] | undefined;
  onItemClick: (item: Movie) => void;
}

/**
 * "Finish the collection": film series the user has started but not finished, with the
 * next part to watch. The movie counterpart of "Pick up where you left off", laid out with
 * the same grid. Shows a spinner while loading and renders nothing when every started
 * series is finished (or none was started).
 */
const FinishCollections = (props: FinishCollectionsProps) => {
  const { entries, onItemClick } = props;
  const { t } = useTranslation();
  const { items, isLoading } = useUnfinishedCollections({ entries });

  if (!isLoading && !items.length) return null;

  return (
    <InsightSection bleedRight title={t('finishTheCollection')} description={t('finishTheCollectionHint')}>
      {isLoading ? (
        <Box sx={{ height: 88, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress color='primary' size={28} />
        </Box>
      ) : (
        <Box
          sx={{
            display: { xs: 'flex', sm: 'grid' },
            gridTemplateColumns: { sm: 'repeat(2, minmax(0,1fr))', lg: 'repeat(4, minmax(0,1fr))' },
            gap: 1.75,
            overflowX: { xs: 'auto', sm: 'visible' },
            mr: { xs: -2, sm: 0 },
            pr: { xs: 2, md: 3.5 },
            pb: { xs: 1, sm: 0 },
          }}
        >
          {items.map(item => (
            <CollectionCard key={item.collection.id} item={item} onClick={onItemClick} />
          ))}
        </Box>
      )}
    </InsightSection>
  );
};

export default FinishCollections;
