# Maintainability & Readability Report

This report was generated from a full sweep of `src/` (UI layer + services/hooks/models/config) to identify what's hurting maintainability and readability. It's meant to be worked through over multiple sessions — check items off as they're addressed, and feel free to append new findings here as they come up.

## 🐛 Actual bugs (not just style)

- [x] **`clearSession` doesn't clear the session.** `AppReducer.ts`'s `CLEAR_SESSION` case called `localStorage.clear()` only, but `_themeMode` was read/written via `localStorage` while `_user` was read from `sessionStorage` at init but written to `localStorage` on every `SET_USER` — an inconsistent mix, so `sessionStorage` was never actually cleared. The reducer also returned a shape (`popularMovies`, `popularTVShows`) that didn't match `AppContextState` at all. **Fixed**: storage is now split by intent — `_themeMode` (a UI preference) consistently uses `localStorage`, `_user` (destined to hold auth state once login is implemented) consistently uses `sessionStorage` so it doesn't outlive the tab, and `CLEAR_SESSION` clears both stores and returns a properly-shaped state.
- [x] **Hardcoded default search term.** `Navbar.tsx` — `useState('star wars')` as the initial search value. **Resolved indirectly**: search was removed from `Navbar.tsx` entirely (relocated to dedicated per-page search on the upcoming Movies/TV Shows pages — see the "Search relocation" note below), taking the hardcoded default with it. The extracted `SearchBar.component.tsx` takes `value`/`onChange` as controlled props with no built-in default — just don't reintroduce one when wiring it up on the new pages.
- [ ] **`SummaryModal` bypasses the app's own data-fetching pattern.** Every other feature uses a `useXxx` React Query hook; `SummaryModal.tsx` hand-rolls `useState`/`useEffect` and calls `movieService`/`tvService` directly — no caching, no retry, inconsistent with the rest of the app.

## 🗑️ Dead code / unused files

- [x] `src/pages/Home1.page.tsx` — 321 lines, a near-duplicate of `Home.page.tsx`, not referenced by `Routes.tsx` or anywhere else. **Deleted.**
- [ ] `src/utils/global.utils.ts` — empty. **Kept intentionally** — earmarked for future constants.
- [x] `src/components/card/Card.tsx` — stub (`<div>Card</div>`), unused. **Deleted.**
- [x] `src/components/card/TeamMemberCard.tsx`, `src/components/section/{HeroSection,PopularSection,SectionHeader}.tsx` — fully built but never imported anywhere. **Deleted**, along with `src/components/card/PopularCard.tsx` (its only consumer was `PopularSection.tsx`, so it became orphaned too).
- [x] `.eslintrc.cjs` — legacy eslintrc config, never loaded (ESLint 10 uses flat config only). **Deleted.** Note: `eslint-plugin-react` in `package.json` devDependencies was its only consumer and is now fully unused — worth removing in a dependency-cleanup pass, not done here since it touches `package-lock.json`.
- [x] `tmdbApi` export in `api.service.ts` — unused singleton duplicating config that `movieService`/`tvService`/`searchService` each redefine anyway. **Removed.**
- [x] Commented-out blocks left in place: `Navbar.tsx` (icon imports, mobile drawer `IconButton` block), `SummaryModal.tsx` (`DialogTitle` block). **Removed.**
- [x] Dead import `import { act } from 'react'` in `AppReducer.ts` (also found `import theme from 'src/assets/themes/theme'` unused in the same file — removed too); unused `searchService` import in `Navbar.tsx`; `RoutePaths.HOME` declared but never routed. **Removed/cleaned up.**
- [x] Unnecessary `import React from 'react'` (react-jsx runtime makes it dead weight) in `LoadingPage.page.tsx`, `SnackBar.component.tsx`, `About.page.tsx` — **removed**; the same issue in `PopularSection.tsx`, `Card.tsx`, `TeamMemberCard.tsx` was moot once those files were deleted.

**Search relocation (not originally flagged in the audit, noted here for the record):** the global multi-search (`/search/multi`) was retired outright — `search.service.ts`, `useSearchAll.ts`, and `person.model.ts` (only ever imported by `search.service.ts`) were deleted — in favor of dedicated `/search/movie` and `/search/tv` search on the upcoming Movies/TV Shows pages. `Navbar.tsx` was simplified back to pure nav chrome (logo, links, language switcher, mobile menu toggle), and the search UI itself was extracted into a reusable, media-type-agnostic `src/components/search/SearchBar.component.tsx` for those pages to use. New `useMovies`/`useTvShows` hooks (`src/core/hooks/`) back both browsing and searching for each resource through the same `movieService.getMovies`/`tvService.getTvShows` smart wrappers already in place.

**Home page restructure (also not originally flagged, noted for the record):** the full "Popular Movies"/"Popular TV Shows" grids moved off `Home.page.tsx` onto the now-built-out `Movies.page.tsx`/`TVShows.page.tsx` (each with real pagination via `useMovies`/`useTvShows`); Home keeps a small teaser row per type with a "See all" link. `usePopularMovies`/`usePopularTvShows` were retired (confirmed via grep to have exactly one real consumer, `Home.page.tsx`) since `useMovies({})`/`useTvShows({})` already produce the identical result through the same smart-wrapper fallback — one hook per resource instead of two.

## 🧬 Duplication that should be factored out

- [x] `movie.service.ts` and `tv.service.ts` are structurally identical (same 5-method shape, same discover-filter logic, same singleton bootstrap) with only names swapped. **Fixed**: extracted an abstract `TmdbListService<TItem, TDetails>` base (`src/core/services/tmdbList.service.ts`) holding the shared discover-filter detection, `with_genres` joining, and param-building logic. `MovieService`/`TvService` are now thin subclasses that just set `mediaType` and delegate; all public method names/signatures (`getMovies`, `getPopularMovie`, etc.) are unchanged, so no consumer had to change. Also dropped `GetTvOptions.timezone`, a dead field that was declared but never read anywhere.
- [x] Model duplication: `Genre`, `ProductionCompany`, `ProductionCountry`, `SpokenLanguage` were declared byte-for-byte in both `movieDetails.model.ts` and `tvShowDetails.model.ts`. **Fixed**: moved to `src/core/models/common.model.ts`, imported by both.
- [x] Three separate "poster card" implementations (`PopularCard`, and two local `MediaCard`s inside `Home.page.tsx`/`Home1.page.tsx`) doing the same job with different markup. (`PopularCard`/`Home1.page.tsx` were deleted as dead code in item 2, leaving one inline implementation in `Home.page.tsx`.) **Fully resolved**: that implementation was extracted into `src/components/mediaGrid/{MediaGrid,MediaCard}.component.tsx`, now reused by Home's teaser rows and the Movies/TV Shows pages' full grids — one implementation, three consumers. As a side benefit, the card no longer guesses between movie/tv field names (`item.title ?? item.name ?? ...`); each page computes `title`/`posterPath`/`year`/`rating` once at its own mapping site (where the real type is known) and hands the card a normalized shape, the same pattern `SearchBar.component.tsx` already used for search results. `HeroCarousel` (genuinely mixed movies+TV in one carousel) keeps its own fallback logic — that's a legitimate use, not touched.
- [x] The TMDB base URL / Bearer `tokenProvider` / `timeout: 15_000` boilerplate was copy-pasted across movie/tv/search services (plus the unused `tmdbApi`, removed in item 2). **Fixed**: consolidated into one `TMDB_CONFIG` object in `src/core/services/tmdb.config.ts`. The `{ page, results, total_pages, total_results }` response envelope was also deduplicated into a shared `TmdbListResponse<TItem>` type. (The third original consumer, `searchService`/`SearchAllResponse`, was retired outright in a later pass — see the "Search relocation" note above — so both now only back `movieService`/`tvService` and `MovieListResponse`/`TvListResponse`.)
- [ ] Same hero gradient string (`colors.phantomBlack.replace('0.6','1')` + hardcoded stops) duplicated verbatim in `Home.page.tsx` and `SummaryModal.tsx`.

## 🔓 Type safety holes

- [ ] `User` is `export interface User {}` — an empty interface, equivalent to `any`; `AppContextState.user` has no real type checking.
- [ ] `AppReducer(state: any, action: any)` — no discriminated union for actions despite `AppContextType` being well-typed.
- [ ] `MovieListResponse`/`TvListResponse` type `results` as `(TvShow & Movie)[]` — an intersection that's structurally impossible for a real response to satisfy (a movie result can't have `TvShow`'s required `name`). Should be a `media_type`-discriminated union instead — the field already exists on both base types but is never used to discriminate. **Now actively surfacing**: `Home.page.tsx` (still typed with the wide `MediaItem = TvShow & Movie` for its genuinely-mixed hero carousel) has 3 pre-existing `tsc` errors from assigning the honestly single-type `useMovies`/`useTvShows` results into it — harmless today only because the real build never reaches these files (see the `tsconfig.json` item below), but a real fix, not just a lint nit.
- [ ] `ApiError`, `ApiOptions`, and most of `ApiService`'s methods lean on `any` for error/param shapes; `AlertDialogProps`/`SnackBarProps` even declare `state?: AlertDialogProps | any` (the `| any` makes the left side meaningless).
- [ ] `TeamMemberCard.tsx` has zero prop typing at all — the only component missing a `Props` interface.

## 🎨 Consistency issues

- [ ] Component suffixes: `dialogs/`, `snackBar/`, `tag/`, and one file in `modal/` use `.component.tsx`; everything in `card/`, `navbar/`, `section/`, and the other `modal/` file don't. `.page.tsx` is at least applied consistently. (The new `search/SearchBar.component.tsx` follows the `.component.tsx` convention.)
- [ ] Import style: absolute `src/...` alias and relative `../` imports are mixed within the same files (e.g. `movie.service.ts`/`tv.service.ts` import their detail models via relative paths like `'../models/movieDetails.model'`, while `AppContext.tsx`/`types.ts` import the same kind of model via the absolute `src/...` alias).
- [ ] Naming for "Tv": `TvShow`/`TvService` (services) vs `TVShowDetails` (models) — two casings for the same abbreviation.
- [ ] Three different type-suffix conventions coexist: `.model.ts`, inline types in `.service.ts`, and `.type.ts` (just for `RoutePaths`).
- [ ] `tsconfig.json` looks like a leftover full config that predates the `tsconfig.app.json`/`tsconfig.node.json` split — it has no `references` field tying the split together, which is the standard pattern once configs are split like that.

## Suggested priority

1. ~~Fix the `clearSession` bug~~ ✅ done
2. ~~Delete dead code~~ ✅ done (`global.utils.ts` intentionally kept — reserved for future constants)
3. ~~Extract shared TMDB base service~~ ✅ done (`TmdbListService`, `TMDB_CONFIG`, `common.model.ts`)
4. Tighten types: real `User` shape, discriminated `media_type` union for list responses, drop the `| any` unions
5. Consistency pass (suffixes, import style) — lowest urgency, biggest bikeshed risk