import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type {
  AuthSession,
  AuthSessionGateway,
} from '../../application/ports/AuthSessionGateway';
import { SyncCurrentUserUseCase } from '../../application/use-cases/SyncCurrentUserUseCase';
import { renderRoute } from '../../../../test/renderRoute';

describe('LoginPage', () => {
  it('submits email and password', async () => {
    const user = userEvent.setup();
    let session: AuthSession | null = null;
    const loginWithEmail = vi.fn(async () => {
      session = { accessToken: 'test-token', userId: 'user-1' };
    });
    const getCurrentUser = vi.fn(async () => ({
      avatarUrl: null,
      displayName: 'Alejandro',
      email: 'adult@example.com',
      id: 'user-1',
      locale: 'es-AR',
      timezone: 'America/Argentina/Buenos_Aires',
    }));
    const authGateway: AuthSessionGateway = {
      getSession: async () => session,
      loginWithEmail,
      logout: async () => undefined,
      registerWithEmail: async () => ({
        requiresEmailConfirmation: false,
      }),
    };

    renderRoute(
      '/login',
      authGateway,
      new SyncCurrentUserUseCase({ getCurrentUser }),
    );

    await user.type(
      await screen.findByLabelText('Correo electrónico'),
      'adult@example.com',
    );
    await user.type(
      await screen.findByLabelText('Contraseña'),
      'secret-password',
    );
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(loginWithEmail).toHaveBeenCalledWith({
      email: 'adult@example.com',
      password: 'secret-password',
    });
    expect(getCurrentUser).toHaveBeenCalledOnce();
    expect(
      await screen.findByRole('heading', { name: 'Configura tu perfil' }),
    ).toBeInTheDocument();
  });
});
