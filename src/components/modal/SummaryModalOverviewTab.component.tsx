import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import NoPoster from 'src/assets/images/no-movie.png';
import { Movie } from 'src/core/services/movie.service';
import { TvShow } from 'src/core/services/tv.service';
import { Result } from 'src/core/models/common.model';
import SummaryModalInfoBar from './SummaryModalInfoBar.component';
import { YouTubePlayer } from '../player/YouTubePlayer.component';
import { SummaryModalDetails } from './SummaryModal';

interface SummaryModalOverviewTabProps {
  itemDetails?: SummaryModalDetails;
  item?: (TvShow & Movie) | TvShow | Movie;
}

const SummaryModalOverviewTab = ({ itemDetails, item }: SummaryModalOverviewTabProps) => {
  const { t } = useTranslation();
  const [trailerVideoId, setTrailerVideoId] = useState<string | null>(null);
  const isOfficialYoutubeTrailer = (video: Result) => {
    return video.type === 'Trailer' && video.official && video.site === 'YouTube';
  };

  useEffect(() => {
    if (itemDetails?.videos?.results) {
      const officialTrailer = itemDetails.videos.results.find(isOfficialYoutubeTrailer);
      setTrailerVideoId(officialTrailer ? officialTrailer.key : null);
    }
  }, [itemDetails]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 0, m: 0 }}>
      <SummaryModalInfoBar
        mediaType={item?.media_type}
        runtime={itemDetails?.runtime}
        releaseDate={itemDetails?.release_date}
        firstAirDate={itemDetails?.first_air_date}
        voteAverage={itemDetails?.vote_average}
        voteCount={itemDetails?.vote_count}
        genres={itemDetails?.genres}
      />
      {/* Poster and overview */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },

          justifyContent: 'space-evenly',
          alignItems: 'center',
        }}
      >
        {/* Poster image */}
        <img
          width={200}
          height={300}
          style={{ borderRadius: 10, marginBottom: 8 }}
          src={itemDetails?.poster_path ? `https://image.tmdb.org/t/p/w200${itemDetails.poster_path}` : NoPoster}
          alt={itemDetails?.name ?? itemDetails?.title ?? 'Untitled'}
        />
        <Box sx={{ ml: { xs: 0, sm: 4 }, mt: { xs: 2, sm: 0 }, width: { xs: '100%', sm: '48%' } }}>
          <Typography gutterBottom>{itemDetails?.overview ?? t('noSummaryAvailable')}</Typography>
          <Box sx={{ my: 4, display: 'flex', flexDirection: 'row', gap: 2, mt: 2, justifyContent: 'center' }}>
            <Button variant='contained' startIcon={<BookmarkAddIcon />} onClick={() => {}}>
              {t('saveToWatchList')}
            </Button>
            <Button variant='outlined' startIcon={<FormatListBulletedIcon />} onClick={() => {}}>
              {t('browseEpisodes')}
            </Button>
          </Box>
          {trailerVideoId && <YouTubePlayer videoId={trailerVideoId} sx={{ display: 'flex', justifyContent: 'center' }} />}
        </Box>
      </Box>
    </Box>
  );
};

export default SummaryModalOverviewTab;