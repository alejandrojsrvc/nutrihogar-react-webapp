import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('is an accessible progressbar with label and values', () => {
    render(
      <ProgressBar
        goal={100}
        goalLabel="100 g"
        label="Proteína"
        value={42}
        valueLabel="42 g"
      />,
    );

    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAccessibleName('Proteína: 42 g de 100 g');
    expect(bar).toHaveAttribute('aria-valuenow', '42');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps the current value to the goal', () => {
    render(<ProgressBar goal={100} label="Calorías" value={150} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
  });

  it('can be decorative and hidden from the accessibility tree', () => {
    const { container } = render(
      <ProgressBar ariaHidden goal={100} label="Calorías" value={50} />,
    );

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(container.querySelector('.progress-bar')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });
});
