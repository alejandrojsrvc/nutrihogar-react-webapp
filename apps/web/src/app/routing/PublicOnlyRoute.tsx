import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuth } from '../../modules/auth/presentation/providers/useAuth';
import { AuthLoadingPage } from '../../modules/auth/presentation/pages/AuthLoadingPage';
import { getAuthRedirectPath } from '../../modules/auth/presentation/utils/authRedirect';

export function PublicOnlyRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <AuthLoadingPage />;
  }

  if (status === 'authenticated') {
    const defaultDestination =
      location.pathname === '/register' ? '/onboarding' : '/app';

    return (
      <Navigate
        replace
        to={getAuthRedirectPath(location.state, defaultDestination)}
      />
    );
  }

  return <Outlet />;
}
