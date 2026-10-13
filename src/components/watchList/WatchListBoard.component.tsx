import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { BoardColumn } from 'src/core/models/watchListBoard.model';
import WatchListCard, { WatchListCardHandlers } from './WatchListCard.component';
import { STATUS_COLOR, STATUS_LABEL_KEY, panelSx } from './watchList.styles';

interface WatchListBoardProps extends WatchListCardHandlers {
  columns: BoardColumn[];
}

/**
 * Desktop board. Columns share the width; when the status filter leaves one column, its
 * cards flow into several per row (auto-fill grid) instead of one long strip.
 */
const WatchListBoard = ({ columns, ...handlers }: WatchListBoardProps) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${columns.length}, minmax(0,1fr))`, gap: 2.5, alignItems: 'start' }}>
      {columns.map(column => (
        <Box
          key={column.status}
          component='section'
          aria-label={t(STATUS_LABEL_KEY[column.status])}
          sx={{ ...panelSx, p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 0 }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              px: 0.5,
              pb: 1.25,
              borderBottom: `2px solid ${STATUS_COLOR[column.status]}`,
            }}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: STATUS_COLOR[column.status] }} />
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{t(STATUS_LABEL_KEY[column.status])}</Typography>
            <Typography sx={{ ml: 'auto', fontWeight: 600, fontSize: 13, color: 'rgba(255,255,227,0.5)' }}>
              {column.items.length}
            </Typography>
          </Box>
          {column.items.length ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 1.25 }}>
              {column.items.map(item => (
                <WatchListCard key={item.key} item={item} {...handlers} />
              ))}
            </Box>
          ) : (
            <Typography sx={{ py: 3, textAlign: 'center', fontSize: 14, color: 'rgba(255,255,227,0.45)' }}>{t('columnEmpty')}</Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default WatchListBoard;
