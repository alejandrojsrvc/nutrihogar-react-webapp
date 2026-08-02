import type { MealPlanningGateway, MealPlanListCriteria, PlannedMealInput } from '../ports/MealPlanningGateway';
import { canonicalWeekStart } from '../../domain/week';

export class ListWeeklyPlansUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string, criteria: MealPlanListCriteria) { return this.gateway.list(id, criteria); } }
export class LoadWeeklyPlanUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string) { return this.gateway.get(id); } }
export class CreateWeeklyPlanUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string, weekStart: string) { return this.gateway.create(id, canonicalWeekStart(weekStart)); } }
export class AddPlannedMealUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string, input: PlannedMealInput) { return this.gateway.addMeal(id, input); } }
export class UpdatePlannedMealUseCase { constructor(private gateway: MealPlanningGateway) {} execute(id: string, input: Partial<PlannedMealInput>) { return this.gateway.updateMeal(id, input); } }
