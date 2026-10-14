import SummaryModalInfoBar from './SummaryModalInfoBar.component';
import { TvShow } from 'src/core/services/tv.service';
import { Avatar, Box, LinearProgress, List, ListItemAvatar, ListItemButton, ListItemText, Rating, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Season, TVShowDetails } from 'src/core/models/tvShowDetails.model';
import { useTvSeasonDetails } from 'src/core/hooks/useTvSeasonDetails';
import { useWatchListEntry } from 'src/core/hooks/useWatchList';
import NoPoster from 'src/assets/images/no-movie.png';
import { entryMetaFromDetails } from 'src/utils/watchListMeta.utils';
import SeasonOverview from './SeasonOverview.component';

/** season_number -> the episode numbers marked watched in it. */
type WatchedBySeason = Record<number, number[]>;

interface SummaryModalEpisodesTabProps {
  item?: TvShow;
  itemDetails?: TVShowDetails;
}

const SummaryModalEpisodesTab = (props: SummaryModalEpisodesTabProps) => {
  const { itemDetails, item } = props;
  // undefined until the user picks one; the show's first season then stands in. Not
  // useState(seasons[0]) — itemDetails arrives after mount, so that initial value was
  // always the fallback, which broke shows whose seasons don't start at 1 (a Specials
  // season 0, or a partially listed show). SummaryModal keys this component by show id,
  // so a previous pick doesn't leak into the next show.
  const [pickedSeason, setPickedSeason] = useState<number>();
  const selectedSeason = pickedSeason ?? itemDetails?.seasons?.[0]?.season_number;

  const handleSeasonClick = (seasonNumber: number) => {
    setPickedSeason(seasonNumber);
  };

  // Stays dormant while selectedSeason is undefined (the hook gates on it), so nothing
  // is fetched for a season that may not exist.
  const { data: seasonDetails, isLoading: episodesLoading, error: episodesError } = useTvSeasonDetails(item?.id, selectedSeason);

  // Looked up once here, the nearest common parent, so the seasons list and the season
  // overview read the same progress. One query either way — TanStack Query dedupes the
  // key — but a single owner beats two components fetching the same thing.
  const entry = useWatchListEntry(item?.id !== undefined ? { media_type: 'tv', id: item.id } : undefined);
  const watchedBySeason: WatchedBySeason = entry?.media_type === 'tv' ? entry.watched : {};
  // Stored with every episode toggle (genres, season sizes), so Insights needn't fetch it.
  const meta = useMemo(() => (itemDetails ? entryMetaFromDetails(itemDetails) : undefined), [itemDetails]);

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
        <SeasonsList
          selectedSeason={selectedSeason}
          seasons={itemDetails?.seasons}
          watchedBySeason={watchedBySeason}
          onSeasonClick={handleSeasonClick}
        />
        {/* Season Overview */}
        <SeasonOverview
          tvId={item?.id}
          meta={meta}
          seasonNumber={selectedSeason}
          watchedEpisodes={(selectedSeason !== undefined ? watchedBySeason[selectedSeason] : undefined) ?? []}
          seasonDetails={seasonDetails}
          loading={episodesLoading}
          error={!!episodesError}
        />
      </Box>
    </Box>
  );
};

export default SummaryModalEpisodesTab;

interface SeasonItemProps {
  selected: boolean;
  season: Season;
  watchedEpisodes: number[];
  onSeasonClick: (seasonNumber: number) => void;
}

const SeasonItem = (props: SeasonItemProps) => {
  const { selected, season, watchedEpisodes, onSeasonClick } = props;
  const { t } = useTranslation();

  // Clamped: TMDB's episode_count can lag behind a season that's already been marked
  // further ahead, which would otherwise render a bar past 100%.
  const progress = season.episode_count ? Math.min(100, Math.round((watchedEpisodes.length / season.episode_count) * 100)) : 0;

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
      // The season number, not the array index: seasons[0] is season 1 on shows without
      // a Specials season, and selectedSeason is used to fetch and highlight by number.
      onClick={() => onSeasonClick(season.season_number)}
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
          secondary={`${season.episode_count} ${t('episodes')} • ${season.air_date?.split('-')[0] || t('airDateUnknown')}`}
        />
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
          <LinearProgress variant='determinate' min={0} max={100} value={progress} sx={{ width: '50%' }} />
          <Typography variant='caption' color='textSecondary' sx={{ width: '50%' }}>
            {watchedEpisodes.length}/{season.episode_count} • {progress}%
          </Typography>
        </Box>
      </Box>
    </ListItemButton>
  );
};

interface SeasonsListProps {
  /** undefined before the show's seasons are known. */
  selectedSeason?: number;
  seasons?: Season[];
  watchedBySeason: WatchedBySeason;
  onSeasonClick: (seasonNumber: number) => void;
}

const SeasonsList = (props: SeasonsListProps) => {
  const { selectedSeason, seasons, watchedBySeason, onSeasonClick } = props;

  return (
    <List
      component='nav'
      sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '35%', p: 0, maxHeight: 'inherit', overflowY: 'auto' }}
    >
      {seasons?.map(season => (
        <SeasonItem
          key={season.season_number}
          selected={season?.season_number === selectedSeason}
          season={season}
          watchedEpisodes={watchedBySeason[season.season_number] ?? []}
          onSeasonClick={onSeasonClick}
        />
      ))}
    </List>
  );
};
