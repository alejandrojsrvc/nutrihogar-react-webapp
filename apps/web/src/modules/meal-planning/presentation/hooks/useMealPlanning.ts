import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { acceptQuantitySuggestionsUseCase, addMissingShoppingItemsUseCase, addPlannedMealUseCase, assignParticipantUseCase, compareInventoryUseCase, createWeeklyPlanUseCase, deleteParticipantUseCase, getAdherenceUseCase, getPreparationUseCase, getRequirementsUseCase, linkConsumptionUseCase, listQuantitiesUseCase, listWeeklyPlansUseCase, loadWeeklyPlanUseCase, preparePlannedMealUseCase, proposeQuantitiesUseCase, updateParticipantUseCase, updatePlannedMealUseCase } from '../../../../app/composition/dependencies';
import type { InventoryComparison, QuantitySuggestion, WeeklyRequirements } from '../../domain/MealPlanning';
import type { PlannedMealInput } from '../../application/ports/MealPlanningGateway';

export const mealPlanningQueryKeys = { all: ['meal-planning'] as const, week: (householdId: string, weekStart: string) => [...mealPlanningQueryKeys.all, householdId, weekStart] as const, detail: (id: string) => [...mealPlanningQueryKeys.all, 'detail', id] as const };
export const quantityQueryKey = (id: string) => [...mealPlanningQueryKeys.all, 'quantities', id] as const;
export const requirementsQueryKey = (id: string) => [...mealPlanningQueryKeys.all, 'requirements', id] as const;
export const comparisonQueryKey = (id: string) => [...mealPlanningQueryKeys.all, 'comparison', id] as const;
export const adherenceQueryKey = (id: string) => [...mealPlanningQueryKeys.all, 'adherence', id] as const;

async function findWeek(householdId: string, weekStart: string) {
  const limit = 20;
  let page = 1;
  while (true) {
    const result = await listWeeklyPlansUseCase.execute(householdId, { page, limit });
    const match = result.items.find((plan) => plan.weekStart === weekStart);
    if (match || page * result.limit >= result.total || result.items.length === 0) return match ?? null;
    page += 1;
  }
}

export function useWeeklyPlanForWeek(householdId: string | undefined, weekStart: string) {
  return useQuery({ enabled: Boolean(householdId), queryKey: householdId ? mealPlanningQueryKeys.week(householdId, weekStart) : mealPlanningQueryKeys.all, queryFn: () => findWeek(householdId as string, weekStart), retry: false });
}
export function useWeeklyPlan(id: string | undefined) { return useQuery({ enabled: Boolean(id), queryKey: id ? mealPlanningQueryKeys.detail(id) : mealPlanningQueryKeys.all, queryFn: () => loadWeeklyPlanUseCase.execute(id as string), retry: false }); }
function cachePlan(client: ReturnType<typeof useQueryClient>, plan: { id: string; householdId: string; weekStart: string }) {
  client.setQueryData(mealPlanningQueryKeys.detail(plan.id), plan);
  client.setQueryData(mealPlanningQueryKeys.week(plan.householdId, plan.weekStart), plan);
  void client.invalidateQueries({ queryKey: mealPlanningQueryKeys.all });
}
export function useCreateWeeklyPlan() { const client = useQueryClient(); return useMutation({ mutationFn: ({ householdId, weekStart }: { householdId: string; weekStart: string }) => createWeeklyPlanUseCase.execute(householdId, weekStart), onSuccess: (plan) => cachePlan(client, plan) }); }
export function useAddPlannedMeal() { const client = useQueryClient(); return useMutation({ mutationFn: ({ weeklyPlanId, input }: { weeklyPlanId: string; input: PlannedMealInput }) => addPlannedMealUseCase.execute(weeklyPlanId, input), onSuccess: (plan) => cachePlan(client, plan) }); }
export function useUpdatePlannedMeal() { const client = useQueryClient(); return useMutation({ mutationFn: ({ plannedMealId, input }: { plannedMealId: string; input: Partial<PlannedMealInput> }) => updatePlannedMealUseCase.execute(plannedMealId, input), onSuccess: (plan) => cachePlan(client, plan) }); }
export function useAssignParticipant() { const client = useQueryClient(); return useMutation({ mutationFn: ({ plannedMealId, adultProfileId }: { plannedMealId: string; adultProfileId: string }) => assignParticipantUseCase.execute(plannedMealId, adultProfileId), onSuccess: (plan) => cachePlan(client, plan) }); }
export function useDeleteParticipant() { const client = useQueryClient(); return useMutation({ mutationFn: (participantId: string) => deleteParticipantUseCase.execute(participantId), onSuccess: () => void client.invalidateQueries({ queryKey: mealPlanningQueryKeys.all }) }); }
export function useQuantitySuggestions(id: string | undefined) { return useQuery<QuantitySuggestion[]>({ enabled: Boolean(id), queryKey: id ? quantityQueryKey(id) : mealPlanningQueryKeys.all, queryFn: () => listQuantitiesUseCase.execute(id as string), retry: false }); }
export function useProposeQuantities() { const client = useQueryClient(); return useMutation({ mutationFn: (plannedMealId: string) => proposeQuantitiesUseCase.execute(plannedMealId), onSuccess: (suggestions, id) => client.setQueryData(quantityQueryKey(id), suggestions) }); }
export function useAcceptQuantitySuggestions() { const client = useQueryClient(); return useMutation({ mutationFn: (plannedMealId: string) => acceptQuantitySuggestionsUseCase.execute(plannedMealId), onSuccess: (plan) => cachePlan(client, plan) }); }
export function useUpdateParticipant() { const client = useQueryClient(); return useMutation({ mutationFn: ({ participantId, input }: { participantId: string; input: { confirmedQuantity: number; confirmedUnit: string } }) => updateParticipantUseCase.execute(participantId, input), onSuccess: (plan) => cachePlan(client, plan) }); }
export function useWeeklyRequirements(id: string | undefined) { return useQuery<WeeklyRequirements>({ enabled: Boolean(id), queryKey: id ? requirementsQueryKey(id) : mealPlanningQueryKeys.all, queryFn: () => getRequirementsUseCase.execute(id as string), retry: false }); }
export function useInventoryComparison(id: string | undefined) { return useQuery<InventoryComparison>({ enabled: Boolean(id), queryKey: id ? comparisonQueryKey(id) : mealPlanningQueryKeys.all, queryFn: () => compareInventoryUseCase.execute(id as string), retry: false }); }
export function useAddMissingShoppingItems() { const client = useQueryClient(); return useMutation({ mutationFn: ({ weeklyPlanId, items }: { weeklyPlanId: string; items: Array<{ foodId: string; name?: string; unit: string; quantity?: number }> }) => addMissingShoppingItemsUseCase.execute(weeklyPlanId, items), onSuccess: () => void client.invalidateQueries({ queryKey: ['shopping-list'] }) }); }
export function usePlannedMealPreparation(id: string | undefined) { return useQuery({ enabled: Boolean(id), queryKey: id ? [...mealPlanningQueryKeys.all, 'preparation', id] : mealPlanningQueryKeys.all, queryFn: () => getPreparationUseCase.execute(id as string), retry: false }); }
export function usePreparePlannedMeal() { const client = useQueryClient(); return useMutation({ mutationFn: (plannedMealId: string) => preparePlannedMealUseCase.execute(plannedMealId), onSuccess: (_, id) => void client.invalidateQueries({ queryKey: [...mealPlanningQueryKeys.all, 'preparation', id] }) }); }
export function useWeeklyAdherence(id: string | undefined) { return useQuery({ enabled: Boolean(id), queryKey: id ? adherenceQueryKey(id) : mealPlanningQueryKeys.all, queryFn: () => getAdherenceUseCase.execute(id as string), retry: false }); }
export function useLinkConsumption() { const client = useQueryClient(); return useMutation({ mutationFn: ({ consumedMealId, plannedMealId }: { consumedMealId: string; plannedMealId: string }) => linkConsumptionUseCase.execute(consumedMealId, plannedMealId), onSuccess: () => void client.invalidateQueries({ queryKey: mealPlanningQueryKeys.all }) }); }
