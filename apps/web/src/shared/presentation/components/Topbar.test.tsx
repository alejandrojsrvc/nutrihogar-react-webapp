import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { AppProviders } from '../../../app/providers/AppProviders';
import {
  createTestAuthGateway,
  createTestSyncCurrentUserUseCase,
} from '../../../test/renderRoute';
import { ActiveProfileProvider } from '../providers/ActiveProfileContext';
import { Topbar } from './Topbar';
import type { RouteHandle } from '../navigation/routeHandle';

function TestHeader() {
  return <h1>Header de prueba</h1>;
}

function renderTopbar(handle?: RouteHandle) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <Topbar
            householdName="Hogar"
            isSigningOut={false}
            onLogout={vi.fn()}
          />
        ),
        handle,
      },
    ],
    { initialEntries: ['/'] },
  );

  return render(
    <AppProviders
      authGateway={createTestAuthGateway({
        accessToken: 'test-token',
        userId: 'user-1',
      })}
      syncCurrentUser={createTestSyncCurrentUserUseCase()}
    >
      <ActiveProfileProvider profiles={[]}>
        <RouterProvider router={router} />
      </ActiveProfileProvider>
    </AppProviders>,
  );
}

describe('Topbar', () => {
  it('renders the page header declared in the route handle', () => {
    renderTopbar({ pageHeader: TestHeader });

    expect(
      screen.getByRole('heading', { name: 'Header de prueba' }),
    ).toBeInTheDocument();
  });

  it('renders no page header when the matched route has no handle', () => {
    renderTopbar();

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
