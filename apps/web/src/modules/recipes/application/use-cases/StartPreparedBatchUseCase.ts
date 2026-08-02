import type { PreparedBatchGateway } from '../ports/PreparedBatchGateway';
export class StartPreparedBatchUseCase { constructor(private readonly gateway: PreparedBatchGateway) {} execute(recipeId: string, preparedAt: Date) { return this.gateway.startFromRecipe(recipeId, preparedAt); } }
