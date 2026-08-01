import type { PurchaseInput } from '../../../purchases/application/ports/PurchaseGateway';
import type { ShoppingListGateway, ShoppingListItemInput } from '../ports/ShoppingListGateway';

export class LoadShoppingListUseCase {
  constructor(private readonly gateway: ShoppingListGateway) {}

  execute(householdId: string) {
    return this.gateway.get(householdId);
  }
}

export class AddShoppingListItemUseCase {
  constructor(private readonly gateway: ShoppingListGateway) {}

  execute(householdId: string, input: ShoppingListItemInput) {
    if (input.quantity <= 0) throw new Error('La cantidad debe ser mayor que cero.');
    return this.gateway.add(householdId, input);
  }
}

export class UpdateShoppingListItemUseCase {
  constructor(private readonly gateway: ShoppingListGateway) {}

  execute(itemId: string, input: Partial<ShoppingListItemInput>) {
    return this.gateway.update(itemId, input);
  }
}

export class RemoveShoppingListItemUseCase {
  constructor(private readonly gateway: ShoppingListGateway) {}

  execute(itemId: string) {
    return this.gateway.remove(itemId);
  }
}

export class MarkShoppingListItemPurchasedUseCase {
  constructor(private readonly gateway: ShoppingListGateway) {}

  execute(itemId: string) {
    return this.gateway.markPurchased(itemId);
  }
}

export class GenerateShoppingListUseCase {
  constructor(private readonly gateway: ShoppingListGateway) {}

  execute(householdId: string) {
    return this.gateway.generateFromInventory(householdId);
  }
}

export class ConvertShoppingListToPurchaseUseCase {
  constructor(private readonly gateway: ShoppingListGateway) {}

  execute(householdId: string, input: PurchaseInput & { itemIds: string[]; idempotencyKey?: string }) {
    if (input.itemIds.length === 0) throw new Error('Selecciona al menos un elemento.');
    return this.gateway.convertToPurchase(householdId, input);
  }
}
