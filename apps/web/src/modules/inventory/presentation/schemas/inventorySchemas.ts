import { z } from 'zod';

const positiveNumber = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, {
      message: 'Ingresa un numero mayor que cero.',
    });
const nonNegativeNumber = (message: string) =>
  z
    .string()
    .trim()
    .refine(
      (value) =>
        value === '' || (Number.isFinite(Number(value)) && Number(value) >= 0),
      { message },
    );

export const createInventorySchema = z.object({
  expiresAt: z.string(),
  foodId: z.string().min(1, 'Selecciona un alimento.'),
  location: z
    .string()
    .max(100, 'La ubicación no puede superar 100 caracteres.'),
  minimumQuantity: nonNegativeNumber('Ingresa un mínimo válido.'),
  quantity: positiveNumber('Indica la cantidad inicial.'),
  reason: z.string().max(200, 'La razón no puede superar 200 caracteres.'),
  unit: z.enum(['GRAM', 'MILLILITER', 'UNIT']),
});

export const adjustInventorySchema = z.object({
  occurredAt: z.string(),
  quantity: z
    .string()
    .trim()
    .min(1, 'Indica la nueva cantidad.')
    .refine((value) => Number.isFinite(Number(value)) && Number(value) >= 0, {
      message: 'Ingresa una cantidad mayor o igual que cero.',
    }),
  reason: z
    .string()
    .trim()
    .min(1, 'Explica la razón del ajuste.')
    .max(200, 'La razón no puede superar 200 caracteres.'),
  unit: z.enum(['GRAM', 'MILLILITER', 'UNIT']),
});

export type CreateInventoryValues = z.infer<typeof createInventorySchema>;
export type AdjustInventoryValues = z.infer<typeof adjustInventorySchema>;

export function formatDateInput(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function parseDateInput(value: string) {
  return value ? new Date(value) : null;
}
