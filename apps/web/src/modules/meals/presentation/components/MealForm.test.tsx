import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { MealForm } from './MealForm';

describe('MealForm consumer layout', () => {
  it('keeps unavailable sources visible and disabled', () => {
    render(
      <MemoryRouter>
        <MealForm
          consumerLayout
          initialValues={{
            consumedAt: new Date('2026-08-04T13:20:00'),
            items: [],
            mealType: 'LUNCH',
            notes: '',
            profileId: 'profile-1',
          }}
          onSubmit={vi.fn()}
          profiles={[{ id: 'profile-1', name: 'Alejandro' }]}
          submitLabel="Registrar comida"
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: 'Foto. Disponible próximamente' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'IA. Disponible próximamente' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Código. Disponible próximamente' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Registrar comida' })).toBeDisabled();
    expect(screen.getByRole('heading', { name: 'Tu comida' })).toBeInTheDocument();
  });
});
