// src/utils/rhythm.utils.ts
// Pure "Watching rhythm" maths: per-day counts → active days per week, a weekday profile and
// the longest streak. Free of React and Firebase so it's unit-tested directly
// (rhythm.utils.test.ts). Dates are local calendar days as 'YYYY-MM-DD' strings.

import { WatchListEntry } from 'src/core/models/watchList.model';
import { watchListEntryId } from './watchListMeta.utils';

/** Distinct titles marked watched on each local day, e.g. { '2026-10-14': 3 }. */
export type DailyCounts = Record<string, number>;

/** Which titles (watchListEntryId) were marked on each local day, e.g. { '2026-10-14': ['movie_1', 'tv_2'] }. */
export type DailyTitles = Record<string, string[]>;

export interface RhythmWeek {
  /** Monday of this week, 'YYYY-MM-DD'. */
  start: string;
  /** Days in this week with at least one title marked. 0–7. */
  activeDays: number;
  /** Days of this week that are tracked: not in the future, not before tracking started. 0–7. */
  trackedDays: number;
  /** Distinct titles marked during this week: a show marked on two days counts once. */
  titles: number;
  /** True for the first week of a calendar month (shown as a month label). */
  monthStart: boolean;
}

export interface RhythmSummary {
  /** Oldest first, ending with the current week. */
  weeks: RhythmWeek[];
  /** Active days per weekday over the visible weeks, Monday first. */
  weekdays: number[];
  /** Index into `weekdays` of the busiest day (ties: the later weekday). -1 when there's no activity. */
  topWeekday: number;
  /** Average active days per fully tracked week, 1 decimal. Undefined until one full week is tracked. */
  averagePerWeek?: number;
  /** Over ALL tracked days, not just the visible weeks. */
  longestStreak: { length: number; from?: string; to?: string };
  /** Active days within the visible weeks. */
  activeDays: number;
}

const DAY_MS = 86_400_000;

/** 'YYYY-MM-DD' ⇄ a UTC day number, so day arithmetic ignores DST and time zones. */
const toDayNumber = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / DAY_MS);
};
const toKey = (dayNumber: number) => new Date(dayNumber * DAY_MS).toISOString().slice(0, 10);
/** 0 = Monday … 6 = Sunday. */
const weekdayOf = (dayNumber: number) => (new Date(dayNumber * DAY_MS).getUTCDay() + 6) % 7;

/** A Date → its LOCAL calendar day as 'YYYY-MM-DD' (what the write path should store). */
export const localDayKey = (date: Date = new Date()) => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/**
 * The adapter: the one place that knows where watch dates are stored. A watched movie's
 * watched_at and each value of a show's watched_at map (one per episode) become local
 * days; a title is listed once per day, however many of its episodes were marked that day.
 *
 * Timestamps after `now` (a device clock that was ahead when writing) count as today, so
 * nothing lands past the end of the chart or stretches a streak into the future.
 */
export const dailyTitlesFromEntries = (entries: WatchListEntry[], now: Date = new Date()): DailyTitles => {
  const titles: DailyTitles = {};
  const nowMs = now.getTime();
  const dayOf = (ms: number) => localDayKey(new Date(Math.min(ms, nowMs)));
  for (const entry of entries) {
    for (const day of new Set(watchTimes(entry).map(dayOf))) {
      titles[day] = [...(titles[day] ?? []), watchListEntryId(entry)];
    }
  }
  return titles;
};

/** Every watch date stored on an entry: a watched movie's watched_at, or one per marked episode. */
const watchTimes = (entry: WatchListEntry): number[] => {
  if (entry.media_type === 'tv') return Object.values(entry.watched_at ?? {});
  return entry.watched && entry.watched_at !== undefined ? [entry.watched_at] : [];
};

/** Distinct titles per day: the counts the rest of this module works from. */
export const dailyCountsFromTitles = (titles: DailyTitles): DailyCounts =>
  Object.fromEntries(Object.entries(titles).map(([day, keys]) => [day, keys.length]));

/** dailyTitlesFromEntries, reduced to counts. */
export const dailyCountsFromEntries = (entries: WatchListEntry[], now: Date = new Date()): DailyCounts =>
  dailyCountsFromTitles(dailyTitlesFromEntries(entries, now));

/** The earliest day with a count, or undefined when nothing is dated yet (hide the section). */
export const trackingSince = (days: DailyCounts): string | undefined =>
  Object.keys(days)
    .filter(key => days[key] > 0)
    .sort()[0];

export const longestStreak = (days: DailyCounts): RhythmSummary['longestStreak'] => {
  const active = Object.keys(days)
    .filter(key => days[key] > 0)
    .map(toDayNumber)
    .sort((a, b) => a - b);
  let best = { length: 0, from: undefined as number | undefined, to: undefined as number | undefined };
  let run = 0;
  let from = 0;
  active.forEach((day, index) => {
    run = index > 0 && day === active[index - 1] + 1 ? run + 1 : 1;
    if (run === 1) from = day;
    if (run > best.length) best = { length: run, from, to: day };
  });
  return best.length ? { length: best.length, from: toKey(best.from!), to: toKey(best.to!) } : { length: 0 };
};

/**
 * Everything the section shows, for the `weeks` most recent weeks (Monday start) ending
 * with the week that contains `today`. `titlesByDay` (from dailyTitlesFromEntries) gives
 * each week's distinct title count; without it, weeks report 0 titles.
 */
export const buildRhythm = (days: DailyCounts, today: string, weeks: number, titlesByDay: DailyTitles = {}): RhythmSummary => {
  const todayNumber = toDayNumber(today);
  const sinceKey = trackingSince(days);
  const since = sinceKey ? toDayNumber(sinceKey) : todayNumber + 1;
  const firstMonday = todayNumber - weekdayOf(todayNumber) - (weeks - 1) * 7;

  const weekdays = [0, 0, 0, 0, 0, 0, 0];
  let fullWeeks = 0;
  let fullWeekActive = 0;
  let activeDays = 0;

  const list: RhythmWeek[] = Array.from({ length: weeks }, (_, w) => {
    const monday = firstMonday + w * 7;
    let active = 0;
    let tracked = 0;
    const titles = new Set<string>();
    for (let r = 0; r < 7; r++) {
      const day = monday + r;
      if (day > todayNumber || day < since) continue;
      tracked++;
      titlesByDay[toKey(day)]?.forEach(key => titles.add(key));
      if ((days[toKey(day)] ?? 0) > 0) {
        active++;
        weekdays[r]++;
      }
    }
    if (tracked === 7) {
      fullWeeks++;
      fullWeekActive += active;
    }
    activeDays += active;
    // The week that holds the 1st is the one whose Sunday is in a different month from the
    // previous week's Sunday (comparing Mondays would label the week after it).
    const month = new Date((monday + 6) * DAY_MS).getUTCMonth();
    const prevMonth = new Date((monday - 1) * DAY_MS).getUTCMonth();
    return { start: toKey(monday), activeDays: active, trackedDays: tracked, titles: titles.size, monthStart: month !== prevMonth };
  });

  const max = Math.max(...weekdays);
  return {
    weeks: list,
    weekdays,
    topWeekday: max > 0 ? weekdays.lastIndexOf(max) : -1,
    averagePerWeek: fullWeeks ? Math.round((fullWeekActive / fullWeeks) * 10) / 10 : undefined,
    longestStreak: longestStreak(days),
    activeDays,
  };
};
