# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

StreamLens is a React 19 + TypeScript SPA (Vite) that browses movies and TV shows via **TMDB v3 API**, using Bearer-token auth. It is deployed to GitHub Pages under the `/StreamLens/` base path.

## Commands

```bash
npm run dev          # start dev server (host 0.0.0.0, port 8000)
npm run build         # tsc + vite build
npm run preview       # preview a production build
npm run lint          # eslint --fix on src/**/*.{ts,tsx,js,jsx}
npm run typecheck     # tsc --noEmit
npm run test          # run vitest once
npm run test:watch    # vitest in watch mode
npm run format        # prettier --write .
```

Run a single test file: `npx vitest run path/to/file.test.tsx`. Run tests matching a name: `npx vitest run -t "test name"`.

There is no test suite yet — `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, and `msw` are installed as devDependencies but no `*.test.*`/`*.spec.*` files exist in `src/`. When adding the first test, a Vitest config/setup file will need to be added (none currently exists in `vite.config.ts`).

Deployment: `npm run deploy` (gh-pages, POSIX) or `npm run deploy-win` (runs `publish-to-ghpages.bat`). The `docs/` directory holds a built output published via GitHub Pages — treat it as a build artifact, not source.

## Environment

TMDB access requires two env vars (see `.env` / `.env.local`, not committed):
- `VITE_TMDB_KEY`
- `VITE_TMDB_READ_ACCESS_TOKEN` — the Bearer token actually used for API auth (v3 endpoints, v4 read-access token)

## Architecture

**Path aliasing**: imports use absolute `src/...` paths (e.g. `import { X } from 'src/core/services/...'`), resolved by `vite-tsconfig-paths` + `tsconfig.json`'s `baseUrl: "./"`. Do not convert these to relative imports.

**Entry chain**: `main.tsx` sets up `QueryClientProvider` (TanStack Query, 5-min staleTime, 1 retry, refetch-on-focus) → `AppContextProvider` → MUI `ThemeProvider` → `App.tsx` → `Routes.tsx`. Routes and pages are lazy-loaded (`React.lazy`) with `LoadingPage` as the Suspense fallback. `BrowserRouter` uses `basename='/StreamLens/'` to match the Pages base path (`vite.config.ts` sets `base: '/StreamLens/'`).

**Global state** (`src/core/context/global/`): a single React Context + `useReducer` (`AppContext.tsx` / `AppReducer.ts` / `types.ts`) holds theme mode, user, and two UI-control models (`AlertDialogProps`, `SnackBarProps`) that drive a global `AlertDialog` and `SnackBarComponent` rendered once in `App.tsx`. Theme mode and user are persisted to `sessionStorage`/`localStorage` on dispatch. There is no per-feature context — all cross-cutting UI state flows through this one context.

**API layer** (`src/core/services/`): `api.service.ts` defines a reusable `ApiService` class wrapping axios — handles Bearer token injection via a `tokenProvider` callback, one-time 401 refresh via `refreshTokenFn`, retry with exponential backoff, request cancellation, and wraps failures in `ApiError`. Feature services (`movie.service.ts`, `tv.service.ts`, `search.service.ts`) **extend `ApiService`** and export both the class and a pre-configured singleton instance (e.g. `movieService`) pointed at `https://api.themoviedb.org/3` with `tokenProvider: () => import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN`. When adding a new TMDB-backed feature, follow this pattern: extend `ApiService`, export a singleton, and add a corresponding hook.

**Data fetching hooks** (`src/core/hooks/`): thin TanStack Query wrappers (e.g. `usePopularMovies`, `usePopularTvShows`, `useSearchAll`) around the service singletons — components should consume these hooks rather than calling services directly.

**Models vs types**: `src/core/models/` holds TMDB domain shapes plus UI-control classes with defaults (e.g. `AlertDialogProps`, `SnackBarProps` are instantiable classes, not plain interfaces — global state resets by constructing `new AlertDialogProps()`). `src/types/` holds app-level types unrelated to API data (currently just `RoutePaths`).

**i18n**: `src/assets/locales/i18n.js` configures `i18next` with inline-imported JSON resources for `en`, `fr`, `ar` (no lazy-loading/backend). Add new keys to all three `translation.json` files together.

**Theming**: MUI theme built in `src/assets/themes/theme.ts` from raw values in `src/assets/themes/colors.ts`; `main.tsx` wraps the app in both a raw background `div` (from `colors`) and MUI's `ThemeProvider` (from `theme`).

## Conventions

- Formatting is Prettier-enforced: single quotes, semicolons, 140-char print width, trailing commas everywhere, `arrowParens: avoid`. Run `npm run format` rather than hand-formatting.
- Some component filenames use a `.component.tsx` / `.page.tsx` suffix (e.g. `AlertDialog.component.tsx`, `Home.page.tsx`); others don't (e.g. `Navbar.tsx`, `Card.tsx`). Match the existing convention for the directory you're editing (`pages/` and newer `dialogs/`/`snackBar`/`tag` components use the suffix; older `components/` subfolders don't).
- Branching model (from README): `main` = production, `staging` = pre-production, `dev` = active development, `test` = QA/testing.
