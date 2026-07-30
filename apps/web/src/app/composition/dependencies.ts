import {
  createApiClient,
  type ApiClient,
} from '@nutrihogar/api-client';

import { createSupabaseAuthSessionGateway } from '../../shared/infrastructure/auth/SupabaseAuthSessionGateway';
import { UnavailableAuthSessionGateway } from '../../shared/infrastructure/auth/UnavailableAuthSessionGateway';
import { SyncCurrentUserUseCase } from '../../modules/auth/application/use-cases/SyncCurrentUserUseCase';
import { CreateAdultProfileUseCase } from '../../modules/households/application/use-cases/CreateAdultProfileUseCase';
import { AcceptHouseholdInvitationUseCase } from '../../modules/households/application/use-cases/AcceptHouseholdInvitationUseCase';
import { CreateHouseholdInvitationUseCase } from '../../modules/households/application/use-cases/CreateHouseholdInvitationUseCase';
import { CreateHouseholdUseCase } from '../../modules/households/application/use-cases/CreateHouseholdUseCase';
import { ListHouseholdInvitationsUseCase } from '../../modules/households/application/use-cases/ListHouseholdInvitationsUseCase';
import { ListAdultProfilesUseCase } from '../../modules/households/application/use-cases/ListAdultProfilesUseCase';
import { ListHouseholdsUseCase } from '../../modules/households/application/use-cases/ListHouseholdsUseCase';
import { ResolveActiveHouseholdUseCase } from '../../modules/households/application/use-cases/ResolveActiveHouseholdUseCase';
import { SelectActiveHouseholdUseCase } from '../../modules/households/application/use-cases/SelectActiveHouseholdUseCase';
import { CheckHealthUseCase } from '../../shared/application/use-cases/CheckHealthUseCase';
import { HttpCurrentUserGateway } from '../../shared/infrastructure/http/HttpCurrentUserGateway';
import { HttpAdultProfileGateway } from '../../shared/infrastructure/http/HttpAdultProfileGateway';
import { HttpHealthGateway } from '../../shared/infrastructure/http/HttpHealthGateway';
import { HttpHouseholdGateway } from '../../shared/infrastructure/http/HttpHouseholdGateway';
import { HttpHouseholdInvitationGateway } from '../../shared/infrastructure/http/HttpHouseholdInvitationGateway';
import { LocalStorageActiveHouseholdGateway } from '../../shared/infrastructure/storage/LocalStorageActiveHouseholdGateway';
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
const adultProfileGateway = new HttpAdultProfileGateway(apiClient);
const householdGateway = new HttpHouseholdGateway(apiClient);
const householdInvitationGateway = new HttpHouseholdInvitationGateway(apiClient);
const activeHouseholdGateway = new LocalStorageActiveHouseholdGateway();

export const syncCurrentUserUseCase = new SyncCurrentUserUseCase(
  currentUserGateway,
);
export const checkHealthUseCase = new CheckHealthUseCase(healthGateway);
export const listHouseholdsUseCase = new ListHouseholdsUseCase(householdGateway);
export const createHouseholdUseCase = new CreateHouseholdUseCase(householdGateway);
export const listHouseholdInvitationsUseCase =
  new ListHouseholdInvitationsUseCase(householdInvitationGateway);
export const createHouseholdInvitationUseCase =
  new CreateHouseholdInvitationUseCase(householdInvitationGateway);
export const acceptHouseholdInvitationUseCase =
  new AcceptHouseholdInvitationUseCase(householdInvitationGateway);
export const listAdultProfilesUseCase = new ListAdultProfilesUseCase(
  adultProfileGateway,
);
export const createAdultProfileUseCase = new CreateAdultProfileUseCase(
  adultProfileGateway,
);
export const resolveActiveHouseholdUseCase = new ResolveActiveHouseholdUseCase(
  activeHouseholdGateway,
);
export const selectActiveHouseholdUseCase = new SelectActiveHouseholdUseCase(
  activeHouseholdGateway,
);
