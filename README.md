# StreamLens

Browse and search movies and TV shows from [TMDB](https://www.themoviedb.org/), keep a watch list synced across devices, track watched episodes and see insights about your viewing habits. The app is available in English, French and Arabic (with full right-to-left layout).

**Live:** https://oussamamg99.github.io/StreamLens/

## Tech stack

| Area          | Tools                                                    |
| ------------- | -------------------------------------------------------- |
| UI            | React 19, TypeScript, MUI 9, Emotion                     |
| Build & tests | Vite, Vitest                                             |
| Data          | TMDB v3 API (axios), TanStack Query                      |
| Accounts      | Firebase Auth (email/password, Google, Facebook)         |
| Storage       | Cloud Firestore (one watch-list document per user)       |
| i18n          | i18next (`en`, `fr`, `ar` + RTL via `stylis-plugin-rtl`) |

## Getting started

### Prerequisites

- **Node.js 22+** and npm
- A **TMDB API read access token**: create a free account, then go to _Settings → API_ ([themoviedb.org/settings/api](https://www.themoviedb.org/settings/api))
- A **Firebase project** with Authentication and Firestore enabled (only needed for sign-in and the watch list; browsing works without it)

### 1. Install

```bash
git clone https://github.com/mangoub99/StreamLens.git
cd StreamLens
npm install
```

> `.npmrc` sets `legacy-peer-deps=true` because TypeScript 7 is newer than `typescript-eslint`'s declared peer range. Don't remove it, or `npm install` fails.

### 2. Configure environment variables

Copy the template to `.env.local` (it's gitignored) and fill in the values. Each one is explained in [.env.example](.env.example).

```bash
cp .env.example .env.local
```

| Variable                      | Required                 | Where to get it                                             |
| ----------------------------- | ------------------------ | ----------------------------------------------------------- |
| `VITE_TMDB_READ_ACCESS_TOKEN` | Yes                      | TMDB → _Settings → API_ → **API Read Access Token**         |
| `VITE_FIREBASE_*`             | For sign-in & watch list | Firebase console → _Project settings → Your apps → Web app_ |
| `VITE_AUTH_*_ENABLED`         | No                       | Set to `true` to show that provider's sign-in button        |

The Firebase values aren't secrets: they ship to every browser, and Firestore security rules control access to data. Restart `npm run dev` after changing env files.

### 3. Set up Firebase (once per project)

1. **Authentication → Sign-in method**: enable Email/Password, plus any social provider you turned on above.
2. **Authentication → Settings → Authorized domains**: add every domain you deploy to (`localhost` is there by default). If a domain is missing, the sign-in popup closes immediately.
3. **Firestore**: create a database, then deploy the security rules:

   ```bash
   npx firebase deploy --only firestore:rules
   ```

   The rules only allow users with a **verified email** to read or write their own watch list. New email/password accounts must click the verification link before the watch list works.

### 4. Run

```bash
npm run dev
```

Open http://localhost:8000/StreamLens/. The server also listens on your local network, so you can test on a phone.

## Scripts

| Command             | What it does                                                                            |
| ------------------- | --------------------------------------------------------------------------------------- |
| `npm run dev`       | Start the dev server on port 8000                                                       |
| `npm run typecheck` | Type-check with `tsc --noEmit` (must report 0 errors)                                   |
| `npm run lint`      | Run ESLint and fix what it can                                                          |
| `npm run format`    | Format all files with Prettier                                                          |
| `npm test`          | Run Vitest (watch mode in an interactive terminal)                                      |
| `npx vitest run`    | Run all tests once                                                                      |
| `npm run build`     | Type-check, then build to `dist/` ⚠️ **also publishes** (see [Deployment](#deployment)) |
| `npm run preview`   | Serve the production build locally                                                      |

To check your changes before pushing, run `npm run typecheck`, `npm run lint` and `npx vitest run`.

## Project structure

```
src/
├── assets/        # images, locales (en/fr/ar JSON), MUI theme and colors
├── components/    # UI, one folder per area (navbar, mediaGrid, modal, insights…)
├── core/
│   ├── context/   # global app state (theme, user, dialogs, snackbar)
│   ├── hooks/     # TanStack Query hooks: useMovies, useTvShows, useWatchList…
│   ├── models/    # TMDB data shapes and UI models
│   └── services/  # TMDB API client, Firebase setup, Firestore watch list
├── pages/         # route pages (lazy-loaded)
├── types/         # app-level types (routes, media type)
└── utils/         # pure helpers, with their *.test.ts files next to them
```

Routes: `/`, `/movies`, `/tv-shows`, `/watch-list`, `/insights`, `/about`.

For architecture details and code conventions, read [CLAUDE.md](CLAUDE.md).

## Conventions

- **Imports** use absolute `src/...` paths (`import { x } from 'src/core/hooks/...'`). Files in the same folder use `./`.
- **File names**: components end in `.component.tsx`, pages in `.page.tsx`. No `index.ts` barrel files.
- **Text**: every user-facing string goes through i18next. Add new keys to all three `src/assets/locales/*/translation.json` files.
- **RTL**: write styles for left-to-right. They're mirrored automatically for Arabic.
- **Data**: components use hooks from `src/core/hooks/` and never call services directly.
- **Formatting**: Prettier (single quotes, 140-char lines). Run `npm run format` instead of formatting by hand.

## Branching & workflow

| Branch    | Purpose            |
| --------- | ------------------ |
| `main`    | Production         |
| `staging` | Pre-production     |
| `dev`     | Active development |
| `test`    | QA / testing       |

Open pull requests against `dev`.

## Deployment

The app is served by GitHub Pages under the `/StreamLens/` base path.

> ⚠️ `vite.config.ts` includes `vite-plugin-gh-pages`, so **every `npm run build` pushes `dist/` to the `gh-pages` branch**. To check that the code compiles without publishing, use `npm run typecheck`.

- **Windows:** `npm run deploy-win` runs `deployToGithubPages.bat`: a clean `npm ci`, a build, then copies `dist/` into `docs/`, commits and pushes to `dev`.
- **macOS/Linux:** `npm run deploy` builds and publishes `dist/` with `gh-pages`.

Treat `docs/` as build output and never edit it by hand. A type error stops the build, so nothing broken gets published.

## Docker

```bash
docker compose up --build
```

This starts the dev server at http://localhost:8000/StreamLens/ with live reload. See [README.Docker.md](README.Docker.md) for details.

## Credits

Movie and TV data comes from [TMDB](https://www.themoviedb.org/). This product uses the TMDB API but is not endorsed or certified by TMDB.
