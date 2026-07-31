import { z } from 'zod';

import {
  MEAL_TYPES,
  MEASUREMENT_METHODS,
  MEASUREMENT_UNITS,
} from '@nutrihogar/domain';

export const mealTypeSchema = z.enum(MEAL_TYPES);
export const measurementUnitSchema = z.enum(MEASUREMENT_UNITS);
export const measurementMethodSchema = z.enum(MEASUREMENT_METHODS);

export const nutritionGoalValuesSchema = z.object({
  dailyCalories: z.coerce.number().positive('Debe ser mayor que cero.'),
  proteinGrams: z.coerce.number().positive('Debe ser mayor que cero.'),
  carbohydrateGrams: z.coerce.number().positive('Debe ser mayor que cero.'),
  fatGrams: z.coerce.number().positive('Debe ser mayor que cero.'),
  fiberGrams: z.coerce.number().positive('Debe ser mayor que cero.'),
});

export const mealItemFormSchema = z.object({
  foodId: z.string().uuid(),
  foodName: z.string().min(1),
  quantity: z.coerce.number().positive('La cantidad debe ser mayor que cero.'),
  unit: measurementUnitSchema,
  measurementMethod: measurementMethodSchema,
  servingId: z.string().uuid().nullable().optional(),
});

export const mealFormSchema = z.object({
  profileId: z.string().uuid('Selecciona un adulto.'),
  mealType: mealTypeSchema,
  consumedAt: z.coerce.date(),
  notes: z.string().max(500).optional(),
  items: z.array(mealItemFormSchema).min(1, 'Agrega al menos un alimento.'),
});

export type NutritionGoalValues = z.infer<typeof nutritionGoalValuesSchema>;
export type MealItemFormValues = z.infer<typeof mealItemFormSchema>;
export type MealFormValues = z.infer<typeof mealFormSchema>;
