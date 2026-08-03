export interface ServePortionsInput {
  portions: Array<{ adultProfileId: string; servedWeight: number }>;
  servedAt?: Date;
}
export interface ServePortionsResult {
  preparedBatchId: string;
  portions: Array<{
    id: string;
    adultProfileId: string;
    servedWeight: number;
    estimatedNutrition: Record<string, number>;
  }>;
  availableWeight: number;
}
export interface ServedPortionGateway {
  serve(
    batchId: string,
    input: ServePortionsInput,
  ): Promise<ServePortionsResult>;
}
