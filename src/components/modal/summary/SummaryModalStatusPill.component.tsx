import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

interface SummaryModalStatusPillProps {
  status: 'Returning Series' | 'In Production' | 'Ended' | 'Canceled';
}

const SummaryModalStatusPill = ({ status }: SummaryModalStatusPillProps) => {
  const { t } = useTranslation();

  const STATUS = {
    'Returning Series': { key: 'returningSeries', color: '#2EBFA5' },
    'In Production': { key: 'inProduction', color: '#E2A847' },
    Ended: { key: 'ended', color: '#FFFFE3' },
    Canceled: { key: 'canceled', color: '#E85D5D' },
  } as const;

  const s = STATUS[status] ?? STATUS.Ended;

  return (
    <Chip
      size='small'
      variant='outlined'
      icon={<FiberManualRecordIcon sx={{ fontSize: 9, color: `${s.color} !important` }} />}
      label={t(s.key)}
      sx={{
        mx: 'auto',
        fontWeight: 600,
        color: s.color,
        borderColor: alpha(s.color, 0.5),
        backgroundColor: alpha(s.color, 0.16),
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
};

export default SummaryModalStatusPill;
