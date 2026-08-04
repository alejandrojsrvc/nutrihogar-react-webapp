import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('uses a unique accessible heading for every instance', () => {
    render(
      <>
        <EmptyState description="Primera descripción" title="Primer estado" />
        <EmptyState description="Segunda descripción" title="Segundo estado" />
      </>,
    );

    const sections = screen.getAllByRole('region');
    expect(sections).toHaveLength(2);
    expect(sections[0]).toHaveAccessibleName('Primer estado');
    expect(sections[1]).toHaveAccessibleName('Segundo estado');
  });
});
