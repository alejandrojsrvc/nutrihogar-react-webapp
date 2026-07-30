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
    | ((event: AuthChangeEvent, session: Session | null) => void)
    | undefined;
  const signInWithOAuth = vi.fn(async () => ({ error: null }));
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
    auth: { getSession, onAuthStateChange, signInWithOAuth, signOut },
  } as unknown as SupabaseClient;

  return {
    authStateListener: () => authStateListener?.('SIGNED_IN', createSession()),
    client: supabase,
    getSession,
    onAuthStateChange,
    signInWithOAuth,
    signOut,
    unsubscribe,
  };
}

describe('SupabaseAuthSessionGateway', () => {
  it('maps the Supabase session and starts Google OAuth', async () => {
    const fake = createSupabaseClient();
    const gateway = new SupabaseAuthSessionGateway(
      fake.client,
      'http://localhost:5173/app',
    );

    await gateway.loginWithGoogle();

    expect(fake.signInWithOAuth).toHaveBeenCalledWith({
      options: { redirectTo: 'http://localhost:5173/app' },
      provider: 'google',
    });
    await expect(gateway.getSession()).resolves.toEqual({
      accessToken: 'access-token',
      userId: 'user-1',
    });
  });

  it('forwards auth changes and logs out only the local session', async () => {
    const fake = createSupabaseClient();
    const listener = vi.fn();
    const gateway = new SupabaseAuthSessionGateway(
      fake.client,
      'http://localhost:5173/app',
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
