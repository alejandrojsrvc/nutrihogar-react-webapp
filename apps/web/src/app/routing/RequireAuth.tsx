import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuth } from '../../modules/auth/presentation/providers/useAuth';
import { AuthLoadingPage } from '../../modules/auth/presentation/pages/AuthLoadingPage';

export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <AuthLoadingPage />;
  }

  if (status === 'unauthenticated') {
    return (
      <Navigate
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
        to="/login"
      />
    );
  }

  return <Outlet />;
}
