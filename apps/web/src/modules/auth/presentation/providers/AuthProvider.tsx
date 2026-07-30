import {
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import type {
  AuthSession,
  EmailCredentials,
} from '../../application/ports/AuthSessionGateway';
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

        if (currentSession) {
          void syncCurrentUserUseCase.execute().catch((authError: unknown) => {
            if (isMounted) {
              setError(toError(authError));
            }
          });
        }
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
  }, [authGateway, syncCurrentUserUseCase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      error,
      isSigningIn,
      isSigningOut,
      loginWithEmail: async (credentials: EmailCredentials) => {
        setError(null);
        setIsSigningIn(true);

        try {
          await authGateway.loginWithEmail(credentials);
          const currentSession = await authGateway.getSession();

          if (!currentSession) {
            throw new Error('No se pudo recuperar la sesion iniciada.');
          }

          setSession(currentSession);
          setStatus('authenticated');
          await syncCurrentUserUseCase.execute();
          return true;
        } catch (authError: unknown) {
          setError(toError(authError));
          return false;
        } finally {
          setIsSigningIn(false);
        }
      },
      registerWithEmail: async (input) => {
        setError(null);
        setIsSigningIn(true);

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
          await syncCurrentUserUseCase.execute();
          return result;
        } catch (authError: unknown) {
          setError(toError(authError));
          return null;
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
    [
      authGateway,
      error,
      isSigningIn,
      isSigningOut,
      session,
      status,
      syncCurrentUserUseCase,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
