import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from '@nutrihogar/api-client';
import { HttpPreparedBatchGateway } from './HttpPreparedBatchGateway';

describe('HttpPreparedBatchGateway', () => {
  it('loads operational details from the backend contract', async () => {
    let request: Request | undefined;
    const fetchImplementation: typeof globalThis.fetch = vi.fn(async (input, init) => { request = new Request(input, init); return new Response(JSON.stringify({ batch: { id: 'batch-1', status: 'FINALIZED', ingredients: [], warnings: [], totalNutrients: {}, nutrientsPerGram: {}, nutrientsPer100Grams: {} }, availability: { availableWeight: 500, finalCookedWeight: 1000, servedWeight: 400, storedLeftoverWeight: 100, savedRemainderWeight: 0, discardedWeight: 0 }, servedPortions: [], leftovers: [] }), { headers: { 'Content-Type': 'application/json' }, status: 200 }); });
    const apiClient = createApiClient({ baseUrl: 'http://localhost:3000', fetch: fetchImplementation });
    const details = await new HttpPreparedBatchGateway(apiClient).getDetails('batch-1');
    expect(new URL(request?.url ?? '').pathname).toBe('/api/prepared-batches/batch-1/details');
    expect(details.availability?.availableWeight).toBe(500);
  });
});
