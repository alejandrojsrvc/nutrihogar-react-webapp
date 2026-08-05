import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge } from './Badge';

describe('Badge', () => {
  it('renders the text with the requested tone', () => {
    const { container } = render(<Badge tone="warning">Pendiente</Badge>);

    expect(container.querySelector('.badge')).toHaveTextContent('Pendiente');
    expect(container.querySelector('.badge')?.className).toContain(
      'badge--warning',
    );
  });

  it('shows a decorative dot for status', () => {
    const { container } = render(<Badge dot>Al día</Badge>);

    expect(container.querySelector('.badge__dot')).toBeInTheDocument();
  });

  it('renders a leading icon', () => {
    render(
      <Badge icon={<span data-testid="badge-icon" />}>Info</Badge>,
    );

    expect(screen.getByTestId('badge-icon')).toBeInTheDocument();
  });
});
