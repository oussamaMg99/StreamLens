import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import colors from 'src/assets/themes/colors';
import { InsightGenre } from 'src/core/models/insights.model';
import { MediaType } from 'src/types/global.type';

interface GenrePodiumProps {
  genres: InsightGenre[];
  /** Watched titles of this type — the denominator for each genre's share. */
  total: number;
  mediaType: MediaType;
  compact?: boolean;
}

/** Visual order on the podium: 2nd, 1st, 3rd. */
const PODIUM_ORDER = [1, 0, 2];
const HEIGHTS = { regular: [132, 96, 72], compact: [110, 82, 62] };

/**
 * Top-3 genre podium. Movies use the amber fill, TV the teal one, matching the split
 * bar so the two read as the same pair across the page.
 */
const GenrePodium = (props: GenrePodiumProps) => {
  const { genres, total, mediaType, compact } = props;
  const { t } = useTranslation();
  const isMovie = mediaType === MediaType.Movie;
  const fill = isMovie ? colors.primary.main : colors.success.main;
  const fillSoft = isMovie ? 'rgba(226,168,71,0.22)' : 'rgba(46,191,165,0.22)';
  const ink = isMovie ? colors.onPrimary : colors.onSuccess;
  const heights = compact ? HEIGHTS.compact : HEIGHTS.regular;

  if (!genres.length) return null;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: compact ? 1 : 1.5 }}>
        {PODIUM_ORDER.filter(rank => genres[rank]).map(rank => {
          const genre = genres[rank];
          const first = rank === 0;
          const share = total ? Math.round((genre.count / total) * 100) : 0;
          return (
            <Box
              key={genre.id}
              sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: compact ? 1 : 1.25 }}
            >
              <Box sx={{ width: '100%', textAlign: 'center' }}>
                <Typography noWrap sx={{ fontWeight: 700, fontSize: compact ? 14 : 16 }} title={genre.name}>
                  {genre.name}
                </Typography>
                <Typography sx={{ mt: 0.25, fontSize: compact ? 12 : 13, color: 'rgba(255,255,227,0.6)' }}>
                  {compact ? t('titlesCount', { count: genre.count }) : `${genre.count} · ${t('percentValue', { value: share })}`}
                </Typography>
              </Box>
              <Box
                role='img'
                aria-label={t('genreRankAria', { rank: rank + 1, genre: genre.name })}
                sx={{
                  width: '100%',
                  height: heights[rank],
                  display: 'flex',
                  justifyContent: 'center',
                  pt: compact ? 1.25 : 1.5,
                  borderRadius: '8px 8px 0 0',
                  backgroundColor: first ? fill : fillSoft,
                  transition: 'height .3s ease',
                }}
              >
                <Typography sx={{ fontWeight: 800, fontSize: compact ? 24 : 26, color: first ? ink : 'rgba(255,255,227,0.75)' }}>
                  {rank + 1}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ height: 2, backgroundColor: 'rgba(226,168,71,0.45)' }} />
    </Box>
  );
};

export default GenrePodium;
