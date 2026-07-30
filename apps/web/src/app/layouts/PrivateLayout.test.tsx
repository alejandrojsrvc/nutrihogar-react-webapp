import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderRoute } from '../../test/renderRoute';

describe('PrivateLayout', () => {
  it('renders the private application layout', () => {
    renderRoute('/app');

    expect(screen.getByText('Area familiar')).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Navegacion principal' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Tu hogar empieza aqui' }),
    ).toBeInTheDocument();
  });
});
