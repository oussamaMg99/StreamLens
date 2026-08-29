import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RoutePaths } from './types/Routes.type';
const Home = React.lazy(() => import('./pages/Home.page'));
const About = React.lazy(() => import('./pages/About.page'));
const LoadingPage = React.lazy(() => import('./pages/LoadingPage.page'));
const Movies = React.lazy(() => import('./pages/Movies.page'));
const TVShows = React.lazy(() => import('./pages/TVShows.page'));

const AppRoutes: React.FC = () => (
  <React.Suspense fallback={<LoadingPage />}>
    <Routes>
      <Route path={RoutePaths.Default} element={<Home />} />
      <Route path={RoutePaths.ABOUT} element={<About />} />
      <Route path={RoutePaths.MOVIES} element={<Movies />} />
      <Route path={RoutePaths.TV_SHOWS} element={<TVShows />} />
    </Routes>
  </React.Suspense>
);

export default AppRoutes;
