import createClient, { type Client } from 'openapi-fetch';

import type { paths } from './generated/schema';

export type AccessTokenProvider = () =>
  string | null | undefined | Promise<string | null | undefined>;
export type UnauthorizedHandler = (
  request: Request,
) => Promise<Response | undefined>;

export interface ApiClientOptions {
  baseUrl: string;
  getAccessToken?: AccessTokenProvider;
  onUnauthorized?: UnauthorizedHandler;
  fetch?: typeof globalThis.fetch;
}

export type ApiClient = Client<paths>;

export function createApiClient({
  baseUrl,
  getAccessToken,
  onUnauthorized,
  fetch: fetchImplementation,
}: ApiClientOptions): ApiClient {
  const runtimeFetch: typeof globalThis.fetch = (...args) =>
    globalThis.fetch(...args);

  const client = createClient<paths>({
    baseUrl,
    fetch: fetchImplementation ?? runtimeFetch,
  });
  const retryableRequests = new WeakMap<Request, Request>();

  client.use({
    async onRequest({ request }) {
      const token = await getAccessToken?.();

      if (token) {
        request.headers.set('Authorization', `Bearer ${token}`);
      }

      retryableRequests.set(request, request.clone());

      return request;
    },
    async onResponse({ request, response }) {
      if (response.status !== 401 || !onUnauthorized) {
        return response;
      }

      return (
        (await onUnauthorized(
          retryableRequests.get(request)?.clone() ?? request.clone(),
        )) ?? response
      );
    },
  });

  return client;
}
