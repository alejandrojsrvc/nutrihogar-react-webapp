import { Outlet } from 'react-router';

import { useAuth } from '../../modules/auth/presentation/providers/useAuth';
import { AuthLoadingPage } from '../../modules/auth/presentation/pages/AuthLoadingPage';

export function PublicOnlyRoute() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <AuthLoadingPage />;
  }

  return <Outlet />;
}
