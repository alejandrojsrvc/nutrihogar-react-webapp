import { describe, expect, it, vi } from 'vitest';
import { ListRecipesUseCase } from './ListRecipesUseCase';
import type { RecipeGateway } from '../ports/RecipeGateway';

describe('ListRecipesUseCase', () => {
  it('trims search criteria before delegating', async () => {
    const gateway = {
      list: vi
        .fn()
        .mockResolvedValue({ items: [], page: 1, limit: 20, total: 0 }),
    } as unknown as RecipeGateway;
    await new ListRecipesUseCase(gateway).execute('household-1', {
      page: 1,
      limit: 20,
      query: ' arroz ',
    });
    expect(gateway.list).toHaveBeenCalledWith(
      'household-1',
      expect.objectContaining({ query: 'arroz' }),
    );
  });
});
