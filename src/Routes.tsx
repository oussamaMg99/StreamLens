import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RoutePaths } from './types/Routes.type';
const App = React.lazy(() => import('./App'));
const Home = React.lazy(() => import('./pages/Home.page'));
const About = React.lazy(() => import('./pages/About.page'));
const LoadingPage = React.lazy(() => import('./pages/LoadingPage.page'));

const AppRoutes: React.FC = () => (
  <React.Suspense fallback={<LoadingPage />}>
    <Routes>
      <Route path={RoutePaths.Default} element={<Home />} />
      <Route path={RoutePaths.ABOUT} element={<About />} />
    </Routes>
  </React.Suspense>
);

export default AppRoutes;
