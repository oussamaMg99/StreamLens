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
 * Hides UI for features that are built but not finished, so half-working controls stay
 * out of the way without their code being deleted. Flip to false to reveal them.
 *
 * Currently hides: the hero carousel's "watch" button on Home, and the About links in
 * the navbar and footer (the /about route itself stays reachable). Note they share one flag, so revealing one
 * reveals them all; split into per-feature flags (see *_AUTH_ENABLED above) if that
 * bites — "not ready to show" and "not built yet" won't always lift together.
 */
export const hideFeature = true;
