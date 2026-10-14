import colors from 'src/assets/themes/colors';
import { BoardStatus } from 'src/core/models/watchListBoard.model';

/** Column accent per status, also used for the card's progress bar. */
export const STATUS_COLOR: Record<BoardStatus, string> = {
  notStarted: 'rgba(255,255,227,0.45)',
  inProgress: colors.success.main,
  watched: colors.primary.main,
};

export const TYPE_COLOR = { movie: colors.primary.main, tv: colors.success.main } as const;

export const STATUS_LABEL_KEY: Record<BoardStatus | 'all', string> = {
  all: 'all',
  notStarted: 'notStarted',
  inProgress: 'inProgress',
  watched: 'watchListWatched',
};

export const panelSx = {
  borderRadius: '12px',
  backgroundColor: 'rgba(20,20,20,0.45)',
  border: '1px solid rgba(255,255,255,0.07)',
} as const;

export const fieldSx = {
  height: 42,
  borderRadius: '10px',
  backgroundColor: 'rgba(20,20,20,0.55)',
  border: '1px solid rgba(255,255,255,0.12)',
} as const;
