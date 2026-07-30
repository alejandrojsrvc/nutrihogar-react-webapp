import { createContext } from 'react';

import type {
  AuthSession,
  AuthSessionGateway,
} from '../../application/ports/AuthSessionGateway';

export type AuthStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated';

export interface AuthContextValue {
  error: Error | null;
  isSigningIn: boolean;
  isSigningOut: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<boolean>;
  session: AuthSession | null;
  status: AuthStatus;
}

export interface AuthProviderProps {
  authGateway: AuthSessionGateway;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
