import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addPlannedMealUseCase, createWeeklyPlanUseCase, listWeeklyPlansUseCase, loadWeeklyPlanUseCase, updatePlannedMealUseCase } from '../../../../app/composition/dependencies';
import type { PlannedMealInput } from '../../application/ports/MealPlanningGateway';

export const mealPlanningQueryKeys = { all: ['meal-planning'] as const, week: (householdId: string, weekStart: string) => [...mealPlanningQueryKeys.all, householdId, weekStart] as const, detail: (id: string) => [...mealPlanningQueryKeys.all, 'detail', id] as const };

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
