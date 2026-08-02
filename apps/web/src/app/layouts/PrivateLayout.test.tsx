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

    expect(await screen.findByText('Area familiar')).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Navegacion principal' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Inicio' }).some((link) => link.getAttribute('href') === '/app')).toBe(true);
    expect(screen.getAllByRole('link', { name: 'Registrar comida' }).some((link) => link.getAttribute('href') === '/app/comidas/nueva')).toBe(true);
    expect(screen.getAllByRole('link', { name: 'Perfil' }).some((link) => link.getAttribute('href') === '/app/perfil')).toBe(true);
    expect(screen.getAllByRole('link', { name: 'Inventario' }).some((link) => link.getAttribute('href') === '/app/inventario')).toBe(true);
    expect(screen.getAllByRole('link', { name: 'Lista de compras' }).some((link) => link.getAttribute('href') === '/app/lista-de-compras')).toBe(true);
    expect(screen.getAllByRole('link', { name: 'Historial de compras' }).some((link) => link.getAttribute('href') === '/app/compras')).toBe(true);
  });

  it('exposes the complete navigation in the mobile drawer', async () => {
    const user = userEvent.setup();
    renderPrivateLayout();

    await user.click(screen.getByRole('button', { name: 'Abrir menú de navegación' }));

    const drawer = screen.getByRole('navigation', { name: 'Menú de navegación' });
    expect(within(drawer).getByRole('link', { name: 'Inventario' })).toHaveAttribute('href', '/app/inventario');
    expect(within(drawer).getByRole('link', { name: 'Sobrantes' })).toHaveAttribute('href', '/app/sobrantes');
    expect(within(drawer).getByRole('link', { name: 'Invitaciones' })).toHaveAttribute('href', '/app/invitaciones');

    await user.click(within(drawer).getByRole('link', { name: 'Inventario' }));
    expect(screen.queryByRole('navigation', { name: 'Menú de navegación' })).not.toBeInTheDocument();
  });

  it('uses the shopping list as the third mobile action', () => {
    renderPrivateLayout();

    const bottomBar = screen.getByRole('navigation', { name: 'Acciones principales' });
    expect(within(bottomBar).getByRole('link', { name: 'Lista' })).toHaveAttribute('href', '/app/lista-de-compras');
    expect(within(bottomBar).queryByRole('link', { name: 'Perfil' })).not.toBeInTheDocument();
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
        children: [
          { path: '/app', element: <p>Contenido privado</p> },
          { path: '/app/inventario', element: <p>Inventario</p> },
        ],
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
