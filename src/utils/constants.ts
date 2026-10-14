export const navbarHeight = '4rem';

/**
 * Each language is labelled in its own language (endonym) and deliberately not
 * translated: someone stuck in a UI language they can't read must still be able to
 * find their own in the switcher.
 */
export const languageOptions = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ar', label: 'العربية' },
];

/** Env flags are strings; only the literal 'true' enables. Unset means off. */
const envFlag = (value: string | undefined) => value === 'true';

/**
 * Social sign-in providers shown in the auth modal, toggled per environment via
 * VITE_AUTH_*_ENABLED in .env / .env.local. Each must also be enabled in the Firebase
 * console, or its tile fails on click with auth/operation-not-allowed. Apple
 * additionally needs a paid Apple Developer account and a Services ID.
 */
export const GOOGLE_AUTH_ENABLED = envFlag(import.meta.env.VITE_AUTH_GOOGLE_ENABLED);
export const FACEBOOK_AUTH_ENABLED = envFlag(import.meta.env.VITE_AUTH_FACEBOOK_ENABLED);
export const APPLE_AUTH_ENABLED = envFlag(import.meta.env.VITE_AUTH_APPLE_ENABLED);

/**
 * VITE_DEBUG_MODE: error snackbars show the raw error behind the generic "An error
 * occurred" (see debugErrorText). Inlined at build time — keep it off for deploys.
 */
export const DEBUG_MODE = envFlag(import.meta.env.VITE_DEBUG_MODE);

/**
 * Hides UI for features that are built but not finished, so half-working controls stay
 * out of the way without their code being deleted. Flip to false to reveal them.
 *
 * Currently hides: the hero carousel's "watch" button on Home, and the About links in
 * the navbar and footer (the /about route itself stays reachable). Note they share one flag, so revealing one
 * reveals them all; split into per-feature flags (see *_AUTH_ENABLED above) if that
 * bites — "not ready to show" and "not built yet" won't always lift together.
 */
export const hideFeature = true;

/**
 * TMDB keyword ids for titles centred on gay and lesbian relationships: the most-used
 * keywords, by how many titles carry them. Not applied anywhere yet; kept for excluding
 * such titles from discover-based sections such as "Picked for you", via TMDB discover's
 * without_keywords (pipe-joined = "none of these"). TMDB keywords are community-tagged,
 * so an untagged title still gets through. Look ids up with /search/keyword?query=…;
 * /keyword/{id} returns the name.
 */
export const EXCLUDED_KEYWORD_IDS = [
  158718, // lgbt
  258533, // gay theme
  250606, // queer
  264386, // lesbian
  9833, // lesbian relationship
  240305, // gay romance
  163037, // lgbt teen
  10180, // male homosexuality
  265777, // gay relationship
  275157, // homosexuality
  363345, // gay
  15136, // female homosexuality
  272617, // homosexual
  319872, // lesbian romance
  15130, // gay marriage
  324058, // gay couple
  315382, // lesbian couple
];
