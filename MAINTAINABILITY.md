# Maintainability & Readability Report

This report was generated from a full sweep of `src/` (UI layer + services/hooks/models/config) to identify what's hurting maintainability and readability. It's meant to be worked through over multiple sessions — check items off as they're addressed, and feel free to append new findings here as they come up.

## 🐛 Actual bugs (not just style)

- [x] **`clearSession` doesn't clear the session.** `AppReducer.ts`'s `CLEAR_SESSION` case called `localStorage.clear()` only, but `_themeMode` was read/written via `localStorage` while `_user` was read from `sessionStorage` at init but written to `localStorage` on every `SET_USER` — an inconsistent mix, so `sessionStorage` was never actually cleared. The reducer also returned a shape (`popularMovies`, `popularTVShows`) that didn't match `AppContextState` at all. **Fixed**: storage is now split by intent — `_themeMode` (a UI preference) consistently uses `localStorage`, `_user` (destined to hold auth state once login is implemented) consistently uses `sessionStorage` so it doesn't outlive the tab, and `CLEAR_SESSION` clears both stores and returns a properly-shaped state.
- [ ] **Hardcoded default search term.** `Navbar.tsx` — `useState('star wars')` as the initial search value. Looks like leftover test/demo data shipping to production.
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

## 🧬 Duplication that should be factored out

- [x] `movie.service.ts` and `tv.service.ts` are structurally identical (same 5-method shape, same discover-filter logic, same singleton bootstrap) with only names swapped. **Fixed**: extracted an abstract `TmdbListService<TItem, TDetails>` base (`src/core/services/tmdbList.service.ts`) holding the shared discover-filter detection, `with_genres` joining, and param-building logic. `MovieService`/`TvService` are now thin subclasses that just set `mediaType` and delegate; all public method names/signatures (`getMovies`, `getPopularMovie`, etc.) are unchanged, so no consumer had to change. Also dropped `GetTvOptions.timezone`, a dead field that was declared but never read anywhere.
- [x] Model duplication: `Genre`, `ProductionCompany`, `ProductionCountry`, `SpokenLanguage` were declared byte-for-byte in both `movieDetails.model.ts` and `tvShowDetails.model.ts`. **Fixed**: moved to `src/core/models/common.model.ts`, imported by both.
- [ ] Three separate "poster card" implementations (`PopularCard`, and two local `MediaCard`s inside `Home.page.tsx`/`Home1.page.tsx`) doing the same job with different markup. (`PopularCard`/`Home1.page.tsx` were deleted as dead code in item 2; the remaining `MediaCard` in `Home.page.tsx` is now the only implementation — nothing left to deduplicate here.)
- [x] The TMDB base URL / Bearer `tokenProvider` / `timeout: 15_000` boilerplate was copy-pasted across movie/tv/search services (plus the unused `tmdbApi`, removed in item 2). **Fixed**: consolidated into one `TMDB_CONFIG` object in `src/core/services/tmdb.config.ts`, used by all three singletons. The `{ page, results, total_pages, total_results }` response envelope was also deduplicated into a shared `TmdbListResponse<TItem>` type, reused by `MovieListResponse`, `TvListResponse`, and `SearchAllResponse`.
- [ ] Same hero gradient string (`colors.phantomBlack.replace('0.6','1')` + hardcoded stops) duplicated verbatim in `Home.page.tsx` and `SummaryModal.tsx`.

## 🔓 Type safety holes

- [ ] `User` is `export interface User {}` — an empty interface, equivalent to `any`; `AppContextState.user` has no real type checking.
- [ ] `AppReducer(state: any, action: any)` — no discriminated union for actions despite `AppContextType` being well-typed.
- [ ] `MovieListResponse`/`TvListResponse` type `results` as `(TvShow & Movie)[]` — an intersection that's structurally impossible for a real response to satisfy (a movie result can't have `TvShow`'s required `name`). Should be a `media_type`-discriminated union instead — the field already exists on both base types but is never used to discriminate.
- [ ] `ApiError`, `ApiOptions`, and most of `ApiService`'s methods lean on `any` for error/param shapes; `AlertDialogProps`/`SnackBarProps` even declare `state?: AlertDialogProps | any` (the `| any` makes the left side meaningless).
- [ ] `TeamMemberCard.tsx` has zero prop typing at all — the only component missing a `Props` interface.

## 🎨 Consistency issues

- [ ] Component suffixes: `dialogs/`, `snackBar/`, `tag/`, and one file in `modal/` use `.component.tsx`; everything in `card/`, `navbar/`, `section/`, and the other `modal/` file don't. `.page.tsx` is at least applied consistently.
- [ ] Import style: absolute `src/...` alias and relative `../` imports are mixed within the same files (e.g. `useSearchAll.ts` uses relative, `usePopularMovies.ts` uses absolute for the same kind of import).
- [ ] Naming for "Tv": `TvShow`/`TvService` (services) vs `TVShowDetails` (models) — two casings for the same abbreviation.
- [ ] Three different type-suffix conventions coexist: `.model.ts`, inline types in `.service.ts`, and `.type.ts` (just for `RoutePaths`).
- [ ] `tsconfig.json` looks like a leftover full config that predates the `tsconfig.app.json`/`tsconfig.node.json` split — it has no `references` field tying the split together, which is the standard pattern once configs are split like that.

## Suggested priority

1. ~~Fix the `clearSession` bug~~ ✅ done
2. ~~Delete dead code~~ ✅ done (`global.utils.ts` intentionally kept — reserved for future constants)
3. ~~Extract shared TMDB base service~~ ✅ done (`TmdbListService`, `TMDB_CONFIG`, `common.model.ts`)
4. Tighten types: real `User` shape, discriminated `media_type` union for list responses, drop the `| any` unions
5. Consistency pass (suffixes, import style) — lowest urgency, biggest bikeshed risk
