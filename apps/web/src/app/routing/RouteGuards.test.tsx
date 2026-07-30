import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createTestAuthGateway, renderRoute } from '../../test/renderRoute';

const authenticatedSession = {
  accessToken: 'test-token',
  userId: 'user-1',
};

describe('route guards', () => {
  it('redirects an authenticated visitor from login to the next onboarding step', async () => {
    renderRoute('/login', createTestAuthGateway(authenticatedSession));

    expect(
      await screen.findByRole(
        'heading',
        { name: 'Configura tu perfil' },
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();
  });

  it('redirects an authenticated visitor from register to the next onboarding step', async () => {
    renderRoute('/register', createTestAuthGateway(authenticatedSession));

    expect(
      await screen.findByRole('heading', { name: 'Configura tu perfil' }),
    ).toBeInTheDocument();
  });

  it('redirects an unauthenticated visitor from onboarding to login', async () => {
    renderRoute('/onboarding');

    expect(
      await screen.findByRole('heading', { name: 'Bienvenido a NutriHogar' }),
    ).toBeInTheDocument();
  });
});
