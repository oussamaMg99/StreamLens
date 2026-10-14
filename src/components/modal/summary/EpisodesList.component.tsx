import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import AppContext from 'src/core/context/global/AppContext';
import { Avatar, Checkbox, CircularProgress, List, ListItemAvatar, ListItemButton, ListItemText, Rating, Tooltip } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { Episode } from 'src/core/models/seasonDetails.model';
import { EntryMeta } from 'src/core/models/watchList.model';
import NoPoster from 'src/assets/images/no-movie.png';
import { useSetEpisodeWatched } from 'src/core/hooks/useWatchListMutations';
import { useWatchListGate } from 'src/core/hooks/useWatchListGate';

interface EpisodeItemProps {
  episode: Episode;
  tvId?: number;
  meta?: EntryMeta;
  seasonNumber?: number;
  watched: boolean;
  compact?: boolean;
}

/**
 * One episode row. Kept private to this file: it only makes sense inside EpisodesList,
 * which supplies the ids and the watched flag from the season's entry.
 */
const EpisodeItem = (props: EpisodeItemProps) => {
  const { episode, tvId, meta, seasonNumber, watched, compact } = props;
  const { t } = useTranslation();
  const { setSnackBarProps } = useContext(AppContext);
  const gate = useWatchListGate();
  const setEpisodeWatched = useSetEpisodeWatched();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Signed out or unverified, the tick is the prompt — nothing is written.
    if (gate.promptIfBlocked()) return;
    if (tvId === undefined || seasonNumber === undefined) return;
    const checked = event.target.checked;
    setEpisodeWatched.mutate(
      {
        tvId,
        season: seasonNumber,
        episode: episode.episode_number,
        watched: checked,
        // Exact minutes for Insights; TMDB leaves some runtimes empty, which count as 0.
        runtime: episode.runtime ?? 0,
        meta,
      },
      {
        // Failures already get the error snackbar from the mutation hook.
        onSuccess: () =>
          setSnackBarProps({
            open: true,
            severity: 'success',
            message: t(checked ? 'episodeMarkedWatched' : 'episodeMarkedUnwatched', {
              episode: episode.episode_number,
              season: seasonNumber,
            }),
          }),
      },
    );
  };

  const checkbox = (
    <Tooltip title={gate.blockedHint}>
      <Checkbox
        checked={watched}
        disabled={gate.access === 'loading' || setEpisodeWatched.isPending}
        onChange={handleChange}
        // The row is a ListItemButton, so keep the tick from also triggering it.
        onClick={event => event.stopPropagation()}
        slotProps={{ input: { 'aria-label': t('episodeWatched', { episode: episode.episode_number }) } }}
        // 44px hit area on touch screens.
        sx={compact ? { width: 44, height: 44, flex: 'none' } : undefined}
      />
    </Tooltip>
  );
  const subtitle = `${episode.runtime ? `${episode.runtime}${t('minute(s)')} • ` : ''}${episode.air_date || t('airDateUnknown')}`;

  if (compact) {
    // Still (with the episode number on it) · title + meta + compact rating · checkbox.
    // The 5-star Rating widget is replaced by a single star and the score out of 5.
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '104px minmax(0, 1fr) 44px',
          alignItems: 'center',
          gap: 1.5,
          py: 1.25,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Box sx={{ position: 'relative', width: 104, height: 58, borderRadius: '6px', overflow: 'hidden', opacity: watched ? 0.6 : 1 }}>
          <Box
            component='img'
            src={episode.still_path ? `https://image.tmdb.org/t/p/w300${episode.still_path}` : NoPoster}
            alt=''
            loading='lazy'
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <Typography
            color='primary'
            sx={{
              position: 'absolute',
              insetInlineStart: 6,
              bottom: 2,
              fontWeight: 800,
              fontSize: 13,
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}
          >
            E{episode.episode_number}
          </Typography>
        </Box>
        <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: 14,
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {episode.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 12, color: 'text.secondary', minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: 'inherit', color: 'inherit' }}>
              {subtitle}
            </Typography>
            {episode.vote_average > 0 && (
              <>
                <StarIcon sx={{ fontSize: 12, color: 'primary.main', ml: 0.5, flex: 'none' }} />
                <Typography sx={{ fontSize: 'inherit', color: 'inherit', flex: 'none' }}>
                  {(episode.vote_average / 2).toFixed(1)}
                </Typography>
              </>
            )}
          </Box>
        </Box>
        {checkbox}
      </Box>
    );
  }

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
      <ListItemText primary={`${episode.name}`} secondary={subtitle} />
      <Rating name='read-only' value={episode.vote_average / 2} precision={0.5} readOnly size='small' />
      {checkbox}
    </ListItemButton>
  );
};

interface EpisodesListProps {
  episodes?: Episode[];
  tvId?: number;
  /** The show's metadata, stored with each toggle. */
  meta?: EntryMeta;
  seasonNumber?: number;
  /** Episode numbers marked watched in this season; owned by SummaryModalEpisodesTab. */
  watchedEpisodes?: number[];
  loading?: boolean;
  error?: boolean;
  /** Below md: compact rows, and no inner scroll (the dialog/sheet scrolls as one page). */
  compact?: boolean;
}

/** The season's episodes with their watched ticks, plus the loading/error states. */
const EpisodesList = (props: EpisodesListProps) => {
  const { episodes, tvId, meta, seasonNumber, watchedEpisodes = [], loading, error, compact } = props;
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

  const items = episodes?.map(episode => (
    <EpisodeItem
      key={episode.id}
      episode={episode}
      tvId={tvId}
      meta={meta}
      seasonNumber={seasonNumber}
      watched={watchedEpisodes.includes(episode.episode_number)}
      compact={compact}
    />
  ));

  if (compact) return <Box sx={{ display: 'flex', flexDirection: 'column' }}>{items}</Box>;

  return (
    <List component='nav' sx={{ display: 'flex', flexDirection: 'column', maxHeight: '350px', overflowY: 'auto' }}>
      {items}
    </List>
  );
};

export default EpisodesList;
