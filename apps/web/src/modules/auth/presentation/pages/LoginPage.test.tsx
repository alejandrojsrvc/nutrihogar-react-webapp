import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderRoute } from '../../../../test/renderRoute';

describe('LoginPage', () => {
  it('renders the provisional login page and navigates to onboarding', async () => {
    const user = userEvent.setup();

    renderRoute('/login');

    expect(
      screen.getByRole('heading', { name: 'Bienvenido a NutriHogar' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Continuar' }));

    expect(
      screen.getByRole('heading', { name: 'Preparemos tu hogar' }),
    ).toBeInTheDocument();
  });
});
