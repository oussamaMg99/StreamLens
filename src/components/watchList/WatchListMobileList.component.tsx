import { Box, Tab, Tabs, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import colors from 'src/assets/themes/colors';
import { BoardCounts, BoardItem, BoardStatusFilter, BoardTypeFilter } from 'src/core/models/watchListBoard.model';
import { visibleStatusFilters } from 'src/utils/watchListBoard.utils';
import WatchListCard, { WatchListCardHandlers } from './WatchListCard.component';
import { STATUS_LABEL_KEY } from './watchList.styles';

interface WatchListMobileListProps extends WatchListCardHandlers {
  items: BoardItem[];
  type: BoardTypeFilter;
  status: BoardStatusFilter;
  counts: BoardCounts;
  onStatusChange: (status: BoardStatusFilter) => void;
}

/** Mobile: the board's columns become status tabs above a single list. */
const WatchListMobileList = ({ items, type, status, counts, onStatusChange, ...handlers }: WatchListMobileListProps) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
      <Tabs
        value={status}
        onChange={(_, value: BoardStatusFilter) => onStatusChange(value)}
        variant='scrollable'
        scrollButtons={false}
        sx={{
          minHeight: 44,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          '& .MuiTabs-indicator': { backgroundColor: colors.primary.main },
          '& .MuiTab-root': {
            minHeight: 44,
            minWidth: 0,
            px: 0,
            mr: 2.25,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 14,
            color: 'rgba(255,255,227,0.55)',
          },
          '& .MuiTab-root.Mui-selected': { color: colors.text.primary },
        }}
      >
        {visibleStatusFilters(type).map(value => (
          <Tab
            key={value}
            value={value}
            label={
              <Box component='span' sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
                {t(STATUS_LABEL_KEY[value])}
                <Box component='span' sx={{ fontSize: 12, opacity: 0.6 }}>
                  {counts.status[value]}
                </Box>
              </Box>
            }
          />
        ))}
      </Tabs>
      {items.length ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {items.map(item => (
            <WatchListCard key={item.key} item={item} dense {...handlers} />
          ))}
        </Box>
      ) : (
        <Typography sx={{ py: 6, textAlign: 'center', fontSize: 14, color: 'rgba(255,255,227,0.5)' }}>{t('columnEmpty')}</Typography>
      )}
    </Box>
  );
};

export default WatchListMobileList;
