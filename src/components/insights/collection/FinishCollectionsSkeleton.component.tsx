import { Box, Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';

const tone = {
  bgcolor: 'rgba(255,255,255,0.07)',
  '@media (prefers-reduced-motion: reduce)': { animation: 'none', '&::after': { animation: 'none' } },
};

/** Loading state shaped like the real section (spotlight, strip, two cards) so nothing jumps. */
const FinishCollectionsSkeleton = () => {
  const { t } = useTranslation();

  return (
    <Box
      role='status'
      aria-busy='true'
      aria-label={t('loadingCollections')}
      sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2.25 } }}
    >
      <Box sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1.3fr) minmax(0,1fr)' } }}>
          <Skeleton variant='rectangular' animation='wave' sx={{ ...tone, height: 'auto', aspectRatio: '16 / 9' }} />
          <Box sx={{ p: { xs: 1.75, md: 3 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1.5 }}>
            <Skeleton animation='wave' width='40%' sx={tone} />
            <Skeleton animation='wave' width='85%' height={34} sx={tone} />
            <Skeleton animation='wave' width='30%' sx={tone} />
            <Skeleton animation='wave' width='100%' sx={{ ...tone, display: { xs: 'none', md: 'block' } }} />
            <Skeleton animation='wave' width='55%' sx={tone} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: { xs: 1, md: 1.25 }, p: { xs: 1.5, md: '16px 18px 18px' }, overflow: 'hidden' }}>
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton
              key={index}
              variant='rounded'
              animation='wave'
              sx={{ ...tone, flex: { xs: '0 0 64px', md: '1 1 0' }, maxWidth: { md: 140 }, height: 'auto', aspectRatio: '2 / 3' }}
            />
          ))}
        </Box>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(2, minmax(0,1fr))' }, gap: 1.5 }}>
        {[0, 1].map(index => (
          <Skeleton key={index} variant='rounded' animation='wave' height={84} sx={tone} />
        ))}
      </Box>
    </Box>
  );
};

export default FinishCollectionsSkeleton;
