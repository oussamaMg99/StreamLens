import { useRef, useState } from 'react';
import { Box, Button, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { HiddenGem, useHiddenGems } from 'src/core/hooks/useHiddenGems';
import { InsightsSummary } from 'src/core/models/insights.model';
import { Movie } from 'src/core/services/movie.service';
import { TvShow } from 'src/core/services/tv.service';
import InsightSection from './InsightSection.component';
import { HiddenGemCard, HiddenGemSpotlight } from './HiddenGemCard.component';
import HiddenGemsSkeleton from './HiddenGemsSkeleton.component';

/** Cards shown on mobile before "Show more". */
const MOBILE_VISIBLE = 4;

interface HiddenGemsProps {
  topGenres: InsightsSummary['topGenres'];
  /** watchListEntryId of every title already on the watch list (watched or saved). */
  excludeKeys: Set<string>;
  onItemClick: (item: Movie | TvShow) => void;
}

/**
 * "Hidden gems": a spotlight for the #1 gem, then a grid of up to 8 more. The grid has
 * 4 columns from lg, 2 from sm, and below sm it's a list of 4 rows with a "Show more"
 * button. It's built from wide cards so it doesn't look like "Picked for you", which is
 * rows of plain posters.
 *
 * Shows a skeleton while loading. Renders nothing when there are no results or both
 * requests failed. Every item is a button that opens the Summary modal. Keyboard order
 * follows reading order: spotlight first, then the grid, mirrored in RTL.
 */
const HiddenGems = (props: HiddenGemsProps) => {
  const { topGenres, excludeKeys, onItemClick } = props;
  const { t } = useTranslation();
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true });
  const { spotlight, gems, isLoading } = useHiddenGems({ topGenres, excludeKeys });
  const [expanded, setExpanded] = useState(false);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (isLoading) {
    return (
      <InsightSection title={t('hiddenGems')} description={t('hiddenGemsHint')}>
        <HiddenGemsSkeleton />
      </InsightSection>
    );
  }
  if (!spotlight) return null;

  const visible = isSmUp || expanded ? gems : gems.slice(0, MOBILE_VISIBLE);
  const remaining = gems.length - visible.length;
  const open = (gem: HiddenGem) => onItemClick(gem);

  const showMore = () => {
    setExpanded(true);
    // The button disappears, so focus moves to the first newly shown gem instead of being lost.
    requestAnimationFrame(() => cardRefs.current[MOBILE_VISIBLE]?.focus());
  };

  return (
    <InsightSection title={t('hiddenGems')} description={t('hiddenGemsHint')}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2.25 } }}>
        <HiddenGemSpotlight gem={spotlight} onClick={open} />

        {visible.length > 0 && (
          <Box
            component='ul'
            sx={{
              listStyle: 'none',
              m: 0,
              p: 0,
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', lg: 'repeat(4, minmax(0,1fr))' },
              gap: { xs: 1, md: 1.5 },
            }}
          >
            {visible.map((gem, index) => (
              <Box component='li' key={`${gem.media_type}_${gem.id}`} sx={{ minWidth: 0 }}>
                <HiddenGemCard
                  ref={element => {
                    cardRefs.current[index] = element;
                  }}
                  gem={gem}
                  onClick={open}
                />
              </Box>
            ))}
          </Box>
        )}

        {remaining > 0 && (
          <Button variant='outlined' onClick={showMore} sx={{ minHeight: 44, borderColor: 'rgba(226,168,71,0.55)' }}>
            {t('showMoreGems', { count: remaining })}
          </Button>
        )}
      </Box>
    </InsightSection>
  );
};

export default HiddenGems;
