import { describe, expect, it } from 'vitest';
import { WatchListEntry } from 'src/core/models/watchList.model';
import { buildRhythm, dailyCountsFromEntries, dailyTitlesFromEntries, longestStreak, trackingSince } from './rhythm.utils';

// 2026-10-14 is a Wednesday; its week starts Monday 2026-10-12.
const TODAY = '2026-10-14';

describe('trackingSince', () => {
  it('is the earliest day with a count, undefined when empty', () => {
    expect(trackingSince({ '2026-10-03': 1, '2026-09-30': 2, '2026-09-01': 0 })).toBe('2026-09-30');
    expect(trackingSince({})).toBeUndefined();
  });
});

describe('longestStreak', () => {
  it('finds the longest run of consecutive active days, across month ends', () => {
    const days = { '2026-09-29': 1, '2026-09-30': 1, '2026-10-01': 2, '2026-10-05': 1, '2026-10-06': 1 };
    expect(longestStreak(days)).toEqual({ length: 3, from: '2026-09-29', to: '2026-10-01' });
    expect(longestStreak({})).toEqual({ length: 0 });
  });
});

describe('buildRhythm', () => {
  const days = {
    '2026-09-30': 2, // Wed, tracking starts
    '2026-10-03': 1, // Sat
    '2026-10-04': 3, // Sun
    '2026-10-05': 1, // Mon
    '2026-10-11': 4, // Sun
    '2026-10-13': 1, // Tue
    '2026-10-14': 2, // Wed (today)
  };

  it('ends with the current week and counts only tracked, non-future days', () => {
    const rhythm = buildRhythm(days, TODAY, 4);
    expect(rhythm.weeks.map(week => week.start)).toEqual(['2026-09-21', '2026-09-28', '2026-10-05', '2026-10-12']);
    expect(rhythm.weeks.map(week => [week.activeDays, week.trackedDays])).toEqual([
      [0, 0], // before tracking
      [3, 5], // Wed–Sun tracked
      [2, 7],
      [2, 3], // Mon–Wed so far
    ]);
    expect(rhythm.activeDays).toBe(7);
  });

  it('averages full weeks only, and picks the busiest weekday (ties: later)', () => {
    const rhythm = buildRhythm(days, TODAY, 4);
    expect(rhythm.averagePerWeek).toBe(2);
    // Mon 1, Tue 1, Wed 2, Thu 0, Fri 0, Sat 1, Sun 2 → Wed and Sun tie, Sun wins.
    expect(rhythm.weekdays).toEqual([1, 1, 2, 0, 0, 1, 2]);
    expect(rhythm.topWeekday).toBe(6);
  });

  it('marks the first week of each month', () => {
    const rhythm = buildRhythm(days, TODAY, 4);
    expect(rhythm.weeks.map(week => week.monthStart)).toEqual([false, true, false, false]);
    // 2025-12-01 is a Monday: its own week holds the 1st.
    expect(buildRhythm({}, '2025-12-03', 2).weeks.map(week => [week.start, week.monthStart])).toEqual([
      ['2025-11-24', false],
      ['2025-12-01', true],
    ]);
  });
});

describe('longestStreak boundaries', () => {
  it('runs across a year end and a leap day', () => {
    expect(longestStreak({ '2026-12-30': 1, '2026-12-31': 1, '2027-01-01': 1 })).toEqual({
      length: 3,
      from: '2026-12-30',
      to: '2027-01-01',
    });
    expect(longestStreak({ '2028-02-28': 1, '2028-02-29': 1, '2028-03-01': 1 })).toMatchObject({ length: 3 });
    // No Feb 29 in 2027: the 28th and March 1st are consecutive.
    expect(longestStreak({ '2027-02-28': 1, '2027-03-01': 1 })).toMatchObject({ length: 2 });
  });
});

describe('dailyCountsFromEntries', () => {
  // Built from local date parts, so the local day is the same in any time zone.
  const at = (day: number, hour = 20) => new Date(2026, 9, day, hour).getTime();
  const NOW = new Date(2026, 9, 14, 22);

  it('counts a watched movie once on its day, and ignores unwatched or undated movies', () => {
    const entries: WatchListEntry[] = [
      { media_type: 'movie', id: 1, watched: true, watched_at: at(12) },
      { media_type: 'movie', id: 2, watched: false, watched_at: at(12) },
      { media_type: 'movie', id: 3, watched: true },
    ];
    expect(dailyCountsFromEntries(entries, NOW)).toEqual({ '2026-10-12': 1 });
  });

  it('counts a show once per day however many episodes were marked, plus other titles that day', () => {
    const entries: WatchListEntry[] = [
      { media_type: 'tv', id: 1, watched: { 1: [1, 2, 3] }, watched_at: { '1:1': at(12, 20), '1:2': at(12, 21), '1:3': at(13) } },
      { media_type: 'movie', id: 2, watched: true, watched_at: at(12) },
      { media_type: 'tv', id: 3, watched: { 1: [1] } }, // marked before watched_at existed
    ];
    expect(dailyCountsFromEntries(entries, NOW)).toEqual({ '2026-10-12': 2, '2026-10-13': 1 });
  });

  it('counts dates after now as today (device clock ahead when writing)', () => {
    const entries: WatchListEntry[] = [{ media_type: 'movie', id: 1, watched: true, watched_at: at(20) }];
    expect(dailyCountsFromEntries(entries, NOW)).toEqual({ '2026-10-14': 1 });
  });

  it('is empty when nothing is dated, so the section hides', () => {
    const counts = dailyCountsFromEntries([{ media_type: 'movie', id: 1, watched: true }], NOW);
    expect(counts).toEqual({});
    expect(trackingSince(counts)).toBeUndefined();
  });
});

describe('titles per week', () => {
  const at = (day: number, hour = 20) => new Date(2026, 9, day, hour).getTime();
  const NOW = new Date(2026, 9, 14, 22); // Wednesday; the week starts Monday the 12th

  it('lists each title once per day, keyed by watchListEntryId', () => {
    const entries: WatchListEntry[] = [
      { media_type: 'tv', id: 1, watched: { 1: [1, 2] }, watched_at: { '1:1': at(12), '1:2': at(12, 21) } },
      { media_type: 'movie', id: 1, watched: true, watched_at: at(12) }, // same id, other type: a different title
    ];
    expect(dailyTitlesFromEntries(entries, NOW)).toEqual({ '2026-10-12': ['tv_1', 'movie_1'] });
  });

  it('counts distinct titles in a week: a show marked on two days counts once', () => {
    const entries: WatchListEntry[] = [
      { media_type: 'tv', id: 1, watched: { 1: [1, 2] }, watched_at: { '1:1': at(12), '1:2': at(13) } },
      { media_type: 'movie', id: 2, watched: true, watched_at: at(13) },
      { media_type: 'movie', id: 3, watched: true, watched_at: at(6) }, // the previous week
    ];
    const titles = dailyTitlesFromEntries(entries, NOW);
    const rhythm = buildRhythm(dailyCountsFromEntries(entries, NOW), '2026-10-14', 2, titles);
    expect(rhythm.weeks.map(week => [week.start, week.activeDays, week.titles])).toEqual([
      ['2026-10-05', 1, 1],
      ['2026-10-12', 2, 2],
    ]);
  });
});
