import { forwardRef } from 'react';
import { Box, useTheme } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import { useTranslation } from 'react-i18next';
import colors from 'src/assets/themes/colors';
import NoPoster from 'src/assets/images/no-movie.png';
import { HiddenGem } from 'src/core/hooks/useHiddenGems';

const IMG = 'https://image.tmdb.org/t/p';
const hairline = 'rgba(255,255,227,0.16)';

const focusRing = (offset: number) => ({
  '&:focus-visible': { outline: `2px solid ${colors.primary.main}`, outlineOffset: offset },
});

/**
 * Display strings for one gem. Numbers use Latin digits in every language, the same as
 * the rest of the app, and the locale's decimal mark (8.4 in English, 8,4 in French).
 */
export const useGemText = () => {
  const { t, i18n } = useTranslation();
  const locale = `${i18n.language}-u-nu-latn`;
  const scoreFormat = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const countFormat = new Intl.NumberFormat(locale);

  return (gem: HiddenGem) => {
    const isMovie = gem.media_type === 'movie';
    const title = isMovie ? gem.title : gem.name;
    const year = (isMovie ? gem.release_date : gem.first_air_date)?.slice(0, 4) ?? '';
    const score = scoreFormat.format(gem.vote_average);
    const votes = t('votesCount', { count: gem.vote_count });
    return {
      title,
      year,
      score,
      votes,
      votesNumber: countFormat.format(gem.vote_count),
      type: isMovie ? t('mediaMovie') : t('mediaTvShort'),
      dot: isMovie ? colors.primary.main : colors.success.main,
      aria: t('gemAria', { title, type: isMovie ? t('mediaMovieLong') : t('mediaTvLong'), year, score, votes }),
    };
  };
};

type GemText = ReturnType<ReturnType<typeof useGemText>>;

/** Dot + "Movie" / "TV" + year. The type is always written out, never shown by colour alone. */
const TypeMeta = (props: { text: GemText }) => (
  <Box
    component='span'
    sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: 12, fontWeight: 500, color: 'rgba(255,255,227,0.6)' }}
  >
    <Box component='span' sx={{ width: 7, height: 7, flex: 'none', borderRadius: '50%', backgroundColor: props.text.dot }} />
    <span>{props.text.type}</span>
    {props.text.year && <span aria-hidden='true'>·</span>}
    {props.text.year && <span>{props.text.year}</span>}
  </Box>
);

/** "8.4 ★ | 312 votes": score and votes always side by side, which is what makes it a gem. */
export const ScorePill = (props: { text: GemText; size?: 'small' | 'medium' }) => {
  const small = props.size !== 'medium';
  return (
    <Box
      component='span'
      aria-hidden='true'
      sx={{
        display: 'flex',
        width: 'fit-content',
        borderRadius: small ? '6px' : '8px',
        overflow: 'hidden',
        border: `1px solid ${hairline}`,
        fontSize: small ? 12 : 14,
      }}
    >
      <Box
        component='span'
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.375,
          px: small ? 0.875 : 1.25,
          py: small ? 0.375 : 0.625,
          fontWeight: 700,
          color: colors.text.primary,
          backgroundColor: 'rgba(255,255,227,0.08)',
        }}
      >
        {props.text.score}
        <StarIcon sx={{ fontSize: small ? 12 : 14 }} />
      </Box>
      <Box
        component='span'
        sx={{
          px: small ? 0.875 : 1.25,
          py: small ? 0.375 : 0.625,
          fontWeight: 600,
          color: 'rgba(255,255,227,0.72)',
          borderInlineStart: `1px solid ${hairline}`,
        }}
      >
        {props.text.votes}
      </Box>
    </Box>
  );
};

/** The spotlight's larger version: labelled Score and Votes blocks. */
const ScoreBlocks = (props: { text: GemText }) => {
  const { t } = useTranslation();
  const caption = {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,227,0.55)',
  } as const;
  return (
    <Box
      component='span'
      aria-hidden='true'
      sx={{ display: 'flex', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,227,0.18)' }}
    >
      <Box
        component='span'
        sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, px: 1.75, py: 1, backgroundColor: 'rgba(255,255,227,0.08)' }}
      >
        <Box component='span' sx={caption}>
          {t('score')}
        </Box>
        <Box component='span' sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, color: colors.text.primary }}>
          <Box component='span' sx={{ fontSize: 24, fontWeight: 800 }}>
            {props.text.score}
          </Box>
          <StarIcon sx={{ fontSize: 15, alignSelf: 'center' }} />
          <Box component='span' sx={{ fontSize: 13, color: 'rgba(255,255,227,0.55)' }}>
            /10
          </Box>
        </Box>
      </Box>
      <Box
        component='span'
        sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, px: 1.75, py: 1, borderInlineStart: '1px solid rgba(255,255,227,0.18)' }}
      >
        <Box component='span' sx={caption}>
          {t('votesLabel')}
        </Box>
        <Box component='span' sx={{ fontSize: 24, fontWeight: 800, color: colors.text.primary }}>
          {props.text.votesNumber}
        </Box>
      </Box>
    </Box>
  );
};

interface GemProps {
  gem: HiddenGem;
  onClick: (gem: HiddenGem) => void;
}

/**
 * The #1 gem. Backdrop beside the text from md up, stacked above it below md. The whole
 * card is one button. Its children are spans so the markup stays valid inside a button.
 */
export const HiddenGemSpotlight = (props: GemProps) => {
  const { gem, onClick } = props;
  const { t } = useTranslation();
  const theme = useTheme();
  const text = useGemText()(gem);

  return (
    <Box
      component='button'
      type='button'
      aria-label={t('topGemAria', { details: text.aria })}
      onClick={() => onClick(gem)}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'minmax(0,1.3fr) minmax(0,1fr)' },
        p: 0,
        textAlign: 'start',
        font: 'inherit',
        color: 'inherit',
        cursor: 'pointer',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: 'rgba(20,20,20,0.6)',
        border: '1px solid rgba(255,255,255,0.12)',
        transition: 'border-color .15s ease',
        '&:hover': { borderColor: 'rgba(226,168,71,0.5)' },
        ...focusRing(3),
      }}
    >
      <Box component='span' sx={{ position: 'relative', display: 'block', aspectRatio: '16 / 9', backgroundColor: colors.phantomBlack }}>
        {gem.backdrop_path && (
          <Box
            component='img'
            src={`${IMG}/w780${gem.backdrop_path}`}
            alt=''
            loading='lazy'
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        <Box
          component='span'
          sx={{
            position: 'absolute',
            top: { xs: 10, md: 14 },
            insetInlineStart: { xs: 10, md: 14 },
            px: { xs: 1.125, md: 1.25 },
            py: 0.625,
            borderRadius: '6px',
            fontSize: { xs: 11, md: 12 },
            fontWeight: 700,
            color: colors.text.primary,
            backgroundColor: 'rgba(20,20,20,0.75)',
          }}
        >
          {t('topGem')}
        </Box>
      </Box>

      <Box
        component='span'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: { xs: 1.25, md: 1.75 },
          minWidth: 0,
          p: { xs: 1.75, md: '26px 28px' },
        }}
      >
        <TypeMeta text={text} />
        <Box component='span' sx={{ fontSize: { xs: 22, md: 30 }, fontWeight: 800, lineHeight: 1.15, color: colors.text.primary }}>
          <bdi>{text.title}</bdi>
        </Box>
        <Box
          component='span'
          sx={{
            fontSize: 14,
            lineHeight: 1.6,
            color: 'rgba(255,255,227,0.7)',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {gem.overview || t('noSummaryAvailable')}
        </Box>
        <Box component='span' sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2.25 }}>
          <Box component='span' sx={{ display: { xs: 'none', md: 'flex' } }}>
            <ScoreBlocks text={text} />
          </Box>
          <Box component='span' sx={{ display: { xs: 'flex', md: 'none' } }}>
            <ScorePill text={text} size='medium' />
          </Box>
          <Box
            component='span'
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              alignItems: 'center',
              gap: 0.75,
              fontSize: 14,
              fontWeight: 600,
              color: colors.primary.main,
            }}
          >
            {t('viewDetails')}
            <ArrowForwardIcon sx={{ fontSize: 16, transform: theme.direction === 'rtl' ? 'scaleX(-1)' : 'none' }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

/**
 * One gem in the grid. From sm up: poster, title on up to 2 lines, type and year, then the
 * score pill. Below sm it becomes a list row: smaller poster, a 1-line title, and the score
 * and votes stacked at the end of the row. It stays at least 44px tall, for touch.
 * Forwards its ref so "Show more" can move focus to the first newly shown card.
 */
export const HiddenGemCard = forwardRef<HTMLButtonElement, GemProps>((props, ref) => {
  const { gem, onClick } = props;
  const text = useGemText()(gem);

  return (
    <Box
      component='button'
      ref={ref}
      type='button'
      aria-label={text.aria}
      onClick={() => onClick(gem)}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: { xs: 'center', sm: 'flex-start' },
        gap: 1.5,
        p: { xs: 1, sm: 1.25 },
        minHeight: 44,
        textAlign: 'start',
        font: 'inherit',
        color: 'inherit',
        cursor: 'pointer',
        borderRadius: '10px',
        backgroundColor: 'rgba(20,20,20,0.5)',
        border: '1px solid rgba(255,255,255,0.08)',
        transition: 'border-color .15s ease',
        '&:hover': { borderColor: 'rgba(226,168,71,0.5)' },
        ...focusRing(2),
      }}
    >
      <Box
        component='img'
        src={gem.poster_path ? `${IMG}/w185${gem.poster_path}` : NoPoster}
        alt=''
        loading='lazy'
        sx={{
          width: { xs: 48, sm: 60 },
          height: { xs: 72, sm: 90 },
          flex: 'none',
          borderRadius: '6px',
          objectFit: 'cover',
          backgroundColor: colors.phantomBlack,
        }}
      />
      <Box component='span' sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, flex: 1, minWidth: 0, pt: { sm: 0.25 } }}>
        <Box
          component='span'
          sx={{
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1.3,
            color: colors.text.primary,
            display: '-webkit-box',
            WebkitLineClamp: { xs: 1, sm: 2 },
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          <bdi>{text.title}</bdi>
        </Box>
        <TypeMeta text={text} />
        <Box component='span' sx={{ display: { xs: 'none', sm: 'flex' } }}>
          <ScorePill text={text} />
        </Box>
      </Box>
      <Box
        component='span'
        aria-hidden='true'
        sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column', alignItems: 'flex-end', gap: 0.25, flex: 'none' }}
      >
        <Box
          component='span'
          sx={{ display: 'flex', alignItems: 'center', gap: 0.375, fontSize: 14, fontWeight: 700, color: colors.text.primary }}
        >
          {text.score}
          <StarIcon sx={{ fontSize: 12 }} />
        </Box>
        <Box component='span' sx={{ fontSize: 11, color: 'rgba(255,255,227,0.6)' }}>
          {text.votes}
        </Box>
      </Box>
    </Box>
  );
});
HiddenGemCard.displayName = 'HiddenGemCard';
