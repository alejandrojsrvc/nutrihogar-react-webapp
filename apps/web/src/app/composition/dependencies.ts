import {
  createApiClient,
  type ApiClient,
} from '@nutrihogar/api-client';

import { createSupabaseAuthSessionGateway } from '../../shared/infrastructure/auth/SupabaseAuthSessionGateway';
import { UnavailableAuthSessionGateway } from '../../shared/infrastructure/auth/UnavailableAuthSessionGateway';
import { SyncCurrentUserUseCase } from '../../modules/auth/application/use-cases/SyncCurrentUserUseCase';
import { CheckHealthUseCase } from '../../shared/application/use-cases/CheckHealthUseCase';
import { HttpCurrentUserGateway } from '../../shared/infrastructure/http/HttpCurrentUserGateway';
import { HttpHealthGateway } from '../../shared/infrastructure/http/HttpHealthGateway';
import type { AuthSessionGateway } from '../../modules/auth/application/ports/AuthSessionGateway';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const authSessionGateway: AuthSessionGateway =
  supabaseUrl && supabasePublishableKey
    ? createSupabaseAuthSessionGateway({
        publishableKey: supabasePublishableKey,
        redirectTo: new URL('/onboarding', window.location.origin).toString(),
        url: supabaseUrl,
      })
    : new UnavailableAuthSessionGateway();

export const apiClient: ApiClient = createApiClient({
  baseUrl: apiBaseUrl,
  getAccessToken: async () =>
    (await authSessionGateway.getSession())?.accessToken,
});

const healthGateway = new HttpHealthGateway(apiClient);
const currentUserGateway = new HttpCurrentUserGateway(apiClient);

export const syncCurrentUserUseCase = new SyncCurrentUserUseCase(
  currentUserGateway,
);
export const checkHealthUseCase = new CheckHealthUseCase(healthGateway);
