import type { ReactElement } from 'react';
import { Box, ButtonBase, IconButton, Skeleton, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import colors from 'src/assets/themes/colors';
import NoPoster from 'src/assets/images/no-movie.png';
import { BoardItem } from 'src/core/models/watchListBoard.model';
import { STATUS_COLOR, TYPE_COLOR } from './watchList.styles';

export interface WatchListCardHandlers {
  /** Card click, and Start / Continue on shows: opens the Summary modal. */
  onOpen: (item: BoardItem) => void;
  onMarkWatched: (item: BoardItem) => void;
  onRemove: (item: BoardItem) => void;
}

interface WatchListCardProps extends WatchListCardHandlers {
  item: BoardItem;
  dense?: boolean;
}

/**
 * Horizontal card: poster, title, meta, TV progress and one action. The whole card opens
 * the Summary modal (stretched ButtonBase); the action and × sit above it. × shows on
 * hover / keyboard focus, and always on touch screens.
 */
const WatchListCard = ({ item, dense, onOpen, onMarkWatched, onRemove }: WatchListCardProps) => {
  const { t } = useTranslation();
  const isTv = item.media_type === 'tv';
  const done = item.status === 'watched';

  const length = isTv
    ? item.seasons
      ? t('seasons', { count: item.seasons })
      : undefined
    : item.runtime
      ? t('watchListRuntime', { h: Math.floor(item.runtime / 60), m: item.runtime % 60 })
      : undefined;
  const meta = [isTv ? t('watchListTv') : t('movie'), item.year || undefined, length].filter(Boolean).join(' · ');

  // ReactElement, not JSX.Element: React 19 removed the global JSX namespace.
  let action: { label: string; icon: ReactElement; color: string; onClick?: () => void };
  if (done) action = { label: isTv ? t('finished') : t('watchListWatched'), icon: <CheckIcon />, color: 'rgba(255,255,227,0.5)' };
  else if (isTv)
    action = {
      label: item.status === 'inProgress' ? t('watchListContinue') : t('start'),
      icon: <PlayArrowIcon />,
      color: colors.success.main,
      onClick: () => onOpen(item),
    };
  else action = { label: t('markWatched'), icon: <CheckIcon />, color: colors.primary.main, onClick: () => onMarkWatched(item) };

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        gap: dense ? 1.5 : 1.75,
        p: 1.25,
        borderRadius: '10px',
        backgroundColor: 'rgba(14,11,8,0.55)',
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'border-color .15s ease',
        '&:hover': { borderColor: 'rgba(226,168,71,0.5)' },
        '&:hover .wl-remove, &:focus-within .wl-remove': { opacity: 1 },
        '@media (hover: none)': { '& .wl-remove': { opacity: 1 } },
      }}
    >
      <ButtonBase
        aria-label={item.title}
        onClick={() => onOpen(item)}
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '10px',
          '&:focus-visible': { outline: `2px solid ${colors.primary.main}`, outlineOffset: 2 },
        }}
      />
      <Box
        component='img'
        src={item.posterPath ? `https://image.tmdb.org/t/p/w154${item.posterPath}` : NoPoster}
        alt=''
        loading='lazy'
        sx={{
          width: dense ? 56 : 60,
          height: dense ? 84 : 90,
          flex: 'none',
          borderRadius: '6px',
          objectFit: 'cover',
          backgroundColor: colors.phantomBlack,
          opacity: done ? 0.55 : 1,
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 0.75,
          pr: 4,
          pointerEvents: 'none',
        }}
      >
        <Typography noWrap sx={{ fontWeight: 700, fontSize: 15 }}>
          {item.title ?? <Skeleton width='70%' />}
        </Typography>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: dense ? 12 : 13, color: 'rgba(255,255,227,0.55)', minWidth: 0 }}
        >
          <Box sx={{ width: 6, height: 6, flex: 'none', borderRadius: '50%', backgroundColor: TYPE_COLOR[item.media_type] }} />
          <Typography component='span' noWrap sx={{ fontSize: 'inherit', color: 'inherit' }}>
            {meta}
          </Typography>
        </Box>
        {isTv && item.totalEpisodes > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ flex: 1, height: 4, borderRadius: 2, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <Box sx={{ height: 4, width: `${item.progress}%`, backgroundColor: STATUS_COLOR[done ? 'watched' : 'inProgress'] }} />
            </Box>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,227,0.55)' }}>
              {item.watchedEpisodes}/{item.totalEpisodes}
            </Typography>
          </Box>
        )}
        <ButtonBase
          disabled={!action.onClick}
          onClick={action.onClick}
          sx={{
            alignSelf: 'flex-start',
            gap: 0.75,
            minHeight: 28,
            px: 0.5,
            mx: -0.5,
            borderRadius: '6px',
            fontFamily: 'inherit',
            fontWeight: 600,
            fontSize: 13,
            color: action.color,
            pointerEvents: action.onClick ? 'auto' : 'none',
            position: 'relative',
            zIndex: 1,
            '& svg': { fontSize: 16 },
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)' },
            '&.Mui-disabled': { color: action.color },
          }}
        >
          {action.icon}
          {action.label}
        </ButtonBase>
      </Box>
      <IconButton
        className='wl-remove'
        aria-label={t('remove')}
        title={t('remove')}
        onClick={() => onRemove(item)}
        sx={{
          position: 'absolute',
          top: dense ? 4 : 8,
          right: dense ? 4 : 8,
          zIndex: 1,
          width: dense ? 44 : 28,
          height: dense ? 44 : 28,
          opacity: 0,
          transition: 'opacity .15s ease',
          color: dense ? 'rgba(255,255,227,0.5)' : colors.text.primary,
          backgroundColor: dense ? 'transparent' : 'rgba(20,20,20,0.8)',
          '&:hover': { backgroundColor: dense ? 'rgba(255,255,255,0.06)' : '#5A1F1F' },
          '& svg': { fontSize: dense ? 18 : 16 },
        }}
      >
        <CloseIcon />
      </IconButton>
    </Box>
  );
};

export default WatchListCard;
