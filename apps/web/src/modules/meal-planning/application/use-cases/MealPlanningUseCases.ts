import type { MealPlanningGateway, MealPlanListCriteria, PlannedMealInput } from '../ports/MealPlanningGateway';
import { canonicalWeekStart } from '../../domain/week';

export class ListWeeklyPlansUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string, criteria: MealPlanListCriteria) { return this.gateway.list(id, criteria); } }
export class LoadWeeklyPlanUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string) { return this.gateway.get(id); } }
export class CreateWeeklyPlanUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string, weekStart: string) { return this.gateway.create(id, canonicalWeekStart(weekStart)); } }
export class AddPlannedMealUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string, input: PlannedMealInput) { return this.gateway.addMeal(id, input); } }
export class UpdatePlannedMealUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string, input: Partial<PlannedMealInput>) { return this.gateway.updateMeal(id, input); } }
export class AssignParticipantUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string, adultProfileId: string) { return this.gateway.assignParticipant(id, adultProfileId); } }
export class DeleteParticipantUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string) { return this.gateway.deleteParticipant(id); } }
export class ProposeQuantitiesUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string) { return this.gateway.proposeQuantities(id); } }
export class ListQuantitiesUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string) { return this.gateway.listQuantities(id); } }
export class AcceptQuantitySuggestionsUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string) { return this.gateway.acceptQuantitySuggestions(id); } }
export class UpdateParticipantUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string, input: { confirmedQuantity: number; confirmedUnit: string }) { return this.gateway.updateParticipant(id, input); } }
export class GetRequirementsUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string) { return this.gateway.getRequirements(id); } }
export class CompareInventoryUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string) { return this.gateway.compareInventory(id); } }
export class GetShoppingItemsUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string) { return this.gateway.getShoppingItems(id); } }
export class AddMissingShoppingItemsUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string, items: Array<{ foodId: string; name?: string; unit: string; quantity?: number }>) { return this.gateway.addMissingShoppingItems(id, items); } }
export class GetPreparationUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string) { return this.gateway.getPreparation(id); } }
export class PreparePlannedMealUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string) { return this.gateway.prepare(id); } }
export class GetAdherenceUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string) { return this.gateway.getAdherence(id); } }
export class LinkConsumptionUseCase { constructor(private gateway: MealPlanningGateway) {} execute(consumedMealId: string, plannedMealId: string) { return this.gateway.linkConsumption(consumedMealId, plannedMealId); } }
