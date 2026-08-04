import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderRoute } from '../../../test/renderRoute';

describe('NotFoundPage', () => {
  it('renders for an unknown route', () => {
    renderRoute('/esta-ruta-no-existe');

    expect(
      screen.getByRole('heading', { name: 'Esta página no está en la mesa' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Volver al inicio' }),
    ).toHaveAttribute('href', '/');
  });
});
