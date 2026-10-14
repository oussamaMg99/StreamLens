import { ReactNode } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { ThemeProvider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { createAppTheme } from './theme';

// One theme + Emotion cache per direction, built once. The RTL cache runs every style
// (MUI's own and our sx props) through stylis-plugin-rtl, which swaps left/right; a
// value that must not flip needs a /* @noflip */ comment. Passing stylisPlugins replaces
// Emotion's defaults, so prefixer is listed again.
const ltr = { cache: createCache({ key: 'mui' }), theme: createAppTheme('ltr') };
const rtl = { cache: createCache({ key: 'muirtl', stylisPlugins: [prefixer, rtlPlugin] }), theme: createAppTheme('rtl') };

/**
 * Provides the MUI theme for the current language's direction. useTranslation re-renders
 * on every language change, so switching to Arabic mirrors the app without a reload
 * (`<html dir>` itself is set by the languageChanged listener in i18n.js).
 */
export default function AppThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { i18n } = useTranslation();
  const { cache, theme } = i18n.dir() === 'rtl' ? rtl : ltr;

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </CacheProvider>
  );
}
