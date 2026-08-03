const dateFormatter = (timezone: string) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

export function todayInTimezone(timezone: string, now = new Date()): string {
  return dateFormatter(timezone).format(now);
}

export function canonicalWeekStart(date: string): string {
  const normalizedDate = normalizeDate(date);
  if (!normalizedDate) return '';
  const value = new Date(`${normalizedDate}T12:00:00Z`);
  const day = value.getUTCDay();
  value.setUTCDate(value.getUTCDate() - (day === 0 ? 6 : day - 1));
  return value.toISOString().slice(0, 10);
}

export function weekDates(weekStart: string): string[] {
  const canonical = canonicalWeekStart(weekStart);
  if (!canonical) return [];
  const start = new Date(`${canonical}T12:00:00Z`);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

export function formatDate(
  date: string,
  timezone: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const normalizedDate = normalizeDate(date);
  if (!normalizedDate) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es', {
    timeZone: timezone,
    day: 'numeric',
    month: 'short',
    ...options,
  }).format(new Date(`${normalizedDate}T12:00:00Z`));
}

export function isValidCalendarDate(value: unknown): value is string {
  return typeof value === 'string' && Boolean(normalizeDate(value));
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  if (!match) return null;
  const date = new Date(`${match[1]}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== match[1]
    ? null
    : match[1];
}
