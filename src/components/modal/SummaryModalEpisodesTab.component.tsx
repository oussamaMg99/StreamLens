import SummaryModalInfoBar from './SummaryModalInfoBar.component';
import { TvShow } from 'src/core/services/tv.service';
import {
  Avatar,
  Box,
  CircularProgress,
  LinearProgress,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Season, TVShowDetails } from 'src/core/models/tvShowDetails.model';
import { Episode } from 'src/core/models/seasonDetails.model';
import { useTvSeasonDetails } from 'src/core/hooks/useTvSeasonDetails';
import NoPoster from 'src/assets/images/no-movie.png';

interface SummaryModalEpisodesTabProps {
  item?: TvShow;
  itemDetails?: TVShowDetails;
}

const SummaryModalEpisodesTab = (props: SummaryModalEpisodesTabProps) => {
  const { itemDetails, item } = props;
  const { t } = useTranslation();
  const [selectedSeason, setSelectedSeason] = useState(0);

  const handleSeasonClick = (seasonIndex: number) => {
    setSelectedSeason(seasonIndex);
  };

  // Array position isn't guaranteed to equal TMDB's season_number (e.g. specials are
  // season_number 0), so look it up off the selected season object itself.
  const selectedSeasonNumber = itemDetails?.seasons?.[selectedSeason]?.season_number;
  const { data: seasonDetails, isLoading: episodesLoading, error: episodesError } = useTvSeasonDetails(item?.id, selectedSeasonNumber);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 0, m: 0 }}>
      <SummaryModalInfoBar item={item} itemDetails={itemDetails} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 2,
        }}
      >
        {/*  Seasons List */}
        <SeasonsList selectedSeason={selectedSeason} seasons={itemDetails?.seasons} onSeasonClick={handleSeasonClick} />
        {/* Episodes List */}
        <EpisodesList episodes={seasonDetails?.episodes} loading={episodesLoading} error={!!episodesError} />
      </Box>
    </Box>
  );
};

export default SummaryModalEpisodesTab;

const SeasonItem = (props: { selected: boolean; season: Season; index: number; onSeasonClick: (index: number) => void }) => {
  const { selected, season, index, onSeasonClick } = props;
  return (
    <ListItemButton
      sx={{
        gap: 1,
        backgroundColor: selected ? 'rgba(226, 168, 71, 0.14)' : 'rgba(20, 20, 20, 0.45)',
        border: selected ? '1px solid #E2A847' : '1px solid rgba(255, 255, 255, 0.10)',
        borderRadius: '10px',
        '&:hover': {
          border: '1px solid rgba(226, 168, 71, 0.50)',
        },
      }}
      onClick={() => onSeasonClick(index)}
    >
      <ListItemAvatar>
        <Avatar
          variant='square'
          alt='Preview'
          src={season.poster_path ? `https://image.tmdb.org/t/p/w200${season.poster_path}` : NoPoster}
          sx={{ width: 56, height: '100%' }}
        />
      </ListItemAvatar>
      <Box sx={{ width: '100%' }}>
        <ListItemText
          primary={`${season.name}`}
          secondary={`${season.episode_count} episodes • ${season.air_date || 'Unknown air date'}`}
        />
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
          <LinearProgress variant='determinate' min={0} max={100} value={25} sx={{ width: '50%' }} />
          <Typography variant='caption' color='textSecondary' sx={{ width: '50%' }}>
            25%
          </Typography>
        </Box>
      </Box>
    </ListItemButton>
  );
};

const SeasonsList = (props: { selectedSeason: number; seasons?: Season[]; onSeasonClick: (index: number) => void }) => {
  const { selectedSeason, seasons, onSeasonClick } = props;

  return (
    <List component='nav' sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '50%' }}>
      {seasons?.map((season, index) => (
        <SeasonItem selected={index === selectedSeason} key={index} season={season} index={index} onSeasonClick={onSeasonClick} />
      ))}
    </List>
  );
};

const EpisodeItem = ({ episode }: { episode: Episode }) => {
  return (
    <ListItemButton
      sx={{
        gap: 1,
        backgroundColor: 'rgba(20, 20, 20, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
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
      <ListItemText
        primary={`${episode.episode_number}. ${episode.name}`}
        secondary={`${episode.runtime ? `${episode.runtime} min • ` : ''}${episode.air_date || 'Unknown air date'}`}
      />
    </ListItemButton>
  );
};

const EpisodesList = ({ episodes, loading, error }: { episodes?: Episode[]; loading?: boolean; error?: boolean }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Box sx={{ width: '50%', display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '50%', p: 2 }}>
        <Typography color='error'>{t('errorLoadingEpisodes')}</Typography>
      </Box>
    );
  }

  return (
    <List component='nav' sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '50%' }}>
      {episodes?.map(episode => (
        <EpisodeItem key={episode.id} episode={episode} />
      ))}
    </List>
  );
};
