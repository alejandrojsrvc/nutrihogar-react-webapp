import type {
  AuthChangeEvent,
  Session,
  SupabaseClient,
} from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

import { SupabaseAuthSessionGateway } from './SupabaseAuthSessionGateway';

function createSession(): Session {
  return {
    access_token: 'access-token',
    expires_at: 1_900_000_000,
    expires_in: 3_600,
    refresh_token: 'refresh-token',
    token_type: 'bearer',
    user: {
      app_metadata: {},
      aud: 'authenticated',
      created_at: '2026-07-30T00:00:00.000Z',
      id: 'user-1',
      identities: [],
      user_metadata: {},
    },
  };
}

function createSupabaseClient() {
  let authStateListener:
    ((event: AuthChangeEvent, session: Session | null) => void) | undefined;
  const signInWithPassword = vi.fn(async () => ({ error: null }));
  const signUp = vi.fn(async () => ({
    data: { session: null, user: null },
    error: null,
  }));
  const getSession = vi.fn(async () => ({
    data: { session: createSession() },
    error: null,
  }));
  const signOut = vi.fn(async () => ({ error: null }));
  const unsubscribe = vi.fn();
  const onAuthStateChange = vi.fn((listener: typeof authStateListener) => {
    authStateListener = listener;

    return { data: { subscription: { unsubscribe } } };
  });
  const supabase = {
    auth: {
      getSession,
      onAuthStateChange,
      signInWithPassword,
      signOut,
      signUp,
    },
  } as unknown as SupabaseClient;

  return {
    authStateListener: () => authStateListener?.('SIGNED_IN', createSession()),
    client: supabase,
    getSession,
    onAuthStateChange,
    signInWithPassword,
    signOut,
    signUp,
    unsubscribe,
  };
}

describe('SupabaseAuthSessionGateway', () => {
  it('normalizes credentials and starts email login', async () => {
    const fake = createSupabaseClient();
    const gateway = new SupabaseAuthSessionGateway(
      fake.client,
      'http://localhost:5173/onboarding',
    );

    await gateway.loginWithEmail({
      email: '  ADULT@EXAMPLE.COM ',
      password: 'secret-password',
    });

    expect(fake.signInWithPassword).toHaveBeenCalledWith({
      email: 'adult@example.com',
      password: 'secret-password',
    });
    await expect(gateway.getSession()).resolves.toEqual({
      accessToken: 'access-token',
      userId: 'user-1',
    });
  });

  it('registers with metadata and reports email confirmation', async () => {
    const fake = createSupabaseClient();
    const gateway = new SupabaseAuthSessionGateway(
      fake.client,
      'http://localhost:5173/onboarding',
    );

    await expect(
      gateway.registerWithEmail({
        email: '  ADULT@EXAMPLE.COM ',
        fullName: '  Alejandro Sojo ',
        password: 'secret-password',
      }),
    ).resolves.toEqual({ requiresEmailConfirmation: true });

    expect(fake.signUp).toHaveBeenCalledWith({
      email: 'adult@example.com',
      password: 'secret-password',
      options: {
        data: {
          full_name: 'Alejandro Sojo',
          locale: expect.any(String),
          timezone: expect.any(String),
        },
        emailRedirectTo: 'http://localhost:5173/onboarding',
      },
    });
  });

  it('forwards auth changes and logs out only the local session', async () => {
    const fake = createSupabaseClient();
    const listener = vi.fn();
    const gateway = new SupabaseAuthSessionGateway(
      fake.client,
      'http://localhost:5173/onboarding',
    );

    const unsubscribe = gateway.onAuthStateChange(listener);
    fake.authStateListener();
    await gateway.logout();
    unsubscribe();

    expect(listener).toHaveBeenCalledWith({
      accessToken: 'access-token',
      userId: 'user-1',
    });
    expect(fake.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(fake.unsubscribe).toHaveBeenCalledOnce();
  });
});
