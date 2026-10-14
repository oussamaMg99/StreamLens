import SummaryModalInfoBar from './SummaryModalInfoBar.component';
import { Season, TvShow, TVShowDetails } from 'src/core/models/tvShow.model';
import {
  Avatar,
  Box,
  ButtonBase,
  LinearProgress,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTvSeasonDetails } from 'src/core/hooks/useTvSeasonDetails';
import { useWatchListEntry } from 'src/core/hooks/useWatchList';
import NoPoster from 'src/assets/images/no-movie.png';
import { entryMetaFromDetails } from 'src/utils/watchListMeta.utils';
import SeasonOverview from './SeasonOverview.component';
import { hiddenScrollbarSx } from './summaryModal.styles';

/** season_number -> the episode numbers marked watched in it. */
type WatchedBySeason = Record<number, number[]>;

interface SummaryModalEpisodesTabProps {
  item?: TvShow;
  itemDetails?: TVShowDetails;
  /** Mobile sheet: the info bar is already in the sheet header, so it isn't repeated here. */
  compact?: boolean;
}

/** Clamped: TMDB's episode_count can lag behind a season that's already been marked further ahead. */
const seasonProgress = (season: Season, watched: number[]) =>
  season.episode_count ? Math.min(100, Math.round((watched.length / season.episode_count) * 100)) : 0;

const SummaryModalEpisodesTab = (props: SummaryModalEpisodesTabProps) => {
  const { itemDetails, item, compact } = props;
  // Below md the 35% / 65% split leaves the season cards too narrow (≈120px on a phone,
  // cramped below ~760px), so seasons become a chip row above a full-width episode list,
  // and the list stops scrolling on its own (the dialog/sheet scrolls instead).
  const stacked = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
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

  const overview = (
    <SeasonOverview
      tvId={item?.id}
      meta={meta}
      seasonNumber={selectedSeason}
      watchedEpisodes={(selectedSeason !== undefined ? watchedBySeason[selectedSeason] : undefined) ?? []}
      seasonDetails={seasonDetails}
      loading={episodesLoading}
      error={!!episodesError}
      stacked={stacked}
      flush={compact}
    />
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 0, m: 0, pt: compact ? 2 : 0, pb: compact ? 4 : 0 }}>
      {!compact && <SummaryModalInfoBar itemDetails={itemDetails} />}
      {stacked ? (
        <>
          <SeasonChips
            selectedSeason={selectedSeason}
            seasons={itemDetails?.seasons}
            watchedBySeason={watchedBySeason}
            onSeasonClick={handleSeasonClick}
            flush={compact}
          />
          {overview}
        </>
      ) : (
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
          {overview}
        </Box>
      )}
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
  const progress = seasonProgress(season, watchedEpisodes);

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
  /** Mobile sheet: the chip row bleeds to the sheet edges (the sheet has no side padding). */
  flush?: boolean;
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

/**
 * Below md: seasons as a horizontal row of 128px chips (name, episodes · year, progress).
 * Same data and click handling as SeasonsList.
 */
const SeasonChips = (props: SeasonsListProps) => {
  const { selectedSeason, seasons, watchedBySeason, onSeasonClick, flush } = props;
  const { t } = useTranslation();

  return (
    <Box
      component='nav'
      aria-label={t('summaryModalSeasons')}
      sx={{ ...hiddenScrollbarSx, display: 'flex', gap: 1.25, px: flush ? 2 : 0, pb: 0.5 }}
    >
      {seasons?.map(season => {
        const selected = season.season_number === selectedSeason;
        const watched = watchedBySeason[season.season_number] ?? [];
        const progress = seasonProgress(season, watched);
        return (
          <ButtonBase
            key={season.season_number}
            aria-pressed={selected}
            onClick={() => onSeasonClick(season.season_number)}
            sx={{
              flex: 'none',
              width: 128,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              textAlign: 'start',
              gap: 0.75,
              px: 1.5,
              py: 1.25,
              borderRadius: '10px',
              backgroundColor: selected ? 'rgba(226, 168, 71, 0.14)' : 'rgba(20, 20, 20, 0.45)',
              border: selected ? '1px solid #E2A847' : '1px solid rgba(255, 255, 255, 0.10)',
              '&:focus-visible': { outline: '2px solid #E2A847', outlineOffset: 2 },
            }}
          >
            <Typography noWrap sx={{ fontWeight: 700, fontSize: 14 }}>
              {season.name}
            </Typography>
            <Typography noWrap variant='caption' color='textSecondary'>
              {season.episode_count} {t('episodes')} • {season.air_date?.split('-')[0] || t('airDateUnknown')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <LinearProgress variant='determinate' value={progress} sx={{ flex: 1, height: 4, borderRadius: 2 }} />
              <Typography variant='caption' color='textSecondary' sx={{ fontWeight: 600, fontSize: 11 }}>
                {watched.length}/{season.episode_count}
              </Typography>
            </Box>
          </ButtonBase>
        );
      })}
    </Box>
  );
};
