import '@firebase-oss/ui-styles/dist.min.css';
import { alpha } from '@mui/material';
import colors from './colors';

/**
 * FirebaseUI is styled entirely through CSS custom properties (--fui-*), so mapping the
 * app palette onto them is all it takes to make its auth screens match the rest of
 * StreamLens. Values come from colors.ts rather than a hand-maintained copy of the
 * palette in a .css file.
 *
 * These MUST be applied at :root (see GlobalStyles in SignIn.page.tsx), not scoped to a
 * wrapper element. FirebaseUI doesn't read --fui-* at the point of use — it declares one
 * indirection on :root itself:
 *
 *     :root, :host { --color-primary: var(--fui-primary); ... }
 *
 * and its components then read var(--color-primary). Custom properties are substituted
 * where they're *declared*, not where they're used, so --color-primary is resolved
 * against :root's --fui-primary. Setting --fui-primary on a descendant wrapper would
 * therefore change nothing: descendants just inherit the already-computed
 * --color-primary.
 *
 * Overriding at :root does work despite the library declaring its own defaults there,
 * because FirebaseUI's defaults live inside `@layer theme`, and unlayered styles — which
 * is what emotion/GlobalStyles generates — beat layered ones regardless of specificity
 * or import order.
 */
export const firebaseUiVars: Record<string, string> = {
  // Buttons and links.
  '--fui-primary': colors.primary.main,
  '--fui-primary-hover': colors.primary.dark,
  // Text sitting *on* the primary button.
  '--fui-primary-surface': colors.primary.contrastText,

  '--fui-text': colors.text.primary,
  '--fui-text-muted': colors.text.secondary,

  // Card surface: the same translucent dark panel used for menus and the season/episode
  // lists, so it reads as part of the app over the global background gradient.
  '--fui-background': colors.phantomBlack,
  '--fui-border': alpha(colors.text.primary, 0.12),
  // Input outlines echo the amber-bordered SearchBar rather than a neutral grey.
  '--fui-input': alpha(colors.primary.main, 0.5),
  '--fui-error': colors.error.main,
  // Provider icons (Google, GitHub, …) need to read against the dark card.
  '--fui-provider-icon-color': colors.text.primary,

  // Matches the 10px radius the MUI theme sets for buttons, papers and dialogs.
  '--fui-radius': '10px',
  '--fui-radius-card': '10px',
};
