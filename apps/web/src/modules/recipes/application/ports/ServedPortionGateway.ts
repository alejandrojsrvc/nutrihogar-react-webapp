export interface ServedPortionGateway {
  serve(batchId: string, input: { adultProfileId: string; servedWeight: number; servedAt: Date }): Promise<{ id: string }>;
}
