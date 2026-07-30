import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { createTestAuthGateway, renderRoute } from '../../test/renderRoute';

const authenticatedSession = {
  accessToken: 'test-token',
  userId: 'user-1',
};

describe('route guards', () => {
  it('redirects an authenticated visitor from login to the app', async () => {
    renderRoute('/login', createTestAuthGateway(authenticatedSession));

    expect(
      await screen.findByRole('heading', { name: 'Tu hogar empieza aqui' }),
    ).toBeInTheDocument();
  });

  it('redirects an authenticated visitor from register to onboarding', async () => {
    renderRoute('/register', createTestAuthGateway(authenticatedSession));

    expect(
      await screen.findByRole('heading', { name: 'Crea tu hogar' }),
    ).toBeInTheDocument();
  });

  it('redirects an unauthenticated visitor from onboarding to login', async () => {
    renderRoute('/onboarding');

    expect(
      await screen.findByRole('heading', { name: 'Bienvenido a NutriHogar' }),
    ).toBeInTheDocument();
  });
});
