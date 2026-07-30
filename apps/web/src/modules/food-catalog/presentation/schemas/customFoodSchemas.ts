import { z } from 'zod';

const nonNegativeNumber = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0, {
      message: 'Ingresa un numero mayor o igual que cero.',
    });

const positiveNumber = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, {
      message: 'Ingresa un numero mayor que cero.',
    });

const nutrientFormSchema = z.object({
  amount: nonNegativeNumber('Indica el valor del nutriente.'),
  nutrientDefinitionId: z.string().min(1),
});

const servingFormSchema = z.object({
  equivalentType: z.enum(['GRAM', 'MILLILITER']),
  equivalentValue: positiveNumber('Indica la equivalencia.'),
  name: z
    .string()
    .trim()
    .min(1, 'Indica el nombre de la porcion.')
    .max(100, 'El nombre de la porcion no puede superar 100 caracteres.'),
  quantity: positiveNumber('Indica la cantidad de la porcion.'),
  unit: z
    .string()
    .trim()
    .min(1, 'Indica la unidad de la porcion.')
    .max(50, 'La unidad no puede superar 50 caracteres.'),
});

export const customFoodFormSchema = z.object({
  brand: z
    .string()
    .trim()
    .max(150, 'La marca no puede superar 150 caracteres.'),
  categoryId: z.string().min(1, 'Selecciona una categoria.'),
  confidenceLevel: z.enum(
    ['VERIFIED', 'HIGH', 'MEDIUM', 'LOW', 'USER_PROVIDED'],
    'Selecciona un nivel de confianza.',
  ),
  name: z
    .string()
    .trim()
    .min(1, 'Ingresa el nombre del alimento.')
    .max(150, 'El nombre no puede superar 150 caracteres.'),
  nutrients: z.array(nutrientFormSchema).min(1, 'Agrega los nutrientes requeridos.'),
  preparationState: z.enum(
    ['RAW', 'COOKED', 'READY_TO_EAT', 'NOT_APPLICABLE'],
    'Selecciona un estado de preparacion.',
  ),
  referenceQuantity: positiveNumber('Indica la cantidad de referencia.'),
  referenceUnit: z.enum(['GRAM', 'MILLILITER', 'UNIT'], 'Selecciona una unidad.'),
  servings: z.array(servingFormSchema),
  source: z
    .string()
    .trim()
    .max(100, 'La fuente no puede superar 100 caracteres.'),
});

export type CustomFoodFormValues = z.infer<typeof customFoodFormSchema>;
export type NutrientFormValue = CustomFoodFormValues['nutrients'][number];
export type ServingFormValue = CustomFoodFormValues['servings'][number];

export function getDefaultCustomFoodFormValues(): CustomFoodFormValues {
  return {
    brand: '',
    categoryId: '',
    confidenceLevel: 'USER_PROVIDED',
    name: '',
    nutrients: [],
    preparationState: 'RAW',
    referenceQuantity: '100',
    referenceUnit: 'GRAM',
    servings: [],
    source: '',
  };
}
