import createClient, { type Client } from 'openapi-fetch';

import type { paths } from './generated/schema';

export type AccessTokenProvider = () =>
  string | null | undefined | Promise<string | null | undefined>;

export interface ApiClientOptions {
  baseUrl: string;
  getAccessToken?: AccessTokenProvider;
  fetch?: typeof globalThis.fetch;
}

export type ApiClient = Client<paths>;

export function createApiClient({
  baseUrl,
  getAccessToken,
  fetch: fetchImplementation,
}: ApiClientOptions): ApiClient {
  const runtimeFetch: typeof globalThis.fetch = (...args) =>
    globalThis.fetch(...args);

  const client = createClient<paths>({
    baseUrl,
    fetch: fetchImplementation ?? runtimeFetch,
  });

  client.use({
    async onRequest({ request }) {
      const token = await getAccessToken?.();

      if (token) {
        request.headers.set('Authorization', `Bearer ${token}`);
      }

      return request;
    },
  });

  return client;
}
