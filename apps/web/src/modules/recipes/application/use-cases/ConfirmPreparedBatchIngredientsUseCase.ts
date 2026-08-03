import type { PreparedBatchGateway } from '../ports/PreparedBatchGateway';
export class ConfirmPreparedBatchIngredientsUseCase {
  constructor(private readonly gateway: PreparedBatchGateway) {}
  execute(id: string) {
    return this.gateway.confirmIngredients(id);
  }
}
