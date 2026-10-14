import { Box, Typography } from '@mui/material';
import SellIcon from '@mui/icons-material/Sell';

interface GenreTagProps {
  tagName: string;
}

const GenreTag = ({ tagName }: GenreTagProps) => {
  return (
    <Box
      sx={{
        cursor: 'pointer',
        px: 1,
        py: 0.5,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 10,
      }}
    >
      <SellIcon fontSize='small' />
      <Typography variant='body2'>{tagName}</Typography>
    </Box>
  );
};

export default GenreTag;
