import SummaryModalInfoBar from './SummaryModalInfoBar.component';
import { TvShow } from 'src/core/services/tv.service';
import { Avatar, Box, LinearProgress, List, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Season, TVShowDetails } from 'src/core/models/tvShowDetails.model';
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
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 0, m: 0 }}>
      <SummaryModalInfoBar item={item} itemDetails={itemDetails} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },

          justifyItems: 'center',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {/*  Seasons List */}
        <SeasonsList seasons={itemDetails?.seasons} onSeasonClick={handleSeasonClick} />
        {/* Episodes List */}
        <></>
      </Box>
    </Box>
  );
};

export default SummaryModalEpisodesTab;

const SeasonItem = (props: { season: Season; index: number; onSeasonClick: (index: number) => void }) => {
  const { season, index, onSeasonClick } = props;
  return (
    <ListItemButton
      sx={{
        gap: 1,
        backgroundColor: 'rgba(20, 20, 20, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        borderRadius: '10px',
        '&:hover': {
          border: '1px solid rgba(226, 168, 71, 0.50)',
        },
      }}
      onClick={() => onSeasonClick(index)}
    >
      <ListItemAvatar>
        <Avatar variant='square' alt='Preview' src={NoPoster} sx={{ width: 56, height: '100%' }} />
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

const SeasonsList = (props: { seasons?: Season[]; onSeasonClick: (index: number) => void }) => {
  const { seasons, onSeasonClick } = props;

  return (
    <List component='nav' sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '50%' }}>
      {seasons?.map((season, index) => (
        <SeasonItem key={index} season={season} index={index} onSeasonClick={onSeasonClick} />
      ))}
    </List>
  );
};
