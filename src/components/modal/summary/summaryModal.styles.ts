/** Height of the compact title bar that appears once the mobile header scrolls away. */
export const MOBILE_BAR_HEIGHT = 56;

/** scrollTop (px) after which the header is considered gone: backdrop 210 − overlap + title. */
export const SCROLLED_THRESHOLD = 240;

/** Solid sheet colour behind the sticky tabs, so content doesn't show through them. */
export const MOBILE_SHEET_BG = '#2A1A0C';

/** Bottom action bar on the mobile Overview tab. */
export const MOBILE_ACTIONS_BG = '#1F140C';

export const TMDB_IMG = 'https://image.tmdb.org/t/p';

/** Hides the scrollbar on rows that scroll sideways (genres, season chips) while keeping them scrollable. */
export const hiddenScrollbarSx = {
  overflowX: 'auto',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
} as const;
