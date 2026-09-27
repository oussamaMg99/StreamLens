import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { useTranslation } from 'react-i18next';
import CheckIcon from '@mui/icons-material/Check';
import { Episode, SeasonDetails } from 'src/core/models/seasonDetails.model';
import { Avatar, Checkbox, CircularProgress, List, ListItemAvatar, ListItemButton, ListItemText, Rating } from '@mui/material';
import { useContext } from 'react';
import NoPoster from 'src/assets/images/no-movie.png';
import AppContext from 'src/core/context/global/AppContext';
import { useWatchListEntry } from 'src/core/hooks/useWatchList';
import { useSetEpisodeWatched } from 'src/core/hooks/useWatchListMutations';

interface SummaryModalSeasonOverviewProps {
  /** TMDB id of the show — needed to write progress against the right watch-list entry. */
  tvId?: number;
  seasonNumber?: number;
  seasonDetails?: SeasonDetails;
  loading?: boolean;
  error?: boolean;
}

const SummaryModalSeasonOverview = (props: SummaryModalSeasonOverviewProps) => {
  const { tvId, seasonNumber, seasonDetails, loading, error } = props;
  const { t } = useTranslation();

  // Looked up once here and passed down, so one query backs the whole episode list
  // instead of every row resolving its own entry.
  const entry = useWatchListEntry(tvId !== undefined ? { media_type: 'tv', id: tvId } : undefined);
  const watchedEpisodes = (entry?.media_type === 'tv' ? entry.watched[seasonNumber ?? 0] : undefined) ?? [];

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
        <Button size='small' variant='outlined' startIcon={<CheckIcon />}>
          {t('markSeasonWatched')}
        </Button>
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

export default SummaryModalSeasonOverview;

interface EpisodeItemProps {
  episode: Episode;
  tvId?: number;
  seasonNumber?: number;
  watched: boolean;
}

const EpisodeItem = (props: EpisodeItemProps) => {
  const { episode, tvId, seasonNumber, watched } = props;
  const { t } = useTranslation();
  const { user, authReady, setAuthModalOpen } = useContext(AppContext);
  const setEpisodeWatched = useSetEpisodeWatched();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Signed out, the tick is the sign-in prompt — nothing is written.
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
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
      <Checkbox
        checked={watched}
        disabled={!authReady || setEpisodeWatched.isPending}
        onChange={handleChange}
        // The row is a ListItemButton, so keep the tick from also triggering it.
        onClick={event => event.stopPropagation()}
      />
    </ListItemButton>
  );
};

interface EpisodesListProps {
  episodes?: Episode[];
  tvId?: number;
  seasonNumber?: number;
  watchedEpisodes?: number[];
  loading?: boolean;
  error?: boolean;
}

export const EpisodesList = (props: EpisodesListProps) => {
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
