import { Box } from '@mui/material';
interface YouTubePlayerProps {
  videoId: string;
  sx?: React.CSSProperties; // Optional style prop
}

export function YouTubePlayer({ videoId, sx }: YouTubePlayerProps) {
  return (
    <Box sx={sx}>
      <iframe
        width='850'
        height='300'
        src={`https://www.youtube.com/embed/${videoId}`}
        title='YouTube video player'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        allowFullScreen
      />
    </Box>
  );
}
