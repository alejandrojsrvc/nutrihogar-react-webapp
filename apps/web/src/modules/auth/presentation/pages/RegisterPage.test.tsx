import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { AuthSessionGateway } from '../../application/ports/AuthSessionGateway';
import { renderRoute } from '../../../../test/renderRoute';

describe('RegisterPage', () => {
  it('registers and asks the user to confirm the email', async () => {
    const user = userEvent.setup();
    const registerWithEmail = vi.fn(async () => ({
      requiresEmailConfirmation: true,
    }));
    const authGateway: AuthSessionGateway = {
      getSession: async () => null,
      loginWithEmail: async () => undefined,
      logout: async () => undefined,
      registerWithEmail,
    };

    renderRoute('/register', authGateway);

    await user.type(
      await screen.findByLabelText('Nombre completo'),
      'Alejandro Sojo',
    );
    await user.type(
      await screen.findByLabelText('Correo electrónico'),
      'adult@example.com',
    );
    await user.type(
      await screen.findByLabelText('Contraseña'),
      'secret-password',
    );
    await user.type(
      await screen.findByLabelText('Repite la contraseña'),
      'secret-password',
    );
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(registerWithEmail).toHaveBeenCalledWith({
      email: 'adult@example.com',
      fullName: 'Alejandro Sojo',
      password: 'secret-password',
    });
    expect(
      await screen.findByRole('heading', { name: 'Revisa tu correo' }),
    ).toBeInTheDocument();
  });

  it('shows validation when passwords do not match', async () => {
    const user = userEvent.setup();

    renderRoute('/register');

    await user.type(
      await screen.findByLabelText('Nombre completo'),
      'Alejandro Sojo',
    );
    await user.type(
      await screen.findByLabelText('Correo electrónico'),
      'adult@example.com',
    );
    await user.type(
      await screen.findByLabelText('Contraseña'),
      'secret-password',
    );
    await user.type(
      await screen.findByLabelText('Repite la contraseña'),
      'different-password',
    );
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(
      await screen.findByText('Las contrasenas no coinciden.'),
    ).toBeInTheDocument();
  });

  it('goes to onboarding when email confirmation is not required', async () => {
    const user = userEvent.setup();
    let session: { accessToken: string; userId: string } | null = null;
    const authGateway: AuthSessionGateway = {
      getSession: async () => session,
      loginWithEmail: async () => undefined,
      logout: async () => undefined,
      registerWithEmail: async () => {
        session = { accessToken: 'test-token', userId: 'user-1' };
        return { requiresEmailConfirmation: false };
      },
    };

    renderRoute('/register', authGateway);

    await user.type(
      await screen.findByLabelText('Nombre completo'),
      'Alejandro Sojo',
    );
    await user.type(
      await screen.findByLabelText('Correo electrónico'),
      'adult@example.com',
    );
    await user.type(
      await screen.findByLabelText('Contraseña'),
      'secret-password',
    );
    await user.type(
      await screen.findByLabelText('Repite la contraseña'),
      'secret-password',
    );
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(
      await screen.findByRole('heading', { name: 'Configura tu perfil' }),
    ).toBeInTheDocument();
  });
});
