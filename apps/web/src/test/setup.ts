import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { afterEach, beforeEach, vi } from 'vitest';

beforeEach(() => {
  globalThis.localStorage?.clear();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = input instanceof Request ? input.url : String(input);
      const body = url.endsWith('/api/households')
        ? [
            {
              currency: 'ARS',
              id: 'household-1',
              name: 'Hogar Sojo',
              timezone: 'America/Argentina/Buenos_Aires',
            },
          ]
        : url.includes('/adult-profiles')
          ? [
              {
                id: 'profile-1',
                name: 'Alejandro',
                userId: 'user-1',
                householdId: 'household-1',
              },
            ]
        : {
            status: 'ok',
            timestamp: '2026-07-29T17:00:00.000Z',
          };

      return new Response(JSON.stringify(body), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }),
  );
});

afterEach(() => {
  cleanup();
  globalThis.localStorage?.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
