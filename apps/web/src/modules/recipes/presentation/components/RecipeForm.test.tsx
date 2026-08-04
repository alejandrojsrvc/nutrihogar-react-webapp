import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { emptyRecipeFormValues, RecipeForm } from './RecipeForm';

describe('RecipeForm', () => {
  it('shows unavailable previews without simulating server data', () => {
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

    expect(screen.getByRole('button', { name: /Foto de la receta/ })).toBeDisabled();
    expect(screen.getByText('Se calculará al guardar')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Resumen nutricional por porción/ })).toBeInTheDocument();
  });
});
