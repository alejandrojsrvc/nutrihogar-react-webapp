import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerMealUseCase } from '../../../../app/composition/dependencies';
import type { RegisterMealInput } from '../../application/ports/MealGateway';

export const mealQueryKeys = { all: ['meals'] as const };

export function useRegisterMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterMealInput) => registerMealUseCase.execute(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: mealQueryKeys.all }),
  });
}
