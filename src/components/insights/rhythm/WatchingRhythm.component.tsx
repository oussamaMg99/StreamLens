import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import colors from 'src/assets/themes/colors';
import { useWatchingRhythm } from 'src/core/hooks/useWatchingRhythm';
import { WatchListEntry } from 'src/core/models/watchList.model';
import InsightSection from 'src/components/insights/InsightSection.component';
import WeeklyActivityChart from './WeeklyActivityChart.component';
import WeekdayProfile from './WeekdayProfile.component';
import { dayFormat, localeTag, parseDay } from './rhythm.format';

/** Weeks shown: 52 from md up, 20 below (fits 358px without scrolling). */
const WEEKS_DESKTOP = 52;
const WEEKS_MOBILE = 20;
/** Under this many tracked days, show the "fills in over time" line. */
const EARLY_DAYS = 28;

interface WatchingRhythmProps {
  /** The watch list; undefined until loaded. */
  entries: WatchListEntry[] | undefined;
}

const Stat = (props: { label: string; value: string; sub?: string; size: 'lg' | 'md' }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
    <Typography
      sx={{
        fontSize: { xs: 10, md: 11 },
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,227,0.55)',
      }}
    >
      {props.label}
    </Typography>
    <Typography
      sx={{
        fontWeight: props.size === 'lg' ? 800 : 700,
        lineHeight: 1.1,
        fontSize: props.size === 'lg' ? { xs: 26, md: 30 } : { xs: 20, md: 22 },
      }}
    >
      {props.value}
    </Typography>
    {props.sub && <Typography sx={{ fontSize: { xs: 11, md: 12 }, color: 'rgba(255,255,227,0.55)' }}>{props.sub}</Typography>}
  </Box>
);

/**
 * "Watching rhythm" (design 7e): active days per week as stacked columns, the longest
 * streak, the typical week and a weekday profile.
 *
 * md+: stats + weekly chart on the left, weekday profile (280px) on the right.
 * Below md: stats in two columns, chart (20 weeks), profile stacked under it.
 * Hidden when no mark is dated yet. Computed from the loaded watch list; no loading state.
 */
const WatchingRhythm = (props: WatchingRhythmProps) => {
  const { entries } = props;
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true });
  const weeks = isMdUp ? WEEKS_DESKTOP : WEEKS_MOBILE;
  const { rhythm, since } = useWatchingRhythm({ entries, weeks });

  if (!rhythm || !since) return null;

  const lang = i18n.language;
  const longFmt = dayFormat(lang, { month: 'short', day: 'numeric', year: 'numeric' });
  const shortFmt = dayFormat(lang, { month: 'short', day: 'numeric' });
  const { longestStreak: streak } = rhythm;
  const streakValue = t('rhythmDays', { count: streak.length });
  const streakRange =
    streak.from && streak.to
      ? streak.from === streak.to
        ? shortFmt.format(parseDay(streak.from))
        : `${shortFmt.format(parseDay(streak.from))} – ${shortFmt.format(parseDay(streak.to))}`
      : undefined;
  const average =
    rhythm.averagePerWeek !== undefined
      ? new Intl.NumberFormat(localeTag(lang), { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(rhythm.averagePerWeek)
      : undefined;
  const trackedDays = rhythm.weeks.reduce((sum, week) => sum + week.trackedDays, 0);
  const summary = t('rhythmChartAria', {
    weeks: t('rhythmWeeks', { count: weeks }),
    active: t('rhythmDays', { count: rhythm.activeDays }),
    streak: streakValue,
  });
  const sinceText = t('rhythmTrackingSince', { date: longFmt.format(parseDay(since)) });
  const isEarly = trackedDays < EARLY_DAYS;

  return (
    <InsightSection
      title={t('watchingRhythm')}
      description={t('watchingRhythmHint')}
      action={
        isMdUp ? (
          <Typography
            sx={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', color: isEarly ? colors.primary.main : 'rgba(255,255,227,0.5)' }}
          >
            {sinceText}
          </Typography>
        ) : undefined
      }
    >
      {!isMdUp && (
        <Typography sx={{ mt: -0.5, fontSize: 12, fontWeight: 500, color: isEarly ? colors.primary.main : 'rgba(255,255,227,0.45)' }}>
          {sinceText}
        </Typography>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1fr) 280px' },
          gap: { xs: 2, md: 5 },
          alignItems: 'end',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 1.75 }, minWidth: 0 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: 'max-content max-content minmax(0,1fr)' },
              columnGap: { xs: 1.5, md: 5 },
              rowGap: 1.5,
              alignItems: 'end',
            }}
          >
            <Stat size='lg' label={t('rhythmLongestStreak')} value={streakValue} sub={streakRange} />
            <Stat
              size='md'
              label={average ? t('rhythmTypicalWeek') : t('rhythmActiveDays')}
              value={average ?? String(rhythm.activeDays)}
              sub={average ? t('rhythmTypicalWeekSub') : t('rhythmInLastWeeks', { count: weeks })}
            />
            {isEarly && (
              <Typography
                sx={{
                  gridColumn: { xs: '1 / -1', md: 'auto' },
                  justifySelf: { md: 'end' },
                  maxWidth: 300,
                  fontSize: { xs: 12, md: 13 },
                  lineHeight: 1.5,
                  color: 'rgba(255,255,227,0.6)',
                  textAlign: { md: 'end' },
                }}
              >
                {t('rhythmEarly')}
              </Typography>
            )}
          </Box>
          <WeeklyActivityChart weeks={rhythm.weeks} summary={summary} />
        </Box>
        <WeekdayProfile weekdays={rhythm.weekdays} topWeekday={rhythm.topWeekday} />
      </Box>
    </InsightSection>
  );
};

export default WatchingRhythm;
