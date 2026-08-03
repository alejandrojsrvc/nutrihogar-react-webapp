import { describe, expect, it } from 'vitest';
import { canonicalWeekStart, isValidCalendarDate, weekDates } from './week';

describe('week utilities', () => {
  it('canonicalizes every date to Monday without changing the date-only timezone', () => {
    expect(canonicalWeekStart('2026-08-05')).toBe('2026-08-03');
    expect(canonicalWeekStart('2026-08-09')).toBe('2026-08-03');
  });

  it('returns the seven Monday-to-Sunday date-only values', () => {
    expect(weekDates('2026-08-03')).toEqual([
      '2026-08-03',
      '2026-08-04',
      '2026-08-05',
      '2026-08-06',
      '2026-08-07',
      '2026-08-08',
      '2026-08-09',
    ]);
  });

  it('rejects invalid dates without throwing', () => {
    expect(isValidCalendarDate('not-a-date')).toBe(false);
    expect(canonicalWeekStart('not-a-date')).toBe('');
    expect(weekDates('not-a-date')).toEqual([]);
  });
});
