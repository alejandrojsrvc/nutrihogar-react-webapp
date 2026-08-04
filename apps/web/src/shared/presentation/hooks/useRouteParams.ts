import { useMatches } from 'react-router';
import type { Params } from 'react-router';

export function useRouteParams(): Params {
  const matches = useMatches();
  const last = matches[matches.length - 1];
  return last ? last.params : {};
}
