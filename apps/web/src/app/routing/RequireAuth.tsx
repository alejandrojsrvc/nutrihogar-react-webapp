import { Navigate, Outlet } from 'react-router';

import { useAuth } from '../../modules/auth/presentation/providers/useAuth';
import { AuthLoadingPage } from '../../modules/auth/presentation/pages/AuthLoadingPage';

export function RequireAuth() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <AuthLoadingPage />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
