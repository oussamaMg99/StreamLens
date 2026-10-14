import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import AppContext from 'src/core/context/global/AppContext';
import CheckIcon from '@mui/icons-material/Check';
import RemoveDoneIcon from '@mui/icons-material/RemoveDone';
import { Episode, SeasonDetails } from 'src/core/models/seasonDetails.model';
import { EntryMeta } from 'src/core/models/watchList.model';
import EpisodesList from './EpisodesList.component';
import { useSetEpisodesWatched } from 'src/core/hooks/useWatchListMutations';
import { useWatchListGate } from 'src/core/hooks/useWatchListGate';
import { isEpisodeAired } from 'src/utils/watchListMeta.utils';

interface SeasonOverviewProps {
  /** TMDB id of the show — needed to write progress against the right watch-list entry. */
  tvId?: number;
  /** The show's metadata, stored with each episode toggle (entryMetaFromDetails). */
  meta?: EntryMeta;
  seasonNumber?: number;
  /** Episode numbers marked watched in this season; owned by SummaryModalEpisodesTab. */
  watchedEpisodes?: number[];
  seasonDetails?: SeasonDetails;
  loading?: boolean;
  error?: boolean;
}

/** Today as a local YYYY-MM-DD, the format TMDB air dates use. */
const localToday = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const toEpisodeRuntime = (episode: Episode) => ({ episode: episode.episode_number, runtime: episode.runtime ?? 0 });

const SeasonOverview = (props: SeasonOverviewProps) => {
  const { tvId, meta, seasonNumber, watchedEpisodes = [], seasonDetails, loading, error } = props;
  const { t } = useTranslation();
  const { setSnackBarProps } = useContext(AppContext);
  const gate = useWatchListGate();
  const setEpisodesWatched = useSetEpisodesWatched();

  const episodes = seasonDetails?.episodes ?? [];
  // Upcoming episodes can't have been watched, so "mark all" leaves them out.
  const today = localToday();
  const aired = episodes.filter(episode => isEpisodeAired(episode, today));
  const allWatched = aired.length > 0 && aired.every(episode => watchedEpisodes.includes(episode.episode_number));

  const handleMarkAll = () => {
    // Signed out or unverified, the button is the prompt — nothing is written.
    if (gate.promptIfBlocked()) return;
    if (tvId === undefined || seasonNumber === undefined) return;
    const watched = !allWatched;
    setEpisodesWatched.mutate(
      {
        tvId,
        season: seasonNumber,
        // Unwatching clears every episode, including any unaired one ticked by hand.
        episodes: (allWatched ? episodes : aired).map(toEpisodeRuntime),
        watched,
        meta,
      },
      {
        // Failures already get the error snackbar from the mutation hook.
        onSuccess: () =>
          setSnackBarProps({
            open: true,
            severity: 'success',
            message: t(watched ? 'allEpisodesMarkedWatched' : 'allEpisodesMarkedUnwatched', { season: seasonNumber }),
          }),
      },
    );
  };

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
        <Tooltip title={gate.blockedHint}>
          {/* A disabled button fires no events, so the tooltip needs a wrapper to hang on. */}
          <span>
            <Button
              size='small'
              variant='outlined'
              startIcon={allWatched ? <RemoveDoneIcon /> : <CheckIcon />}
              disabled={gate.access === 'loading' || setEpisodesWatched.isPending || loading || error || !aired.length}
              onClick={handleMarkAll}
            >
              {t(allWatched ? 'markAllEpisodesUnwatched' : 'markAllEpisodesWatched')}
            </Button>
          </span>
        </Tooltip>
      </Box>
      <Divider sx={{ borderColor: 'rgba(226, 168, 71, 0.25)' }} />
      <EpisodesList
        episodes={seasonDetails?.episodes}
        tvId={tvId}
        meta={meta}
        seasonNumber={seasonNumber}
        watchedEpisodes={watchedEpisodes}
        loading={loading}
        error={error}
      />
    </Box>
  );
};

export default SeasonOverview;
