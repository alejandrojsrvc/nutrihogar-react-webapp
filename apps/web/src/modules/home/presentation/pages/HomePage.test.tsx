import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  createTestAuthGateway,
  renderRoute,
} from '../../../../test/renderRoute';

describe('HomePage', () => {
  it('consumes the health endpoint through the application flow', async () => {
    renderRoute(
      '/app',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    expect(await screen.findByText('API disponible.')).toBeInTheDocument();
  });

  it('shows a readable message when the API is unavailable', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValueOnce(
      new TypeError('Failed to fetch'),
    );

    renderRoute(
      '/app',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    expect(
      await screen.findByText('No se pudo conectar con la API de NutriHogar.'),
    ).toBeInTheDocument();
  });
});
