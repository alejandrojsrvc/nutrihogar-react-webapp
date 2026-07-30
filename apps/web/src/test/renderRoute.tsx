import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { AppProviders } from '../app/providers/AppProviders';
import { appRoutes } from '../app/router/appRoutes';
import type {
  AuthSession,
  AuthSessionGateway,
} from '../modules/auth/application/ports/AuthSessionGateway';
import type { CurrentUserGateway } from '../modules/auth/application/ports/CurrentUserGateway';
import { SyncCurrentUserUseCase } from '../modules/auth/application/use-cases/SyncCurrentUserUseCase';

export function createTestAuthGateway(
  session: AuthSession | null = null,
): AuthSessionGateway {
  return {
    getSession: async () => session,
    loginWithEmail: async () => undefined,
    registerWithEmail: async () => ({ requiresEmailConfirmation: false }),
    logout: async () => undefined,
    onAuthStateChange: () => () => undefined,
  };
}

export function createTestSyncCurrentUserUseCase(): SyncCurrentUserUseCase {
  const currentUserGateway: CurrentUserGateway = {
    getCurrentUser: async () => ({
      avatarUrl: null,
      displayName: 'Alejandro',
      email: 'adult@example.com',
      id: 'user-1',
      locale: 'es-AR',
      timezone: 'America/Argentina/Buenos_Aires',
    }),
  };

  return new SyncCurrentUserUseCase(currentUserGateway);
}

export function renderRoute(
  path: string,
  authGateway: AuthSessionGateway = createTestAuthGateway(),
  syncCurrentUser: SyncCurrentUserUseCase = createTestSyncCurrentUserUseCase(),
) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });

  return render(
    <AppProviders
      authGateway={authGateway}
      syncCurrentUser={syncCurrentUser}
    >
      <RouterProvider router={router} />
    </AppProviders>,
  );
}
