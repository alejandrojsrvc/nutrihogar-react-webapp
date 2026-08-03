import { render, screen, within } from '@testing-library/react';
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

    expect(await screen.findByText('Hoy')).toBeInTheDocument();
    expect(
      screen.getByRole('complementary', { name: 'Navegación principal' }),
    ).toBeInTheDocument();
    expect(
      screen
        .getAllByRole('link', { name: 'Hoy' })
        .some((link) => link.getAttribute('href') === '/app'),
    ).toBe(true);
    expect(
      screen
        .getAllByRole('link', { name: 'Planificar' })
        .some((link) => link.getAttribute('href') === '/app/plan-semanal'),
    ).toBe(true);
    expect(
      screen
        .getAllByRole('link', { name: 'Inventario' })
        .some((link) => link.getAttribute('href') === '/app/inventario'),
    ).toBe(true);
    expect(
      screen
        .getAllByRole('link', { name: 'Progreso' })
        .some((link) => link.getAttribute('href') === '/app/resumen'),
    ).toBe(true);
  });

  it('opens the small profile menu instead of a second module navigation', async () => {
    const user = userEvent.setup();
    renderPrivateLayout();

    await user.click(screen.getAllByText('Mi perfil')[0]);

    expect(
      screen.getByRole('link', { name: 'Configuración del hogar' }),
    ).toHaveAttribute('href', '/app/familia');
    expect(
      screen.getByRole('link', { name: 'Preferencias personales' }),
    ).toHaveAttribute('href', '/app/perfil');
    expect(
      screen.getByRole('button', { name: /Notificaciones/ }),
    ).toBeDisabled();
  });

  it('exposes the four primary destinations on mobile', () => {
    renderPrivateLayout();

    const bottomBar = screen.getByRole('navigation', {
      name: 'Secciones principales',
    });
    expect(
      within(bottomBar).getByRole('link', { name: 'Hoy' }),
    ).toHaveAttribute('href', '/app');
    expect(
      within(bottomBar).getByRole('link', { name: 'Planificar' }),
    ).toHaveAttribute('href', '/app/plan-semanal');
    expect(
      within(bottomBar).getByRole('link', { name: 'Hogar' }),
    ).toHaveAttribute('href', '/app/inventario');
    expect(
      within(bottomBar).getByRole('link', { name: 'Progreso' }),
    ).toHaveAttribute('href', '/app/resumen');
  });

  it('shows connectivity changes briefly without a persistent layout strip', async () => {
    renderPrivateLayout();

    window.dispatchEvent(new Event('offline'));
    expect(
      await screen.findByText(
        'Sin conexión. Los cambios compatibles quedarán pendientes.',
      ),
    ).toBeInTheDocument();

    window.dispatchEvent(new Event('online'));
    expect(
      await screen.findByText('Conexión restablecida.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Conectado')).not.toBeInTheDocument();
  });

  it('logs out and returns to the public login page', async () => {
    const user = userEvent.setup();
    renderRoute(
      '/app',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    await user.click(
      await screen.findByRole('button', { name: 'Cerrar sesión' }),
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
      authGateway={createTestAuthGateway({
        accessToken: 'test-token',
        userId: 'user-1',
      })}
      syncCurrentUser={createTestSyncCurrentUserUseCase()}
    >
      <RouterProvider router={router} />
    </AppProviders>,
  );
}
