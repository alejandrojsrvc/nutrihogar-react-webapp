import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { AuthSessionGateway } from '../../modules/auth/application/ports/AuthSessionGateway';
import { createTestAuthGateway, renderRoute } from '../../test/renderRoute';

describe('PrivateLayout', () => {
  it('renders the private application layout', async () => {
    renderRoute(
      '/app',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    expect(await screen.findByText('Area familiar')).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Navegacion principal' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Tu hogar empieza aqui' }),
    ).toBeInTheDocument();
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
