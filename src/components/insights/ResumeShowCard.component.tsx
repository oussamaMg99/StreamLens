import { Box, Skeleton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import colors from 'src/assets/themes/colors';
import NoPoster from 'src/assets/images/no-movie.png';
import { ResumeShow } from 'src/core/models/insights.model';
import { useMediaDetails } from 'src/core/hooks/useMediaDetails';
import { TvShow } from 'src/core/services/tv.service';

interface ResumeShowCardProps {
  show: ResumeShow;
  onClick: (item: TvShow) => void;
}

/**
 * A started-but-unfinished show. Details come from the shared useMediaDetails cache, so
 * opening the Summary modal afterwards doesn't refetch.
 */
const ResumeShowCard = (props: ResumeShowCardProps) => {
  const { show, onClick } = props;
  const { t } = useTranslation();
  const { data } = useMediaDetails({ media_type: 'tv', id: show.id });
  const posterPath = data?.poster_path;
  // Not stored with the entry: the localized title comes from TMDB, in the UI language.
  const title = data && 'name' in data ? data.name : undefined;
  const pct = show.totalEpisodes ? Math.round((show.watchedEpisodes / show.totalEpisodes) * 100) : 0;

  return (
    <Box
      component='button'
      type='button'
      // Partial on purpose: SummaryModal resolves everything it shows through
      // useMediaDetails(media_type, id), and isTvShow only reads media_type.
      onClick={() => onClick({ media_type: 'tv', id: show.id } as TvShow)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.25,
        minWidth: { xs: 260, sm: 0 },
        flex: { xs: 'none', sm: 'initial' },
        textAlign: 'left',
        fontFamily: 'inherit',
        cursor: 'pointer',
        borderRadius: '10px',
        backgroundColor: 'rgba(20,20,20,0.5)',
        border: '1px solid rgba(255,255,255,0.08)',
        transition: 'border-color .15s ease',
        '&:hover': { borderColor: 'rgba(226,168,71,0.5)' },
        '&:focus-visible': { outline: `2px solid ${colors.primary.main}`, outlineOffset: 2 },
      }}
    >
      <Box
        component='img'
        src={posterPath ? `https://image.tmdb.org/t/p/w154${posterPath}` : NoPoster}
        alt=''
        loading='lazy'
        sx={{ width: 44, height: 66, flex: 'none', borderRadius: '6px', objectFit: 'cover', backgroundColor: colors.phantomBlack }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ fontWeight: 700, fontSize: 14 }}>
          {title ?? <Skeleton width='70%' />}
        </Typography>
        <Typography sx={{ mt: 0.375, mb: 0.875, fontSize: 12, color: 'rgba(255,255,227,0.55)' }}>
          {t('nextEpisode', { season: show.nextSeason, episode: show.nextEpisode })}
        </Typography>
        <Box sx={{ height: 4, borderRadius: 2, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.14)' }}>
          <Box sx={{ height: 4, width: `${pct}%`, backgroundColor: colors.success.main }} />
        </Box>
      </Box>
    </Box>
  );
};

export default ResumeShowCard;
