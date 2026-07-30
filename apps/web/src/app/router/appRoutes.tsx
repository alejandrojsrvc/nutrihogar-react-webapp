import { Navigate, type RouteObject } from 'react-router';

import { PrivateLayout } from '../layouts/PrivateLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { PublicOnlyRoute } from '../routing/PublicOnlyRoute';
import { RequireAuth } from '../routing/RequireAuth';
import { HomePage } from '../../modules/home/presentation/pages/HomePage';
import { LoginPage } from '../../modules/auth/presentation/pages/LoginPage';
import { OnboardingPage } from '../../modules/onboarding/presentation/pages/OnboardingPage';
import { NotFoundPage } from '../../shared/presentation/pages/NotFoundPage';

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <PublicLayout />,
        children: [{ path: '/login', element: <LoginPage /> }],
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <PrivateLayout />,
        children: [
          { path: '/onboarding', element: <OnboardingPage /> },
          { path: '/app', element: <HomePage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
