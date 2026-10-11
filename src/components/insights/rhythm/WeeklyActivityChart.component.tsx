import { Box, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { RhythmWeek } from 'src/utils/rhythm.utils';
import { dayFormat, parseDay } from './rhythm.format';

interface WeeklyActivityChartProps {
  weeks: RhythmWeek[];
  /** Read by screen readers instead of the columns. */
  summary: string;
}

const FILLED = 'rgba(226,168,71,0.8)';
const EMPTY = 'rgba(255,255,227,0.07)';

/**
 * One column per week; each column is 7 stacked slots, filled bottom-up with that week's
 * active days. Slots that aren't tracked (future days, before tracking started) are left
 * blank, so the current and first weeks read as partial, not as idle.
 *
 * Columns share the width (repeat(N, 1fr)), so 52 fit desktop and 20 fit 358px.
 * RTL: grid columns follow the document direction, so the newest week sits on the left.
 * The chart is one role="img" with a text summary; the per-week tooltips are mouse-only
 * extras, the summary and the weekday profile carry the same information as text.
 */
const WeeklyActivityChart = (props: WeeklyActivityChartProps) => {
  const { weeks, summary } = props;
  const { t, i18n } = useTranslation();
  const monthFmt = dayFormat(i18n.language, { month: 'short' });
  const weekFmt = dayFormat(i18n.language, { month: 'short', day: 'numeric' });
  const columns = `repeat(${weeks.length}, minmax(0,1fr))`;
  const gap = { xs: '3px', md: '4px' };

  return (
    <Box role='img' aria-label={summary} sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, minWidth: 0 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: columns, columnGap: gap, alignItems: 'end' }}>
        {weeks.map(week => (
          <Tooltip
            key={week.start}
            // "1 active day · 3 titles · week of Oct 12"; the titles part is left out for an idle week.
            title={[
              t('rhythmActiveDaysCount', { count: week.activeDays }),
              week.titles > 0 ? t('titlesCount', { count: week.titles }) : '',
              t('rhythmWeekOf', { week: weekFmt.format(parseDay(week.start)) }),
            ]
              .filter(Boolean)
              .join(' · ')}
            placement='top'
            disableInteractive
            // Hover only: the chart is a single image for keyboard and screen-reader users.
            disableFocusListener
            disableTouchListener
          >
            <Box sx={{ display: 'flex', flexDirection: 'column-reverse', gap: '2px', py: 0.25 }}>
              {Array.from({ length: 7 }, (_, slot) => (
                <Box
                  key={slot}
                  sx={{
                    height: { xs: 7, md: 9 },
                    borderRadius: '2px',
                    backgroundColor: slot < week.activeDays ? FILLED : slot < week.trackedDays ? EMPTY : 'transparent',
                  }}
                />
              ))}
            </Box>
          </Tooltip>
        ))}
      </Box>
      <Box
        aria-hidden='true'
        sx={{ display: 'grid', gridTemplateColumns: columns, columnGap: gap, pt: 0.75, borderTop: '1px solid rgba(255,255,227,0.18)' }}
      >
        {weeks.map(week => (
          <Box
            key={week.start}
            component='span'
            sx={{ minWidth: 0, overflow: 'visible', whiteSpace: 'nowrap', fontSize: 11, fontWeight: 500, color: 'rgba(255,255,227,0.55)' }}
          >
            {/* Label the week that holds the 1st: its Sunday is in the new month. */}
            {week.monthStart ? monthFmt.format(parseDay(week.start, 6)) : ''}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default WeeklyActivityChart;
