// Locale-aware date helpers for the Watching rhythm components.

/** Intl locale tag for the UI language, with Latin digits like the rest of the app. */
export const localeTag = (language: string) => `${language}-u-nu-latn`;

/** A formatter that reads day keys as calendar days (UTC), so no time zone shifts them. */
export const dayFormat = (language: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(localeTag(language), { ...options, timeZone: 'UTC' });

/** 'YYYY-MM-DD' (+ optional day offset) → a Date at UTC midnight. */
export const parseDay = (key: string, offsetDays = 0) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + offsetDays));
};

/** A Monday used to name weekdays: index 0 = Monday … 6 = Sunday. */
const REFERENCE_MONDAY = '2026-10-12';
export const weekdayName = (language: string, index: number, style: 'short' | 'long') =>
  dayFormat(language, { weekday: style }).format(parseDay(REFERENCE_MONDAY, index));
