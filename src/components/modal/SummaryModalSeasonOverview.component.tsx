import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { useTranslation } from 'react-i18next';
import CheckIcon from '@mui/icons-material/Check';
import { Episode, SeasonDetails } from 'src/core/models/seasonDetails.model';
import { Avatar, Checkbox, CircularProgress, List, ListItemAvatar, ListItemButton, ListItemText, Rating } from '@mui/material';
import { useState } from 'react';
import NoPoster from 'src/assets/images/no-movie.png';

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

const EpisodeItem = ({ episode }: { episode: Episode }) => {
  const [watched, setWatched] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWatched(event.target.checked);
  };
  return (
    <ListItemButton
      sx={{
        gap: 1,
        backgroundColor: 'inherit',
        borderBottom: '1px solid rgba(255, 255, 255, 0.10)',
        borderRadius: '10px',
      }}
    >
      <ListItemAvatar>
        <Avatar
          variant='square'
          alt='Preview'
          src={episode.still_path ? `https://image.tmdb.org/t/p/w200${episode.still_path}` : NoPoster}
          sx={{ width: 56, height: '100%' }}
        />
      </ListItemAvatar>
      <Typography variant='h5' color='primary'>
        {episode.episode_number}
      </Typography>
      <ListItemText
        primary={`${episode.name}`}
        secondary={`${episode.runtime ? `${episode.runtime} min • ` : ''}${episode.air_date || 'Unknown air date'}`}
      />
      <Rating name='read-only' value={episode.vote_average / 2} precision={0.5} readOnly size='small' />
      <Checkbox checked={watched} onChange={handleChange} />
    </ListItemButton>
  );
};

export const EpisodesList = ({ episodes, loading, error }: { episodes?: Episode[]; loading?: boolean; error?: boolean }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color='error'>{t('errorLoadingEpisodes')}</Typography>
      </Box>
    );
  }

  return (
    <List component='nav' sx={{ display: 'flex', flexDirection: 'column', maxHeight: '350px', overflowY: 'auto' }}>
      {episodes?.map(episode => (
        <EpisodeItem key={episode.id} episode={episode} />
      ))}
    </List>
  );
};
