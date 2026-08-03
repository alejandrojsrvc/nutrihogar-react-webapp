export interface PurchaseOcrInput {
  householdId: string;
  file: File;
  currency?: string;
  locale?: string;
}

export interface PurchaseOcrGateway {
  createDraft(input: PurchaseOcrInput): Promise<unknown>;
}
