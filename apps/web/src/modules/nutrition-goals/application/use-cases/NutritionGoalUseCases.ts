import type {
  NutritionGoalGateway,
  NutritionGoalValues,
} from '../ports/NutritionGoalGateway';

export class GenerateNutritionGoalSuggestionUseCase {
  constructor(private readonly gateway: NutritionGoalGateway) {}

  execute(profileId: string) {
    return this.gateway.generateSuggestion(profileId);
  }
}

export class ConfirmNutritionGoalSuggestionUseCase {
  constructor(private readonly gateway: NutritionGoalGateway) {}

  execute(suggestionId: string, values: Partial<NutritionGoalValues>) {
    return this.gateway.confirmSuggestion(suggestionId, values);
  }
}

export class GetCurrentNutritionGoalUseCase {
  constructor(private readonly gateway: NutritionGoalGateway) {}

  execute(profileId: string) {
    return this.gateway.getCurrent(profileId);
  }
}
