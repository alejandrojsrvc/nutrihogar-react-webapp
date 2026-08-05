import { z } from 'zod';

const positiveNumber = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, {
      message: 'Ingresa un numero mayor que cero.',
    });

const optionalNumber = z
  .string()
  .trim()
  .refine(
    (value) =>
      !value || (Number.isFinite(Number(value)) && Number(value) >= 0),
    'Ingresa un numero mayor o igual que cero.',
  );

const servingSchema = z
  .object({
    equivalentGrams: optionalNumber,
    equivalentMilliliters: optionalNumber,
    name: z.string().trim().min(1, 'Indica el nombre de la porcion.'),
  })
  .refine(
    (value) => value.equivalentGrams || value.equivalentMilliliters,
    {
      message: 'Indica la equivalencia en gramos o mililitros.',
      path: ['equivalentGrams'],
    },
  );

const nutrientSchema = z.object({
  amount: optionalNumber,
  code: z.string().trim().min(1, 'Indica el codigo del nutriente.'),
});

export const nutritionLabelReviewSchema = z.object({
  basisQuantity: positiveNumber('Indica la cantidad base.'),
  basisUnit: z.enum(['GRAM', 'MILLILITER'], 'Selecciona una unidad.'),
  brand: z.string().trim().max(150, 'La marca no puede superar 150 caracteres.'),
  categoryId: z.string().min(1, 'Selecciona una categoria.'),
  description: z.string().trim().max(500, 'La descripcion es demasiado larga.'),
  expiresAt: z.string(),
  location: z.string().trim().max(100, 'La ubicacion es demasiado larga.'),
  minimumQuantity: optionalNumber,
  name: z
    .string()
    .trim()
    .min(1, 'Ingresa el nombre del alimento.')
    .max(150, 'El nombre no puede superar 150 caracteres.'),
  nutrients: z.array(nutrientSchema).min(1, 'Agrega al menos un nutriente.'),
  packageQuantity: positiveNumber('Indica la cantidad del paquete.'),
  packageUnit: z.enum(['GRAM', 'MILLILITER'], 'Selecciona una unidad.'),
  preparationState: z.enum(
    ['RAW', 'COOKED', 'READY_TO_EAT', 'NOT_APPLICABLE'],
    'Selecciona un estado de preparacion.',
  ),
  serving: servingSchema,
});

export type NutritionLabelReviewValues = z.infer<
  typeof nutritionLabelReviewSchema
>;
