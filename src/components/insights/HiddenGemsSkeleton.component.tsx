import { Box, Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PLACEHOLDER_CARDS = 8;

const tone = {
  bgcolor: 'rgba(255,255,255,0.07)',
  // The wave stops when the user asks for reduced motion; the static blocks still show.
  '@media (prefers-reduced-motion: reduce)': { animation: 'none', '&::after': { animation: 'none' } },
};

/**
 * Loading state for Hidden gems, laid out like the real section (a spotlight, then the
 * grid) so the page doesn't jump when results arrive. It follows the same breakpoints:
 * stacked spotlight and 4 list rows on mobile, 2 columns from sm, 4 from lg.
 */
const HiddenGemsSkeleton = () => {
  const { t } = useTranslation();

  return (
    <Box
      role='status'
      aria-busy='true'
      aria-label={t('loadingHiddenGems')}
      sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2.25 } }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1.3fr) minmax(0,1fr)' },
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Skeleton variant='rectangular' animation='wave' sx={{ ...tone, height: 'auto', aspectRatio: '16 / 9' }} />
        <Box sx={{ p: { xs: 1.75, md: 2.5 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1.5 }}>
          <Skeleton animation='wave' width='35%' sx={tone} />
          <Skeleton animation='wave' width='80%' height={32} sx={tone} />
          <Skeleton animation='wave' width='100%' sx={tone} />
          <Skeleton animation='wave' width='90%' sx={tone} />
          <Skeleton variant='rounded' animation='wave' width={170} height={44} sx={tone} />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', lg: 'repeat(4, minmax(0,1fr))' },
          gap: { xs: 1, md: 1.5 },
        }}
      >
        {Array.from({ length: PLACEHOLDER_CARDS }, (_, index) => (
          <Box
            key={index}
            sx={{
              // Mobile shows 4 rows before "Show more", so only 4 placeholders there.
              display: { xs: index < 4 ? 'flex' : 'none', sm: 'flex' },
              gap: 1.5,
              p: { xs: 1, sm: 1.25 },
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <Skeleton
              variant='rounded'
              animation='wave'
              sx={{ ...tone, width: { xs: 48, sm: 60 }, height: { xs: 72, sm: 90 }, flex: 'none' }}
            />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, pt: 0.5 }}>
              <Skeleton animation='wave' width='80%' sx={tone} />
              <Skeleton animation='wave' width='45%' sx={tone} />
              <Skeleton variant='rounded' animation='wave' width='60%' height={22} sx={tone} />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default HiddenGemsSkeleton;
