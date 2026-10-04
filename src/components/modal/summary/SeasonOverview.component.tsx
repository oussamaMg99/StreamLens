import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { useTranslation } from 'react-i18next';
import CheckIcon from '@mui/icons-material/Check';
import { SeasonDetails } from 'src/core/models/seasonDetails.model';
import EpisodesList from './EpisodesList.component';
import { hideFeature } from 'src/utils/constants';

interface SeasonOverviewProps {
  /** TMDB id of the show — needed to write progress against the right watch-list entry. */
  tvId?: number;
  seasonNumber?: number;
  /** Episode numbers marked watched in this season; owned by SummaryModalEpisodesTab. */
  watchedEpisodes?: number[];
  seasonDetails?: SeasonDetails;
  loading?: boolean;
  error?: boolean;
}

const SeasonOverview = (props: SeasonOverviewProps) => {
  const { tvId, seasonNumber, watchedEpisodes = [], seasonDetails, loading, error } = props;
  const { t } = useTranslation();

  return (
    <Box sx={{ width: '65%', backgroundColor: 'rgba(20, 20, 20, 0.45)', borderRadius: '10px', p: 1 }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 1, p: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant='h4'>
            {t('season')} {seasonNumber}
          </Typography>
          <Typography variant='body2' color='textSecondary'>
            {seasonDetails?.episodes?.length ?? 0} {t('episodes')} •{' '}
            {seasonDetails?.air_date ? `${seasonDetails.air_date?.split('-')[0]}` : t('airDateUnknown')} • {watchedEpisodes.length}{' '}
            {t('watched')}
          </Typography>
        </Box>
        {!hideFeature && (
          <Button size='small' variant='outlined' startIcon={<CheckIcon />}>
            {t('markSeasonWatched')}
          </Button>
        )}
      </Box>
      <Divider sx={{ borderColor: 'rgba(226, 168, 71, 0.25)' }} />
      <EpisodesList
        episodes={seasonDetails?.episodes}
        tvId={tvId}
        seasonNumber={seasonNumber}
        watchedEpisodes={watchedEpisodes}
        loading={loading}
        error={error}
      />
    </Box>
  );
};

export default SeasonOverview;
