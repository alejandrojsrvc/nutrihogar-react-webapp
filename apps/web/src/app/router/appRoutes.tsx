import { Navigate, type RouteObject } from 'react-router';

import { PrivateLayout } from '../layouts/PrivateLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { PublicOnlyRoute } from '../routing/PublicOnlyRoute';
import { RequireAuth } from '../routing/RequireAuth';
import { HomePage } from '../../modules/home/presentation/pages/HomePage';
import { LoginPage } from '../../modules/auth/presentation/pages/LoginPage';
import { RegisterPage } from '../../modules/auth/presentation/pages/RegisterPage';
import { ReviewEmailPage } from '../../modules/auth/presentation/pages/ReviewEmailPage';
import { OnboardingPage } from '../../modules/onboarding/presentation/pages/OnboardingPage';
import { AcceptHouseholdInvitationPage } from '../../modules/households/presentation/pages/AcceptHouseholdInvitationPage';
import { AdultProfilePage } from '../../modules/households/presentation/pages/AdultProfilePage';
import { HouseholdInvitationsPage } from '../../modules/households/presentation/pages/HouseholdInvitationsPage';
import { FoodCatalogPage } from '../../modules/food-catalog/presentation/pages/FoodCatalogPage';
import { FoodDetailPage } from '../../modules/food-catalog/presentation/pages/FoodDetailPage';
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
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          {
            path: '/auth/revisa-tu-correo',
            element: <ReviewEmailPage />,
          },
        ],
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
          { path: '/app/perfil', element: <AdultProfilePage /> },
          { path: '/app/alimentos', element: <FoodCatalogPage /> },
          { path: '/app/alimentos/:foodId', element: <FoodDetailPage /> },
          { path: '/app/invitaciones', element: <HouseholdInvitationsPage /> },
          { path: '/app', element: <HomePage /> },
          {
            path: '/invitaciones/:token',
            element: <AcceptHouseholdInvitationPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
