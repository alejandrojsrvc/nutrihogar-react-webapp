import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { AppProviders } from '../app/providers/AppProviders';
import { appRoutes } from '../app/router/appRoutes';
import type {
  AuthSession,
  AuthSessionGateway,
} from '../modules/auth/application/ports/AuthSessionGateway';

export function createTestAuthGateway(
  session: AuthSession | null = null,
): AuthSessionGateway {
  return {
    getSession: async () => session,
    loginWithGoogle: async () => undefined,
    logout: async () => undefined,
    onAuthStateChange: () => () => undefined,
  };
}

export function renderRoute(
  path: string,
  authGateway: AuthSessionGateway = createTestAuthGateway(),
) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });

  return render(
    <AppProviders authGateway={authGateway}>
      <RouterProvider router={router} />
    </AppProviders>,
  );
}
