import './index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material';
import theme from './assets/themes/theme';
import colors from './assets/themes/colors';
import { AppContextProvider } from './core/context/global/AppContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // good defaults for TMDB data
      staleTime: 1000 * 60 * 5, // 5 min: cached but considered "fresh"
      refetchOnWindowFocus: true,
      retry: 1, // TMDB is stable; 1 retry is often enough
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
        <div style={{ background: colors.background.default }}>
          <ThemeProvider theme={theme}>
          <App />
          </ThemeProvider>
        </div>
      </AppContextProvider>
    </QueryClientProvider>
  </StrictMode>,
);
