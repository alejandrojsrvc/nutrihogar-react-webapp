import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LoadingState } from './AsyncState';

describe('LoadingState', () => {
  it('announces its message and renders the loading skeleton', () => {
    const { container } = render(<LoadingState message="Cargando recetas..." />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando recetas...');
    expect(
      container.querySelectorAll('.loading-state__skeleton span'),
    ).toHaveLength(3);
  });
});
