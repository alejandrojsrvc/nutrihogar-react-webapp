import { normalizeApiError, type ApiClient, type components } from '@nutrihogar/api-client';

import type { PreparedBatchInventoryGateway } from '../../application/ports/PreparedBatchInventoryGateway';
import type {
  PreparedBatchInventoryDecision,
  PreparedBatchInventoryIngredient,
  PreparedBatchInventoryPreview,
} from '../../domain/PreparedBatchInventory';

type Result<T = unknown> = { data?: T; error?: unknown; response?: Response };
type PreviewResponse = components['schemas']['PreparedBatchInventoryPreviewResponseDto'];
type ConfirmRequest = components['schemas']['ConfirmPreparedBatchInventoryConsumptionRequestDto'];

interface Client {
  GET(path: string, options: { params: { path: { batchId: string } } }): Promise<Result<PreviewResponse>>;
  POST(path: string, options: { params: { path: { batchId: string } }; body: ConfirmRequest }): Promise<Result<unknown>>;
}

export class HttpPreparedBatchInventoryGateway implements PreparedBatchInventoryGateway {
  constructor(private readonly apiClient: ApiClient) {}

  async preview(batchId: string) {
    const result = await this.request(() => (this.apiClient as unknown as Client).GET(
      `/api/prepared-batches/${batchId}/inventory-consumption-preview`,
      { params: { path: { batchId } } },
    ));
    return toPreview(batchId, result);
  }

  async confirm(batchId: string, decisions: PreparedBatchInventoryDecision[]) {
    await this.request(() => (this.apiClient as unknown as Client).POST(
      `/api/prepared-batches/${batchId}/inventory-consumption`,
      { params: { path: { batchId } }, body: { decisions } },
    ));
  }

  private async request(request: () => Promise<Result>) {
    try {
      const result = await request();
      if (result.error !== undefined) throw normalizeApiError(result.error, result.response);
      return result.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}

function toPreview(batchId: string, value: unknown): PreparedBatchInventoryPreview {
  const source = record(value);
  const rawItems = Array.isArray(source.ingredients)
    ? source.ingredients
    : Array.isArray(source.items) ? source.items : [];
  const ingredients = rawItems.map(toIngredient);
  return {
    alreadyConfirmed: Boolean(source.alreadyConfirmed ?? source.confirmed ?? ingredients.some((item) => item.status === 'CONFIRMED')),
    batchId,
    ingredients,
  };
}

function toIngredient(value: unknown): PreparedBatchInventoryIngredient {
  const source = record(value);
  const optionsValue = source.options ?? source.inventoryOptions ?? source.inventoryItems ?? source.existences;
  const options = Array.isArray(optionsValue) ? optionsValue.map(toOption) : [];
  const availableQuantity = number(source.availableQuantity ?? source.available ?? options[0]?.availableQuantity);
  const availability = availabilityValue(source.availability, source.status, availableQuantity, number(source.quantity ?? source.requiredQuantity), options.length);
  const status = statusValue(source.status, availability);
  return {
    availableQuantity,
    availability,
    ingredientId: string(source.ingredientId ?? source.id),
    name: string(source.ingredientName ?? source.name ?? source.foodName ?? 'Ingrediente'),
    options,
    selectedInventoryItemId: nullableString(source.inventoryItemId ?? source.selectedInventoryItemId ?? options[0]?.inventoryItemId),
    status,
    unit: string(source.unit ?? source.requiredUnit),
    usedQuantity: number(source.usedQuantity ?? source.quantity ?? source.requiredQuantity),
  };
}

function toOption(value: unknown) {
  const source = record(value);
  return {
    availableQuantity: number(source.availableQuantity ?? source.currentQuantity ?? source.quantity),
    inventoryItemId: string(source.inventoryItemId ?? source.id),
    location: nullableString(source.location),
    foodId: nullableString(source.foodId),
    unit: string(source.unit),
    expiresAt: nullableString(source.expiresAt),
    status: string(source.status ?? 'ACTIVE'),
  };
}

function availabilityValue(value: unknown, status: unknown, available: number, required: number, optionCount: number): PreparedBatchInventoryIngredient['availability'] {
  if (value === 'AVAILABLE' || value === 'PARTIAL' || value === 'UNAVAILABLE') return value;
  if (status === 'AVAILABLE' || status === 'PARTIAL' || status === 'UNAVAILABLE') return status;
  return optionCount === 0 ? 'UNAVAILABLE' : available >= required ? 'AVAILABLE' : 'PARTIAL';
}

function statusValue(value: unknown, availability: PreparedBatchInventoryIngredient['availability']): PreparedBatchInventoryIngredient['status'] {
  if (value === 'IGNORED' || value === 'CONFIRMED') return value;
  return availability;
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function string(value: unknown) {
  return String(value ?? '');
}

function nullableString(value: unknown) {
  return value == null ? null : String(value);
}

function number(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}
