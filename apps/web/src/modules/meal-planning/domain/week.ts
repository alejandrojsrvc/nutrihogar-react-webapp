const dateFormatter = (timezone: string) => new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' });

export function todayInTimezone(timezone: string, now = new Date()): string {
  return dateFormatter(timezone).format(now);
}

export function canonicalWeekStart(date: string): string {
  const value = new Date(`${date}T12:00:00Z`);
  const day = value.getUTCDay();
  value.setUTCDate(value.getUTCDate() - (day === 0 ? 6 : day - 1));
  return value.toISOString().slice(0, 10);
}

export function weekDates(weekStart: string): string[] {
  const start = new Date(`${canonicalWeekStart(weekStart)}T12:00:00Z`);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

export function formatDate(date: string, timezone: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('es', { timeZone: timezone, day: 'numeric', month: 'short', ...options }).format(new Date(`${date}T12:00:00Z`));
}
