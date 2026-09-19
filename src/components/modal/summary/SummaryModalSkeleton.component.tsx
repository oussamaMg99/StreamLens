import DialogContent from '@mui/material/DialogContent';
import Skeleton from '@mui/material/Skeleton';
import { Box } from '@mui/material';

const SummaryModalSkeleton = () => {
  return (
    <DialogContent
      sx={{
        background: 'linear-gradient(135deg, #5A431C 0%, #1f0303 100%)',
      }}
    >
      {/* Title */}
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2, py: 2 }}>
        <Skeleton animation='wave' variant='text' width='60%' height={60} />
      </Box>
      {/* Info bar */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', mb: 2, gap: 2 }}>
        <Skeleton animation='wave' variant='rounded' width={100} height={28} />
        <Skeleton animation='wave' variant='rounded' width={120} height={28} />
        <Skeleton animation='wave' variant='rounded' width={140} height={28} />
        <Skeleton animation='wave' variant='rounded' width={80} height={28} />
      </Box>
      {/* Poster and overview */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          mb: 2,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Skeleton animation='wave' variant='rounded' width={200} height={300} sx={{ borderRadius: '10px', mb: 1 }} />
        <Box sx={{ ml: { xs: 0, sm: 4 }, mt: { xs: 2, sm: 0 }, width: { xs: '100%', sm: '48%' } }}>
          <Skeleton animation='wave' variant='text' width='100%' />
          <Skeleton animation='wave' variant='text' width='100%' />
          <Skeleton animation='wave' variant='text' width='80%' />
          <Box sx={{ my: 4, display: 'flex', flexDirection: 'row', gap: 2, mt: 2, justifyContent: 'center' }}>
            <Skeleton animation='wave' variant='rounded' width={140} height={36} />
            <Skeleton animation='wave' variant='rounded' width={170} height={36} />
          </Box>
        </Box>
      </Box>
    </DialogContent>
  );
};

export default SummaryModalSkeleton;
