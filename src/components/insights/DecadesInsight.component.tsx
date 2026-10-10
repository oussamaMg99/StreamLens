import { Fragment } from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import colors from 'src/assets/themes/colors';
import { DecadeCount } from 'src/core/models/insights.model';
import InsightSection from './InsightSection.component';

interface DecadesInsightProps {
  /** Oldest first, as buildInsightsSummary returns them. */
  decades: DecadeCount[];
}

const BAR_MAX_HEIGHT = 150;
const dimFill = 'rgba(255,255,227,0.24)';
const dimText = 'rgba(255,255,227,0.6)';

/**
 * "Decades you watch". From lg up: a "Mostly 2010s" callout beside a column chart. At md
 * the callout sits above the chart, so long labels like "années 1990" still fit. Below md:
 * horizontal bars, with the callout moved into the description line.
 *
 * The top decade is solid ivory and the rest are dimmed. Amber and teal mean movie and TV
 * everywhere else, so they aren't used here.
 *
 * RTL needs nothing extra: flex and grid order follow the document direction, so the
 * earliest decade sits on the right and the bars grow from the right.
 *
 * Renders nothing when there's no data.
 */
const DecadesInsight = (props: DecadesInsightProps) => {
  const { decades } = props;
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true });

  if (!decades.length) return null;

  const total = decades.reduce((sum, item) => sum + item.count, 0);
  const max = Math.max(...decades.map(item => item.count));
  // Ties go to the more recent decade.
  const top = decades.reduce((best, item) =>
    item.count > best.count || (item.count === best.count && item.decade > best.decade) ? item : best,
  );
  const label = (decade: number) => t('decadeLabel', { decade });
  const topLabel = label(top.decade);
  const share = t('decadeShare', {
    count: top.count,
    total: t('titlesCount', { count: total }),
    percent: t('percentValue', { value: Math.round((top.count / total) * 100) }),
  });
  const separator = i18n.dir() === 'rtl' ? '، ' : ', ';
  const chartLabel = t('decadesChartAria', {
    list: decades.map(item => t('decadeCountItem', { decade: label(item.decade), count: item.count })).join(separator),
    decade: topLabel,
  });

  return (
    <InsightSection
      title={t('decadesYouWatch')}
      description={isMdUp ? t('decadesHint') : `${t('mostlyDecade', { decade: topLabel })} · ${share}`}
    >
      {isMdUp ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { md: 'minmax(0,1fr)', lg: '240px minmax(0,1fr)' },
            gap: { md: 3, lg: 5.5 },
            alignItems: 'end',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, pb: { md: 0, lg: 4.25 } }}>
            <Typography
              sx={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,227,0.55)' }}
            >
              {t('mostly')}
            </Typography>
            <Typography sx={{ fontSize: 44, fontWeight: 800, lineHeight: 1 }}>{topLabel}</Typography>
            <Typography sx={{ fontSize: 14, color: dimText }}>{share}</Typography>
          </Box>

          <Box role='img' aria-label={chartLabel} sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.75, height: 220 }}>
            {decades.map(item => {
              const isTop = item === top;
              return (
                <Box
                  key={item.decade}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    maxWidth: 150,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: isTop ? colors.text.primary : dimText }}>{item.count}</Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: Math.max(4, Math.round((item.count / max) * BAR_MAX_HEIGHT)),
                      borderRadius: '6px 6px 0 0',
                      backgroundColor: isTop ? colors.text.primary : dimFill,
                      transition: 'height .4s ease',
                    }}
                  />
                  <Typography
                    sx={{
                      width: '100%',
                      pt: 1.25,
                      borderTop: '2px solid rgba(255,255,227,0.22)',
                      textAlign: 'center',
                      fontSize: 13,
                      fontWeight: 600,
                      lineHeight: 1.3,
                      color: isTop ? colors.text.primary : dimText,
                    }}
                  >
                    {label(item.decade)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      ) : (
        // One grid for every row, so labels of different lengths still line up.
        <Box
          role='img'
          aria-label={chartLabel}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'max-content minmax(0,1fr) max-content',
            alignItems: 'center',
            columnGap: 1.25,
            rowGap: 1,
          }}
        >
          {decades.map(item => {
            const isTop = item === top;
            const tone = isTop ? colors.text.primary : dimText;
            return (
              <Fragment key={item.decade}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: tone }}>{label(item.decade)}</Typography>
                <Box sx={{ height: 10, borderRadius: 5, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <Box
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      width: `${Math.max(2, Math.round((item.count / max) * 100))}%`,
                      backgroundColor: isTop ? colors.text.primary : dimFill,
                      transition: 'width .4s ease',
                    }}
                  />
                </Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, minWidth: 24, textAlign: 'end', color: tone }}>{item.count}</Typography>
              </Fragment>
            );
          })}
        </Box>
      )}
    </InsightSection>
  );
};

export default DecadesInsight;
