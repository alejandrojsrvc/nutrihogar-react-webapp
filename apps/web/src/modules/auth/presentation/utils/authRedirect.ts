export function getAuthRedirectPath(
  state: unknown,
  fallback = '/app',
): string {
  if (
    typeof state === 'object' &&
    state !== null &&
    'from' in state &&
    typeof state.from === 'string' &&
    state.from.startsWith('/')
  ) {
    return state.from;
  }

  return fallback;
}
