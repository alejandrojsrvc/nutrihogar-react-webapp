import { normalizeApiError, type ApiClient } from '@nutrihogar/api-client';

import type {
  PurchaseGateway,
  PurchaseInput,
  PurchaseFilters,
} from '../../application/ports/PurchaseGateway';
import { toPurchase } from '../mappers/PurchaseApiMapper';
import type { PurchaseListResult } from '../../domain/Purchase';

type Result = { data?: unknown; error?: unknown; response?: Response };
interface Client {
  GET(
    path: string,
    options?: {
      params: { path: Record<string, string>; query?: Record<string, unknown> };
    },
  ): Promise<Result>;
  POST(
    path: string,
    options: { params: { path: Record<string, string> }; body: unknown },
  ): Promise<Result>;
  PATCH(
    path: string,
    options: { params: { path: Record<string, string> }; body: unknown },
  ): Promise<Result>;
  DELETE(
    path: string,
    options: { params: { path: Record<string, string> } },
  ): Promise<Result>;
}

export class HttpPurchaseGateway implements PurchaseGateway {
  constructor(private readonly apiClient: ApiClient) {}

  async list(
    householdId: string,
    filters: PurchaseFilters = {},
  ): Promise<PurchaseListResult> {
    const result = await this.request(() =>
      (this.apiClient as unknown as Client).GET(
        `/api/households/${householdId}/purchases`,
        {
          params: {
            path: { householdId },
            query: filters as Record<string, unknown>,
          },
        },
      ),
    );
    const source = record(result);
    const items = arrayValue(source.items).map(toPurchase);
    const pagination = record(source.pagination);
    return {
      items,
      limit: Number(source.limit ?? pagination.limit ?? items.length),
      page: Number(source.page ?? pagination.page ?? 1),
      total: Number(source.total ?? pagination.total ?? items.length),
    };
  }

  async getById(purchaseId: string) {
    return toPurchase(
      await this.request(() =>
        (this.apiClient as unknown as Client).GET(
          `/api/purchases/${purchaseId}`,
          { params: { path: { purchaseId } } },
        ),
      ),
    );
  }

  async create(householdId: string, input: PurchaseInput) {
    return toPurchase(
      await this.request(() =>
        (this.apiClient as unknown as Client).POST(
          `/api/households/${householdId}/purchases`,
          { params: { path: { householdId } }, body: purchaseBody(input) },
        ),
      ),
    );
  }

  async update(purchaseId: string, input: Partial<PurchaseInput>) {
    return toPurchase(
      await this.request(() =>
        (this.apiClient as unknown as Client).PATCH(
          `/api/purchases/${purchaseId}`,
          { params: { path: { purchaseId } }, body: purchaseBody(input) },
        ),
      ),
    );
  }

  async confirm(purchaseId: string) {
    return toPurchase(
      await this.request(() =>
        (this.apiClient as unknown as Client).POST(
          `/api/purchases/${purchaseId}/confirm`,
          { params: { path: { purchaseId } }, body: {} },
        ),
      ),
    );
  }

  async cancel(purchaseId: string) {
    await this.request(() =>
      (this.apiClient as unknown as Client).DELETE(
        `/api/purchases/${purchaseId}`,
        { params: { path: { purchaseId } } },
      ),
    );
  }

  private async request(request: () => Promise<Result>) {
    try {
      const result = await request();
      if (result.error !== undefined)
        throw normalizeApiError(result.error, result.response);
      return result.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}

function purchaseBody(input: Partial<PurchaseInput>) {
  return {
    ...input,
    items: input.items?.map((item) => ({ ...item })),
    purchaseDate: input.purchaseDate?.toISOString(),
  };
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function arrayValue(value: unknown) {
  return Array.isArray(value) ? value : [];
}
