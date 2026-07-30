import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { AppProviders } from '../app/providers/AppProviders';
import { appRoutes } from '../app/router/appRoutes';

export function renderRoute(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });

  return render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
}
