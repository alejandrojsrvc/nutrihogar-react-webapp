import type {
  PurchaseGateway,
  PurchaseInput,
  PurchaseFilters,
} from '../ports/PurchaseGateway';

export class ListPurchasesUseCase {
  constructor(private readonly gateway: PurchaseGateway) {}

  execute(householdId: string, filters?: PurchaseFilters) {
    return this.gateway.list(householdId, filters);
  }
}

export class LoadPurchaseUseCase {
  constructor(private readonly gateway: PurchaseGateway) {}

  execute(purchaseId: string) {
    return this.gateway.getById(purchaseId);
  }
}

export class CreatePurchaseUseCase {
  constructor(private readonly gateway: PurchaseGateway) {}

  execute(householdId: string, input: PurchaseInput) {
    if (input.items.length === 0)
      throw new Error('Agrega al menos un producto a la compra.');
    return this.gateway.create(householdId, input);
  }
}

export class UpdatePurchaseUseCase {
  constructor(private readonly gateway: PurchaseGateway) {}

  execute(purchaseId: string, input: Partial<PurchaseInput>) {
    return this.gateway.update(purchaseId, input);
  }
}

export class ConfirmPurchaseUseCase {
  constructor(private readonly gateway: PurchaseGateway) {}

  execute(purchaseId: string) {
    return this.gateway.confirm(purchaseId);
  }
}

export class CancelPurchaseUseCase {
  constructor(private readonly gateway: PurchaseGateway) {}

  execute(purchaseId: string) {
    return this.gateway.cancel(purchaseId);
  }
}
