import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type PropsWithChildren } from 'react';

import { authSessionGateway } from '../composition/dependencies';
import type { AuthSessionGateway } from '../../modules/auth/application/ports/AuthSessionGateway';
import { AuthProvider } from '../../modules/auth/presentation/providers/AuthProvider';

export function AppProviders({
  authGateway = authSessionGateway,
  children,
}: PropsWithChildren<{ authGateway?: AuthSessionGateway }>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider authGateway={authGateway}>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
