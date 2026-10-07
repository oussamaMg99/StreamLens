import { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { InsightsSummary } from 'src/core/models/insights.model';
import { MediaType } from 'src/types/global.type';
import InsightSection from './InsightSection.component';
import GenrePodium from './GenrePodium.component';
import MediaTypeToggle from './MediaTypeToggle.component';

interface GenresInsightProps {
  topGenres: InsightsSummary['topGenres'];
  movies: number;
  tvShows: number;
}

/**
 * Top genres. md and up: movie and TV podiums side by side (design 4b). Below md: one
 * podium behind a full-width Movies / TV switch (design 4a mobile).
 */
const GenresInsight = (props: GenresInsightProps) => {
  const { topGenres, movies, tvShows } = props;
  const { t } = useTranslation();
  const theme = useTheme();
  // noSsr: read the media query on the first render, so desktop doesn't flash the mobile layout.
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'), { noSsr: true });
  const [mobileType, setMobileType] = useState<MediaType>(MediaType.Movie);

  if (isMdUp) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
        <InsightSection title={t('topGenresFor', { type: t('movies') })} action={<Total label={t('moviesCount', { count: movies })} />}>
          <GenrePodium genres={topGenres.movie} total={movies} mediaType={MediaType.Movie} />
        </InsightSection>
        <InsightSection title={t('topGenresFor', { type: t('tvShows') })} action={<Total label={t('showsCount', { count: tvShows })} />}>
          <GenrePodium genres={topGenres.tv} total={tvShows} mediaType={MediaType.TVShow} />
        </InsightSection>
      </Box>
    );
  }

  const isMovie = mobileType === MediaType.Movie;
  return (
    <InsightSection title={t('yourTopGenres')}>
      <MediaTypeToggle value={mobileType} onChange={setMobileType} fullWidth />
      <GenrePodium compact genres={isMovie ? topGenres.movie : topGenres.tv} total={isMovie ? movies : tvShows} mediaType={mobileType} />
    </InsightSection>
  );
};

/** `label` is an already-pluralized count, e.g. "74 movies". */
const Total = (props: { label: string }) => {
  const { t } = useTranslation();
  return (
    <Box component='span' sx={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,227,0.5)' }}>
      {t('ofTotal', { total: props.label })}
    </Box>
  );
};

export default GenresInsight;
