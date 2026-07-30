import {
  createClient,
  type Session,
  type SupabaseClient,
} from '@supabase/supabase-js';

import type {
  AuthSession,
  AuthSessionGateway,
  AuthStateListener,
} from '../../../modules/auth/application/ports/AuthSessionGateway';

type SupabaseAuthClient = Pick<SupabaseClient, 'auth'>;

function mapSession(session: Session | null): AuthSession | null {
  if (!session?.user.id) {
    return null;
  }

  return {
    accessToken: session.access_token,
    userId: session.user.id,
  };
}

export class SupabaseAuthSessionGateway implements AuthSessionGateway {
  constructor(
    private readonly supabase: SupabaseAuthClient,
    private readonly redirectTo: string,
  ) {}

  async loginWithGoogle(): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: this.redirectTo },
    });

    if (error) {
      throw error;
    }
  }

  async getSession(): Promise<AuthSession | null> {
    const { data, error } = await this.supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return mapSession(data.session);
  }

  onAuthStateChange(listener: AuthStateListener): () => void {
    const {
      data: { subscription },
    } = this.supabase.auth.onAuthStateChange((_event, session) => {
      listener(mapSession(session));
    });

    return () => subscription.unsubscribe();
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut({ scope: 'local' });

    if (error) {
      throw error;
    }
  }
}

export function createSupabaseAuthSessionGateway({
  publishableKey,
  redirectTo,
  url,
}: {
  publishableKey: string;
  redirectTo: string;
  url: string;
}): AuthSessionGateway {
  return new SupabaseAuthSessionGateway(
    createClient(url, publishableKey),
    redirectTo,
  );
}
