import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { Avatar, Checkbox, CircularProgress, List, ListItemAvatar, ListItemButton, ListItemText, Rating, Tooltip } from '@mui/material';
import { Episode } from 'src/core/models/seasonDetails.model';
import NoPoster from 'src/assets/images/no-movie.png';
import { useSetEpisodeWatched } from 'src/core/hooks/useWatchListMutations';
import { useWatchListGate } from 'src/core/hooks/useWatchListGate';

interface EpisodeItemProps {
  episode: Episode;
  tvId?: number;
  seasonNumber?: number;
  watched: boolean;
}

/**
 * One episode row. Kept private to this file: it only makes sense inside EpisodesList,
 * which supplies the ids and the watched flag from the season's entry.
 */
const EpisodeItem = (props: EpisodeItemProps) => {
  const { episode, tvId, seasonNumber, watched } = props;
  const { t } = useTranslation();
  const gate = useWatchListGate();
  const setEpisodeWatched = useSetEpisodeWatched();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Signed out or unverified, the tick is the prompt — nothing is written.
    if (gate.promptIfBlocked()) return;
    if (tvId === undefined || seasonNumber === undefined) return;
    setEpisodeWatched.mutate({ tvId, season: seasonNumber, episode: episode.episode_number, watched: event.target.checked });
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
        secondary={`${episode.runtime ? `${episode.runtime}${t('minute(s)')} • ` : ''}${episode.air_date || t('airDateUnknown')}`}
      />
      <Rating name='read-only' value={episode.vote_average / 2} precision={0.5} readOnly size='small' />
      <Tooltip title={gate.blockedHint}>
        <Checkbox
          checked={watched}
          disabled={gate.access === 'loading' || setEpisodeWatched.isPending}
          onChange={handleChange}
          // The row is a ListItemButton, so keep the tick from also triggering it.
          onClick={event => event.stopPropagation()}
        />
      </Tooltip>
    </ListItemButton>
  );
};

interface EpisodesListProps {
  episodes?: Episode[];
  tvId?: number;
  seasonNumber?: number;
  /** Episode numbers marked watched in this season; owned by SummaryModalEpisodesTab. */
  watchedEpisodes?: number[];
  loading?: boolean;
  error?: boolean;
}

/** The season's episodes with their watched ticks, plus the loading/error states. */
const EpisodesList = (props: EpisodesListProps) => {
  const { episodes, tvId, seasonNumber, watchedEpisodes = [], loading, error } = props;
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
        <EpisodeItem
          key={episode.id}
          episode={episode}
          tvId={tvId}
          seasonNumber={seasonNumber}
          watched={watchedEpisodes.includes(episode.episode_number)}
        />
      ))}
    </List>
  );
};

export default EpisodesList;
