import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { AuthSessionGateway } from '../../application/ports/AuthSessionGateway';
import { renderRoute } from '../../../../test/renderRoute';

describe('LoginPage', () => {
  it('starts the Google OAuth flow', async () => {
    const user = userEvent.setup();
    const loginWithGoogle = vi.fn(async () => undefined);
    const authGateway: AuthSessionGateway = {
      getSession: async () => null,
      loginWithGoogle,
      logout: async () => undefined,
      onAuthStateChange: () => () => undefined,
    };

    renderRoute('/login', authGateway);

    expect(
      await screen.findByRole('heading', { name: 'Bienvenido a NutriHogar' }),
    ).toBeInTheDocument();
    await user.click(
      await screen.findByRole('button', { name: 'Continuar con Google' }),
    );

    expect(loginWithGoogle).toHaveBeenCalledOnce();
  });
});
