import { Box, SxProps, Theme } from '@mui/material';
interface YouTubePlayerProps {
  videoId: string;
  /** Wrapper styles. The iframe keeps its 850×300 default unless overridden (e.g. `'& iframe': { width: '100%' }`). */
  sx?: SxProps<Theme>;
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
