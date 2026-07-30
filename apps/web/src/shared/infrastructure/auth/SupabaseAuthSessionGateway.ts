import {
  createClient,
  type Session,
  type SupabaseClient,
} from '@supabase/supabase-js';

import type {
  EmailCredentials,
  AuthSession,
  AuthSessionGateway,
  AuthStateListener,
  RegisterWithEmailInput,
  RegisterWithEmailResult,
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

  async loginWithEmail({ email, password }: EmailCredentials): Promise<void> {
    const { error } = await this.supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });

    if (error) {
      throw error;
    }
  }

  async registerWithEmail({
    email,
    fullName,
    password,
  }: RegisterWithEmailInput): Promise<RegisterWithEmailResult> {
    const { data, error } = await this.supabase.auth.signUp({
      email: normalizeEmail(email),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          locale: getBrowserLocale(),
          timezone: getBrowserTimezone(),
        },
        emailRedirectTo: this.redirectTo,
      },
    });

    if (error) {
      throw error;
    }

    return {
      requiresEmailConfirmation: !data.session,
    };
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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getBrowserLocale(): string {
  return typeof navigator !== 'undefined' && navigator.language
    ? navigator.language
    : 'es-AR';
}

function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
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
