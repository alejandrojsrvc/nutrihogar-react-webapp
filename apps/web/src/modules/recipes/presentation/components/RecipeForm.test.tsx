import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { emptyRecipeFormValues, RecipeForm } from './RecipeForm';

describe('RecipeForm', () => {
  it('explains when definitive nutrition will be available without simulating data', () => {
    render(
      <MemoryRouter>
        <RecipeForm
          cancelTo="/app/recetas"
          initialValues={emptyRecipeFormValues()}
          onSubmit={vi.fn()}
          submitLabel="Crear receta"
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(
        'El resumen nutricional definitivo se calculará después de guardar la receta.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/kcal/i)).not.toBeInTheDocument();
  });
});
