import type {
  AuthSession,
  AuthSessionGateway,
} from '../../../modules/auth/application/ports/AuthSessionGateway';

const configurationMessage =
  'Supabase Auth no esta configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY.';

export class UnavailableAuthSessionGateway implements AuthSessionGateway {
  async loginWithGoogle(): Promise<void> {
    throw new Error(configurationMessage);
  }

  async getSession(): Promise<AuthSession | null> {
    return null;
  }

  onAuthStateChange(): () => void {
    return () => undefined;
  }

  async logout(): Promise<void> {
    return undefined;
  }
}
