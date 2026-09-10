import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { useTranslation } from 'react-i18next';
import CheckIcon from '@mui/icons-material/Check';
import { SeasonDetails } from 'src/core/models/seasonDetails.model';
import { EpisodesList } from './SummaryModalEpisodesTab.component';

interface SummaryModalSeasonOverviewProps {
  seasonNumber?: number;
  seasonDetails?: SeasonDetails;
  loading?: boolean;
  error?: boolean;
}

const SummaryModalSeasonOverview = (props: SummaryModalSeasonOverviewProps) => {
  const { seasonNumber, seasonDetails, loading, error } = props;
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
            {seasonDetails?.air_date ? `${seasonDetails.air_date?.split('-')[0]}` : t('airDateUnknown')} •{' '}
            {0 /* Placeholder for watched episodes count */} {t('watched')}
          </Typography>
        </Box>
        <Button size='small' variant='outlined' startIcon={<CheckIcon />}>
          {'Mark Season Watched'}
        </Button>
      </Box>
      <Divider sx={{ borderColor: 'rgba(226, 168, 71, 0.25)' }} />
      <EpisodesList episodes={seasonDetails?.episodes} loading={loading} error={error} />
    </Box>
  );
};

export default SummaryModalSeasonOverview;
