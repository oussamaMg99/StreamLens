import { Box, Typography } from '@mui/material';

interface SectionHeaderProps {
  title: string;
  subtitle: string;
}

const SectionHeader = (props: SectionHeaderProps) => {
  const { title, subtitle } = props;
  return (
    <Box sx={{ textAlign: 'center', my: 8, px: 2 }}>
      <Typography variant='h4' sx={{ fontWeight: 700, mt: 1, textTransform: 'uppercase' }}>
        {title}
      </Typography>
      <Typography variant='body1' sx={{ mt: 2, maxWidth: '600px', mx: 'auto' }}>
        {subtitle}
      </Typography>
    </Box>
  );
};

export default SectionHeader;
