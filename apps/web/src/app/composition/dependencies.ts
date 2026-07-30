import {
  createApiClient,
  type ApiClient,
} from '@nutrihogar/api-client';

import { createSupabaseAuthSessionGateway } from '../../shared/infrastructure/auth/SupabaseAuthSessionGateway';
import { UnavailableAuthSessionGateway } from '../../shared/infrastructure/auth/UnavailableAuthSessionGateway';
import { CheckHealthUseCase } from '../../shared/application/use-cases/CheckHealthUseCase';
import { HttpHealthGateway } from '../../shared/infrastructure/http/HttpHealthGateway';
import type { AuthSessionGateway } from '../../modules/auth/application/ports/AuthSessionGateway';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const authSessionGateway: AuthSessionGateway =
  supabaseUrl && supabasePublishableKey
    ? createSupabaseAuthSessionGateway({
        publishableKey: supabasePublishableKey,
        redirectTo: new URL('/app', window.location.origin).toString(),
        url: supabaseUrl,
      })
    : new UnavailableAuthSessionGateway();

export const apiClient: ApiClient = createApiClient({
  baseUrl: apiBaseUrl,
  getAccessToken: async () =>
    (await authSessionGateway.getSession())?.accessToken,
});

const healthGateway = new HttpHealthGateway(apiClient);

export const checkHealthUseCase = new CheckHealthUseCase(healthGateway);
