export interface PreparedBatchGateway {
  startFromRecipe(recipeId: string, preparedAt: Date): Promise<{ id: string }>;
}
