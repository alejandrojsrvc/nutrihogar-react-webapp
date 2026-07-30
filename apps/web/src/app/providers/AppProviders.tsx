import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type PropsWithChildren } from 'react';

import {
  authSessionGateway,
  syncCurrentUserUseCase,
} from '../composition/dependencies';
import type { AuthSessionGateway } from '../../modules/auth/application/ports/AuthSessionGateway';
import type { SyncCurrentUserUseCase } from '../../modules/auth/application/use-cases/SyncCurrentUserUseCase';
import { AuthProvider } from '../../modules/auth/presentation/providers/AuthProvider';

export function AppProviders({
  authGateway = authSessionGateway,
  children,
  syncCurrentUser = syncCurrentUserUseCase,
}: PropsWithChildren<{
  authGateway?: AuthSessionGateway;
  syncCurrentUser?: SyncCurrentUserUseCase;
}>) {
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
      <AuthProvider
        authGateway={authGateway}
        syncCurrentUserUseCase={syncCurrentUser}
      >
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}
