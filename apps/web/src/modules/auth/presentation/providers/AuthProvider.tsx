import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import type {
  AuthSession,
  EmailCredentials,
} from '../../application/ports/AuthSessionGateway';
import type { CurrentUser } from '../../application/ports/CurrentUserGateway';
import {
  AuthContext,
  type AuthContextValue,
  type AuthProviderProps,
  type AuthStatus,
} from './AuthContext';

function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error('No se pudo completar la operacion de autenticacion.');
}

export function AuthProvider({
  authGateway,
  children,
  syncCurrentUserUseCase,
}: PropsWithChildren<AuthProviderProps>) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isCurrentUserLoading, setIsCurrentUserLoading] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = authGateway.onAuthStateChange((nextSession) => {
      if (!isMounted) {
        return;
      }

      setError(null);
      if (!nextSession) {
        setCurrentUser(null);
        setIsCurrentUserLoading(false);
      }
      setSession(nextSession);
      setStatus(nextSession ? 'authenticated' : 'unauthenticated');
    });

    void authGateway
      .getSession()
      .then((currentSession) => {
        if (!isMounted) {
          return;
        }

        setSession(currentSession);
        setStatus(currentSession ? 'authenticated' : 'unauthenticated');

        if (currentSession) {
          void syncCurrentUserUseCase
            .execute()
            .then((nextCurrentUser) => {
              if (isMounted) {
                setCurrentUser(nextCurrentUser);
              }
            })
            .catch((authError: unknown) => {
              if (isMounted) {
                setCurrentUser(null);
                setError(toError(authError));
              }
            })
            .finally(() => {
              if (isMounted) {
                setIsCurrentUserLoading(false);
              }
            });
        } else {
          setCurrentUser(null);
          setIsCurrentUserLoading(false);
        }
      })
      .catch((authError: unknown) => {
        if (!isMounted) {
          return;
        }

        setError(toError(authError));
        setCurrentUser(null);
        setIsCurrentUserLoading(false);
        setSession(null);
        setStatus('unauthenticated');
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [authGateway, syncCurrentUserUseCase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      error,
      isSigningIn,
      isSigningOut,
      isCurrentUserLoading,
      loginWithEmail: async (credentials: EmailCredentials) => {
        setError(null);
        setIsSigningIn(true);
        setIsCurrentUserLoading(true);

        try {
          await authGateway.loginWithEmail(credentials);
          const currentSession = await authGateway.getSession();

          if (!currentSession) {
            throw new Error('No se pudo recuperar la sesion iniciada.');
          }

          setSession(currentSession);
          setStatus('authenticated');
          setCurrentUser(await syncCurrentUserUseCase.execute());
          return true;
        } catch (authError: unknown) {
          setCurrentUser(null);
          setError(toError(authError));
          return false;
        } finally {
          setIsCurrentUserLoading(false);
          setIsSigningIn(false);
        }
      },
      registerWithEmail: async (input) => {
        setError(null);
        setIsSigningIn(true);
        setIsCurrentUserLoading(true);

        try {
          const result = await authGateway.registerWithEmail(input);

          if (result.requiresEmailConfirmation) {
            return result;
          }

          const currentSession = await authGateway.getSession();

          if (!currentSession) {
            throw new Error('No se pudo recuperar la sesion registrada.');
          }

          setSession(currentSession);
          setStatus('authenticated');
          setCurrentUser(await syncCurrentUserUseCase.execute());
          return result;
        } catch (authError: unknown) {
          setCurrentUser(null);
          setError(toError(authError));
          return null;
        } finally {
          setIsCurrentUserLoading(false);
          setIsSigningIn(false);
        }
      },
      logout: async () => {
        setError(null);
        setIsSigningOut(true);

        try {
          await authGateway.logout();
          setCurrentUser(null);
          setIsCurrentUserLoading(false);
          setSession(null);
          setStatus('unauthenticated');
          return true;
        } catch (authError: unknown) {
          setError(toError(authError));
          return false;
        } finally {
          setIsSigningOut(false);
        }
      },
      session,
      status,
    }),
    [
      authGateway,
      currentUser,
      error,
      isSigningIn,
      isSigningOut,
      isCurrentUserLoading,
      session,
      status,
      syncCurrentUserUseCase,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
