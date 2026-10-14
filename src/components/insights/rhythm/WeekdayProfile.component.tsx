import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import colors from 'src/assets/themes/colors';
import { weekdayName } from './rhythm.format';

interface WeekdayProfileProps {
  /** Active days per weekday, Monday first. */
  weekdays: number[];
  /** Index of the busiest weekday, -1 when there's no activity. */
  topWeekday: number;
}

/**
 * Active days per weekday as 7 short bars, busiest day highlighted and named in the
 * heading ("Most active on Sundays"). Weekday names come from Intl in the UI language,
 * Monday first. In RTL the label sits on the right and the bars grow leftwards — that's
 * plain grid/flex behaviour, nothing is flipped by hand.
 */
const WeekdayProfile = (props: WeekdayProfileProps) => {
  const { weekdays, topWeekday } = props;
  const { t, i18n } = useTranslation();
  const max = Math.max(1, ...weekdays);
  const summary = t('rhythmWeekdayAria', {
    list: weekdays
      .map((count, index) => t('rhythmWeekdayItem', { day: weekdayName(i18n.language, index, 'long'), count }))
      .join(i18n.dir() === 'rtl' ? '، ' : ', '),
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: 2,
        borderRadius: '10px',
        backgroundColor: 'rgba(20,20,20,0.5)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {topWeekday >= 0 && (
        <Typography component='h3' sx={{ fontSize: 14, fontWeight: 700 }}>
          {t('rhythmMostActive', { day: weekdayName(i18n.language, topWeekday, 'long') })}
        </Typography>
      )}
      <Box
        role='img'
        aria-label={summary}
        sx={{
          display: 'grid',
          gridTemplateColumns: 'max-content minmax(0,1fr) max-content',
          alignItems: 'center',
          columnGap: 1,
          rowGap: 1,
        }}
      >
        {weekdays.map((count, index) => {
          const top = index === topWeekday;
          const tone = top ? colors.text.primary : 'rgba(255,255,227,0.6)';
          return (
            <Box key={index} sx={{ display: 'contents' }}>
              <Typography aria-hidden='true' sx={{ fontSize: 12, fontWeight: 600, color: tone, minWidth: 34 }}>
                {weekdayName(i18n.language, index, 'short')}
              </Typography>
              <Box aria-hidden='true' sx={{ height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.07)' }}>
                <Box
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    width: `${Math.round((count / max) * 100)}%`,
                    backgroundColor: top ? colors.primary.main : 'rgba(226,168,71,0.4)',
                  }}
                />
              </Box>
              <Typography aria-hidden='true' sx={{ fontSize: 12, fontWeight: 600, color: tone, minWidth: 22, textAlign: 'end' }}>
                {count}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default WeekdayProfile;
