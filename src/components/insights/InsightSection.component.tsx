import { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import colors from 'src/assets/themes/colors';

interface InsightSectionProps {
  title: string;
  description?: string;
  /** Right side of the header: a toggle, a "See all" link… */
  action?: ReactNode;
  /** Shown after the title, e.g. a "New" chip. */
  badge?: ReactNode;
  /** Lets horizontally scrolling content run to the panel's right edge. */
  bleedRight?: boolean;
  /** Dashed outline, used for insights that are still rolling out. */
  dashed?: boolean;
  children: ReactNode;
}

const hairline = '1px solid rgba(255,255,255,0.07)';

/**
 * InsightSection - the one building block of the Insights feed. Every insight is a
 * section: header (title, optional badge/action, one-line description) and a body.
 * Adding an insight means adding one of these to Insights.page.tsx — nothing else.
 *
 * md and up it's a panel; below md it drops the panel and becomes a full-width block
 * separated by hairlines, which is the mobile layout from the design.
 */
const InsightSection = (props: InsightSectionProps) => {
  const { title, description, action, badge, bleedRight, dashed, children } = props;
  const panelBorder = `1px ${dashed ? 'dashed' : 'solid'} ${dashed ? 'rgba(226,168,71,0.45)' : 'rgba(255,255,255,0.10)'}`;

  return (
    <Box
      component='section'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1.5, md: 2.5 },
        minWidth: 0,
        py: 3,
        pl: { xs: 0, md: 3.5 },
        pr: { xs: 0, md: bleedRight ? 0 : 3.5 },
        borderRadius: { xs: 0, md: '12px' },
        backgroundColor: { xs: 'transparent', md: dashed ? 'rgba(20,20,20,0.35)' : 'rgba(20,20,20,0.55)' },
        border: { xs: 'none', md: panelBorder },
        borderBottom: { xs: hairline, md: panelBorder },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pr: { xs: 0, md: bleedRight ? 3.5 : 0 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
          <Typography variant='h4' component='h2' sx={{ fontWeight: 700, fontSize: { xs: 18, md: 18 } }}>
            {title}
          </Typography>
          {badge}
          {action && <Box sx={{ ml: 'auto' }}>{action}</Box>}
        </Box>
        {description && (
          <Typography variant='body2' sx={{ fontSize: 13, color: 'rgba(255,255,227,0.55)' }}>
            {description}
          </Typography>
        )}
      </Box>
      {children}
    </Box>
  );
};

/** Small dashed pill for insights that are new or still rolling out. */
export const InsightBadge = (props: { label: string }) => (
  <Box
    component='span'
    sx={{
      px: 1.25,
      py: 0.375,
      borderRadius: 20,
      border: '1px dashed rgba(226,168,71,0.6)',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: colors.primary.main,
    }}
  >
    {props.label}
  </Box>
);

export default InsightSection;
