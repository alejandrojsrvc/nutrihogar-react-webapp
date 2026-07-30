import { createContext } from 'react';

import type {
  EmailCredentials,
  AuthSession,
  AuthSessionGateway,
  RegisterWithEmailInput,
  RegisterWithEmailResult,
} from '../../application/ports/AuthSessionGateway';
import type { SyncCurrentUserUseCase } from '../../application/use-cases/SyncCurrentUserUseCase';

export type AuthStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated';

export interface AuthContextValue {
  error: Error | null;
  isSigningIn: boolean;
  isSigningOut: boolean;
  loginWithEmail: (credentials: EmailCredentials) => Promise<boolean>;
  registerWithEmail: (
    input: RegisterWithEmailInput,
  ) => Promise<RegisterWithEmailResult | null>;
  logout: () => Promise<boolean>;
  session: AuthSession | null;
  status: AuthStatus;
}

export interface AuthProviderProps {
  authGateway: AuthSessionGateway;
  syncCurrentUserUseCase: SyncCurrentUserUseCase;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
