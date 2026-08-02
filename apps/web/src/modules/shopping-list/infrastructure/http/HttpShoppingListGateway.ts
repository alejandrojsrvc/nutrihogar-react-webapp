import { normalizeApiError, type ApiClient } from '@nutrihogar/api-client';

import type { PurchaseInput } from '../../../purchases/application/ports/PurchaseGateway';
import type { ShoppingListGateway, ShoppingListItemInput } from '../../application/ports/ShoppingListGateway';
import { toShoppingList, toShoppingListItem } from '../mappers/ShoppingListApiMapper';
import { toPurchase } from '../../../purchases/infrastructure/mappers/PurchaseApiMapper';

type Result = { data?: unknown; error?: unknown; response?: Response };
interface Client {
  GET(path: string, options: { params: { path: Record<string, string> } }): Promise<Result>;
  POST(path: string, options: { params: { path: Record<string, string> }; body?: unknown }): Promise<Result>;
  PATCH(path: string, options: { params: { path: Record<string, string> }; body: unknown }): Promise<Result>;
  DELETE(path: string, options: { params: { path: Record<string, string> } }): Promise<Result>;
}

export class HttpShoppingListGateway implements ShoppingListGateway {
  constructor(private readonly apiClient: ApiClient) {}

  async get(householdId: string) {
    return toShoppingList(await this.request(() => (this.apiClient as unknown as Client).GET(
      `/api/households/${householdId}/shopping-list`,
      { params: { path: { householdId } } },
    )));
  }

  async add(householdId: string, input: ShoppingListItemInput) {
    return toShoppingListItem(await this.request(() => (this.apiClient as unknown as Client).POST(
      `/api/households/${householdId}/shopping-list/items`,
      { params: { path: { householdId } }, body: input },
    )));
  }

  async update(itemId: string, input: Partial<ShoppingListItemInput>) {
    await this.request(() => (this.apiClient as unknown as Client).PATCH(
      `/api/shopping-list/items/${itemId}`,
      { params: { path: { itemId } }, body: input },
    ));
  }

  async remove(itemId: string) {
    await this.request(() => (this.apiClient as unknown as Client).DELETE(
      `/api/shopping-list/items/${itemId}`,
      { params: { path: { itemId } } },
    ));
  }

  async markPurchased(itemId: string) {
    await this.request(() => (this.apiClient as unknown as Client).POST(
      `/api/shopping-list/items/${itemId}/mark-purchased`,
      { params: { path: { itemId } } },
    ));
  }

  async generateFromInventory(householdId: string) {
    return toShoppingList(await this.request(() => (this.apiClient as unknown as Client).POST(
      `/api/households/${householdId}/shopping-list/generate-from-inventory`,
      { params: { path: { householdId } } },
    )));
  }

  async convertToPurchase(householdId: string, input: PurchaseInput & { itemIds: string[]; idempotencyKey?: string }) {
    return toPurchase(await this.request(() => (this.apiClient as unknown as Client).POST(
      `/api/households/${householdId}/shopping-list/convert-to-purchase`,
      { params: { path: { householdId } }, body: { ...input, purchaseDate: input.purchaseDate.toISOString() } },
    )));
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
