import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { AppProviders } from '../providers/AppProviders';
import { PrivateLayout } from './PrivateLayout';
import type { AuthSessionGateway } from '../../modules/auth/application/ports/AuthSessionGateway';
import {
  createTestAuthGateway,
  createTestSyncCurrentUserUseCase,
  renderRoute,
} from '../../test/renderRoute';

describe('PrivateLayout', () => {
  it('renders the private application layout', async () => {
    renderPrivateLayout();

    expect(await screen.findByText('Area familiar')).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Navegacion principal' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Inicio' }).some((link) => link.getAttribute('href') === '/app')).toBe(true);
    expect(screen.getAllByRole('link', { name: 'Registrar comida' }).some((link) => link.getAttribute('href') === '/app/comidas/nueva')).toBe(true);
    expect(screen.getAllByRole('link', { name: 'Perfil' }).some((link) => link.getAttribute('href') === '/app/perfil')).toBe(true);
  });

  it('logs out and returns to the public login page', async () => {
    const user = userEvent.setup();
    renderRoute(
      '/app',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    await user.click(
      await screen.findByRole('button', { name: 'Cerrar sesion' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Bienvenido a NutriHogar' }),
    ).toBeInTheDocument();
  });

  it('redirects an unauthenticated visitor to login', async () => {
    renderRoute('/app');

    expect(
      await screen.findByRole('heading', { name: 'Bienvenido a NutriHogar' }),
    ).toBeInTheDocument();
  });

  it('shows the loading screen while restoring the session', () => {
    const authGateway: AuthSessionGateway = {
      getSession: () => new Promise(() => undefined),
      loginWithEmail: async () => undefined,
      logout: async () => undefined,
      onAuthStateChange: () => () => undefined,
      registerWithEmail: async () => ({
        requiresEmailConfirmation: false,
      }),
    };

    renderRoute('/app', authGateway);

    expect(
      screen.getByRole('heading', { name: 'Estamos preparando tu espacio' }),
    ).toBeInTheDocument();
  });
});

function renderPrivateLayout() {
  const router = createMemoryRouter(
    [
      {
        element: <PrivateLayout />,
        children: [{ path: '/app', element: <p>Contenido privado</p> }],
      },
    ],
    { initialEntries: ['/app'] },
  );

  return render(
    <AppProviders
      authGateway={createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' })}
      syncCurrentUser={createTestSyncCurrentUserUseCase()}
    >
      <RouterProvider router={router} />
    </AppProviders>,
  );
}
