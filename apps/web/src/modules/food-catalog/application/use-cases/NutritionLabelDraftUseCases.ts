import type {
  NutritionLabelConfirmInput,
  NutritionLabelDraft,
  NutritionLabelDraftGateway,
  NutritionLabelUploadInput,
  NutritionLabelConfirmation,
} from '../ports/NutritionLabelDraftGateway';

export class CreateNutritionLabelDraftUseCase {
  constructor(private readonly gateway: NutritionLabelDraftGateway) {}

  execute(input: NutritionLabelUploadInput): Promise<NutritionLabelDraft> {
    return this.gateway.createDraft(input);
  }
}

export class GetNutritionLabelDraftUseCase {
  constructor(private readonly gateway: NutritionLabelDraftGateway) {}

  execute(householdId: string, draftId: string): Promise<NutritionLabelDraft> {
    return this.gateway.getDraft(householdId, draftId);
  }
}

export class ConfirmNutritionLabelDraftUseCase {
  constructor(private readonly gateway: NutritionLabelDraftGateway) {}

  execute(
    householdId: string,
    draftId: string,
    input: NutritionLabelConfirmInput,
  ): Promise<NutritionLabelConfirmation> {
    return this.gateway.confirmDraft(householdId, draftId, input);
  }
}
