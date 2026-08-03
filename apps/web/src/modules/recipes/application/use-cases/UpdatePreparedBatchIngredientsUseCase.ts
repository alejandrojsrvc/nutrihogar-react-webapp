import type {
  PreparedBatchGateway,
  PreparedBatchIngredientInput,
} from '../ports/PreparedBatchGateway';
export class UpdatePreparedBatchIngredientsUseCase {
  constructor(private readonly gateway: PreparedBatchGateway) {}
  execute(batchId: string, ingredients: PreparedBatchIngredientInput[]) {
    if (!ingredients.length)
      throw new Error('La preparación debe tener al menos un ingrediente.');
    return this.gateway.updateIngredients(batchId, ingredients);
  }
}
