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

const recipeIngredientFormSchema = z.object({
  id: z.string().uuid().optional(),
  foodId: z.string().uuid('Selecciona un alimento.'),
  foodName: z.string().min(1),
  preparationState: z.string().optional(),
  quantity: z.coerce.number().positive('La cantidad debe ser mayor que cero.').refine((value) => (value.toString().split('.')[1]?.length ?? 0) <= 6, 'Usa hasta seis decimales.'),
  unit: measurementUnitSchema,
  servingId: z.string().uuid().nullable().optional(),
  notes: z.string().max(500, 'La nota no puede superar 500 caracteres.').optional(),
});

export const recipeFormSchema = z.object({
  name: z.string().trim().min(1, 'Escribe un nombre.').max(150),
  description: z.string().max(2000).optional(),
  category: z.string().max(50).optional(),
  defaultServings: z.coerce.number().int().min(1).max(1000),
  estimatedPreparationMinutes: z.coerce.number().int().positive().nullable().optional(),
  ingredients: z.array(recipeIngredientFormSchema).min(1, 'Agrega al menos un ingrediente.'),
  instructions: z.array(z.object({ id: z.string().uuid().optional(), description: z.string().trim().min(1, 'Escribe el paso.').max(2000) })),
}).superRefine((value, context) => {
  const keys = new Set<string>();
  value.ingredients.forEach((ingredient, index) => {
    if (ingredient.unit === 'SERVING' && !ingredient.servingId) context.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecciona una porción.', path: ['ingredients', index, 'servingId'] });
    if (ingredient.unit !== 'SERVING' && ingredient.servingId) context.addIssue({ code: z.ZodIssueCode.custom, message: 'La porción solo aplica a esta unidad.', path: ['ingredients', index, 'servingId'] });
    const key = `${ingredient.foodId}:${ingredient.unit}:${ingredient.servingId ?? ''}`;
    if (keys.has(key)) context.addIssue({ code: z.ZodIssueCode.custom, message: 'No repitas el mismo alimento con la misma unidad.', path: ['ingredients', index, 'foodId'] });
    keys.add(key);
  });
});

export type RecipeFormValues = z.infer<typeof recipeFormSchema>;

export const plannedMealFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Selecciona una fecha válida.'),
  type: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
  source: z.enum(['RECIPE', 'PREVIOUS_MEAL', 'FREE_MEAL', 'RESTAURANT', 'DELIVERY']),
  recipeId: z.string().optional(),
  previousMealId: z.string().optional(),
  nameSnapshot: z.string().max(150).optional(),
  notes: z.string().max(500).optional(),
  position: z.coerce.number().int().min(0),
}).superRefine((value, context) => {
  if (value.source === 'RECIPE' && !value.recipeId) context.addIssue({ code: z.ZodIssueCode.custom, path: ['recipeId'], message: 'Selecciona una receta.' });
  if (value.source === 'PREVIOUS_MEAL' && !value.previousMealId) context.addIssue({ code: z.ZodIssueCode.custom, path: ['previousMealId'], message: 'Selecciona una comida anterior.' });
  if (['FREE_MEAL', 'RESTAURANT', 'DELIVERY'].includes(value.source) && !value.nameSnapshot?.trim()) context.addIssue({ code: z.ZodIssueCode.custom, path: ['nameSnapshot'], message: 'Escribe una descripción.' });
});
export type PlannedMealFormValues = z.infer<typeof plannedMealFormSchema>;
