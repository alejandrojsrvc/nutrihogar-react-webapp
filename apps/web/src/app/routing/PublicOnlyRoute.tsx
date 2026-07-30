import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuth } from '../../modules/auth/presentation/providers/useAuth';
import { AuthLoadingPage } from '../../modules/auth/presentation/pages/AuthLoadingPage';

export function PublicOnlyRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <AuthLoadingPage />;
  }

  if (status === 'authenticated') {
    return (
      <Navigate
        replace
        to={location.pathname === '/register' ? '/onboarding' : '/app'}
      />
    );
  }

  return <Outlet />;
}
