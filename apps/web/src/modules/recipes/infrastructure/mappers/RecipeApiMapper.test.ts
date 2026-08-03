import { describe, expect, it } from 'vitest';
import { toRecipe } from './RecipeApiMapper';

describe('RecipeApiMapper', () => {
  it('normalizes nullable recipe fields', () => {
    const recipe = toRecipe({
      defaultServings: 4,
      estimatedPreparationMinutes: 60,
      id: 'recipe-1',
      ingredients: [],
      name: 'Arroz',
      status: 'ACTIVE',
      tags: [],
    });
    expect(recipe.name).toBe('Arroz');
    expect(recipe.category).toBeNull();
    expect(recipe.estimatedPreparationMinutes).toBe(60);
  });
});
