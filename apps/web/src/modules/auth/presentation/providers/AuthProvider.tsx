import {
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import type { AuthSession } from '../../application/ports/AuthSessionGateway';
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
}: PropsWithChildren<AuthProviderProps>) {
  const [error, setError] = useState<Error | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = authGateway.onAuthStateChange((nextSession) => {
      if (!isMounted) {
        return;
      }

      setError(null);
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
      })
      .catch((authError: unknown) => {
        if (!isMounted) {
          return;
        }

        setError(toError(authError));
        setSession(null);
        setStatus('unauthenticated');
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [authGateway]);

  const value = useMemo<AuthContextValue>(
    () => ({
      error,
      isSigningIn,
      isSigningOut,
      loginWithGoogle: async () => {
        setError(null);
        setIsSigningIn(true);

        try {
          await authGateway.loginWithGoogle();
        } catch (authError: unknown) {
          setError(toError(authError));
        } finally {
          setIsSigningIn(false);
        }
      },
      logout: async () => {
        setError(null);
        setIsSigningOut(true);

        try {
          await authGateway.logout();
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
    [authGateway, error, isSigningIn, isSigningOut, session, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
