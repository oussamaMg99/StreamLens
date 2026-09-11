import SummaryModalInfoBar from './SummaryModalInfoBar.component';
import SummaryModalSeasonOverview from './SummaryModalSeasonOverview.component';
import { TvShow } from 'src/core/services/tv.service';
import { Avatar, Box, LinearProgress, List, ListItemAvatar, ListItemButton, ListItemText, Rating, Typography } from '@mui/material';
import { useState } from 'react';
import { Season, TVShowDetails } from 'src/core/models/tvShowDetails.model';
import { useTvSeasonDetails } from 'src/core/hooks/useTvSeasonDetails';
import NoPoster from 'src/assets/images/no-movie.png';
interface SummaryModalEpisodesTabProps {
  item?: TvShow;
  itemDetails?: TVShowDetails;
}

const SummaryModalEpisodesTab = (props: SummaryModalEpisodesTabProps) => {
  const { itemDetails, item } = props;
  const [selectedSeason, setSelectedSeason] = useState(itemDetails?.seasons?.[0]?.season_number ?? 1);
  const [watchTracker, setWatchTracker] = useState({});

  const handleSeasonClick = (seasonIndex: number) => {
    setSelectedSeason(seasonIndex);
  };

  const { data: seasonDetails, isLoading: episodesLoading, error: episodesError } = useTvSeasonDetails(item?.id, selectedSeason);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 0, m: 0 }}>
      <SummaryModalInfoBar itemDetails={itemDetails} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 2,
          maxHeight: '430px',
          overflowY: 'clip',
        }}
      >
        {/*  Seasons List */}
        <SeasonsList selectedSeason={selectedSeason} seasons={itemDetails?.seasons} onSeasonClick={handleSeasonClick} />
        {/* Season Overview */}
        <SummaryModalSeasonOverview
          seasonNumber={selectedSeason}
          seasonDetails={seasonDetails}
          loading={episodesLoading}
          error={!!episodesError}
        />
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
          secondary={`${season.episode_count} episodes • ${season.air_date?.split('-')[0] || 'Unknown air date'}`}
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
    <List
      component='nav'
      sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '35%', p: 0, maxHeight: 'inherit', overflowY: 'auto' }}
    >
      {seasons?.map((season, index) => (
        <SeasonItem
          selected={season?.season_number === selectedSeason}
          key={index}
          season={season}
          index={index}
          onSeasonClick={onSeasonClick}
        />
      ))}
    </List>
  );
};
