export interface AuthSession {
  userId: string;
  accessToken: string;
}

export type AuthStateListener = (session: AuthSession | null) => void;

export interface AuthSessionGateway {
  loginWithGoogle(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  onAuthStateChange(listener: AuthStateListener): () => void;
  logout(): Promise<void>;
}
