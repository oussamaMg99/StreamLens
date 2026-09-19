# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

StreamLens is a React 19 + TypeScript SPA (Vite) that browses movies and TV shows via the **TMDB v3 API** (Bearer-token auth), with user accounts on **Firebase Auth** and a watch list backed by **Firestore**. It is deployed to GitHub Pages under the `/StreamLens/` base path.

## Commands

```bash
npm run dev          # start dev server (host 0.0.0.0, port 8000)
npm run build        # vite build (no type-check step)
npm run preview      # preview a production build
npm run lint         # eslint --fix on src/**/*.{ts,tsx,js,jsx}
npm run typecheck    # tsc --noEmit — currently broken, see below
npm run test         # run vitest once
npm run test:watch   # vitest in watch mode
npm run format       # prettier --write .
```

Run a single test file: `npx vitest run path/to/file.test.tsx`. Run tests matching a name: `npx vitest run -t "test name"`.

There is no test suite yet — `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, and `msw` are installed as devDependencies but no `*.test.*`/`*.spec.*` files exist in `src/`. When adding the first test, a Vitest config/setup file will need to be added (none currently exists in `vite.config.ts`).

**Type-checking is currently broken at the config level.** The installed TypeScript (~7.0) has removed two options `tsconfig.json` still uses (`baseUrl`, `moduleResolution: "node"`), so `npm run typecheck` fails before checking any code (TS5102/TS5108). Until `tsconfig.json` is fixed, type-check with a throwaway config that `include`s `src` with `"moduleResolution": "bundler"`, `"paths": { "*": ["./*"] }`, `"jsx": "react-jsx"`, `"types": ["vite/client"]`, `strict`, `skipLibCheck`, `noEmit`. Known pre-existing errors under that config (not regressions): `colors.ts` (dead `light` import), `theme.ts` (`containedPrimary`), `AlertDialog.component.tsx` ×2, `SnackBar.component.tsx` (`TransitionComponent`), `api.service.ts` (axios interceptor type).

Deployment: `npm run deploy` (gh-pages, POSIX) or `npm run deploy-win` (runs `publish-to-ghpages.bat`). The `docs/` directory holds a built output published via GitHub Pages — treat it as a build artifact, not source.

## Environment

Env vars live in `.env` / `.env.local` (gitignored, not committed):

- `VITE_TMDB_KEY`
- `VITE_TMDB_READ_ACCESS_TOKEN` — the Bearer token actually used for API auth (v3 endpoints, v4 read-access token)
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID` — Firebase web config. Not secrets (it ships to every browser; access is governed by Firestore rules), kept in env so dev/prod can target different projects.
- `VITE_AUTH_GOOGLE_ENABLED`, `VITE_AUTH_FACEBOOK_ENABLED`, `VITE_AUTH_APPLE_ENABLED` — which social sign-in tiles the auth modal shows (read in `src/utils/constants.ts`; only the literal `true` enables, unset = off). A provider must also be enabled in the Firebase console.

## Architecture

**Path aliasing**: imports use absolute `src/...` paths (e.g. `import { X } from 'src/core/services/...'`), resolved in Vite by `vite-tsconfig-paths`. Do not convert these to relative imports; sibling files in the same folder use `./`.

**Entry chain**: `main.tsx` sets up `QueryClientProvider` (TanStack Query, 5-min staleTime, 1 retry, refetch-on-focus) → `FirebaseUIProvider` → `AppContextProvider` → MUI `ThemeProvider` → `App.tsx` → `Routes.tsx`. Routes and pages are lazy-loaded (`React.lazy`) with `LoadingPage` as the Suspense fallback. `BrowserRouter` uses `basename='/StreamLens/'` to match the Pages base path (`vite.config.ts` sets `base: '/StreamLens/'`). Routes: `/`, `/movies`, `/tv-shows`, `/about` (`RoutePaths` in `src/types/Routes.type.ts`).

**Global state** (`src/core/context/global/`): a single React Context + `useReducer` (`AppContext.tsx` / `AppReducer.ts` / `types.ts`) holds theme mode, the signed-in `user`, `authReady`, and two UI-control models (`AlertDialogProps`, `SnackBarProps`) that drive a global `AlertDialog` and `SnackBarComponent` rendered once in `App.tsx`. Only theme mode is persisted (`localStorage`). There is no per-feature context — all cross-cutting UI state flows through this one context. Server state (TMDB data, watch list) belongs in TanStack Query, not here.

**Auth** (Firebase):

- `src/core/services/firebase.config.ts` initializes Firebase at module scope and exports `firebaseApp`, `auth`, `db`, `ui`, plus `authErrorKey(error)`, which maps Firebase error codes to i18n keys. Import `auth`/`db` from here rather than calling `getAuth()`/`getFirestore()`.
- **One source of truth for the user**: an `onAuthStateChanged` listener in `AppContextProvider` dispatches `SET_USER` with a plain snapshot built by `toUser()` (`src/core/models/user.model.ts`). Sign-in/sign-up forms don't call `setUser` themselves.
- Never put the Firebase `User` object in state or storage: it's mutated in place (React won't see edits) and its `toJSON()` includes the refresh token.
- `onAuthStateChanged` does **not** fire on profile edits — after `updateProfile`, call `setUser(toUser(currentUser))` yourself.
- Sign-out is just `signOut(auth)`, from anywhere. Anything that must happen on sign-out (e.g. dropping user-scoped queries like `[WATCH_LIST_QUERY_ROOT, uid]`) goes in the `onAuthStateChanged` listener, not in a sign-out button — revoked sessions and sign-out in another tab never run button code. There is deliberately no `clearSession`/`CLEAR_SESSION`.
- Render from context `user`; use `auth.currentUser` only inside event handlers for SDK calls. `user` is `undefined` both when signed out and before Firebase restores the session on load — check `authReady` before treating it as signed out.
- UI: custom forms in `src/components/modal/userAuth/` (email/password + Google/Facebook popup; Apple behind a flag) and the account view in `src/components/modal/userProfile/`. The Navbar person icon opens one or the other.

**API layer** (`src/core/services/`): `api.service.ts` defines a reusable `ApiService` class wrapping axios — Bearer token injection via a `tokenProvider` callback, one-time 401 refresh via `refreshTokenFn`, retry with exponential backoff, request cancellation, failures wrapped in `ApiError`. `tmdbList.service.ts` adds an abstract `TmdbListService<TItem, TDetails>` (shared discover/search/popular param logic, and it stamps `media_type` onto responses); `movie.service.ts` and `tv.service.ts` are thin subclasses that export both the class and a singleton (`movieService`, `tvService`) built from the shared `TMDB_CONFIG` (`tmdb.config.ts`). When adding a new TMDB-backed feature: extend `TmdbListService` (or `ApiService`), export a singleton configured with `TMDB_CONFIG`, and add a hook. `watchList.service.ts` is different — plain Firestore functions (`getWatchList(uid)`; layout `watchLists/{uid}/entries/{media_type}_{id}`), not an `ApiService`.

**Data fetching hooks** (`src/core/hooks/`): thin TanStack Query wrappers — `useMovies`, `useTvShows` (browse and search via the same smart wrapper), `useTvSeasonDetails`, `useWatchList`. Convention: signature `(args, queryOptions?: { enabled?: boolean })`, restate `staleTime: 1000 * 60 * 5`, and scope user-owned data by user in the query key (`['watch-list', uid]`) with `enabled` gated on having one. Components should consume hooks rather than call services directly.

**Models vs types**: `src/core/models/` holds TMDB domain shapes plus UI-control classes with defaults (e.g. `AlertDialogProps`, `SnackBarProps` are instantiable classes, not plain interfaces — global state resets by constructing `new AlertDialogProps()`). `Media`/`MediaDetails` (`common.model.ts`) are the bases of a `media_type`-discriminated union (`Movie | TvShow`); narrow with `isMovie`/`isTvShow` from `src/utils/global.utils.ts`. `src/types/` holds app-level types unrelated to API data (`RoutePaths`, `MediaType`).

**Components layout** (`src/components/`): one folder per UI area. `modal/` has one folder per modal (`summary/`, `userAuth/`, `userProfile/`) plus `shared/` for pieces used by more than one modal. A modal may import from its own folder and `shared/`, never from a sibling modal's folder — promote the piece to `shared/` (UI) or `src/core/` (logic) instead.

**i18n**: `src/assets/locales/i18n.js` configures `i18next` with inline-imported JSON resources for `en`, `fr`, `ar` (no lazy-loading/backend). Add new keys to all three `translation.json` files together; no user-facing string should be hardcoded in a component.

**Theming**: MUI theme built in `src/assets/themes/theme.ts` from raw values in `src/assets/themes/colors.ts`; `main.tsx` wraps the app in both a raw background `div` (from `colors`) and MUI's `ThemeProvider` (from `theme`). For text on a primary (amber) fill use `colors.onPrimary`, not `primary.contrastText` (`#fff` fails contrast there).

## Conventions

- Formatting is Prettier-enforced: single quotes, semicolons, 140-char print width, trailing commas everywhere, `arrowParens: avoid`. Run `npm run format` rather than hand-formatting.
- Filename suffixes: components use `.component.tsx`, pages use `.page.tsx`. The one remaining exception is `navbar/Navbar.tsx`. Prefix sub-component files with their parent's name (e.g. `SummaryModalInfoBar.component.tsx`) so names stay unique across folders. No `index.ts` barrel files.
- Branching model (from README): `main` = production, `staging` = pre-production, `dev` = active development, `test` = QA/testing.
