const PREPARED_MEAL_SOURCES = new Set([
  'PREPARED',
  'PREPARED_BATCH',
  'PREPARED_PORTION',
  'PREPARATION',
]);

export function isPreparedMealSource(source: string | undefined): boolean {
  return source != null && PREPARED_MEAL_SOURCES.has(source.toUpperCase());
}
