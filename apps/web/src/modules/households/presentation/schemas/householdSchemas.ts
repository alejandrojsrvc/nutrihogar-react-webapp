import { z } from 'zod';

export const createHouseholdFormSchema = z.object({
  currency: z.string().length(3, 'Selecciona una moneda.'),
  name: z
    .string()
    .trim()
    .min(1, 'Escribe un nombre para tu hogar.')
    .max(150, 'El nombre no puede superar los 150 caracteres.'),
  timezone: z
    .string()
    .trim()
    .min(1, 'Indica la zona horaria del hogar.')
    .max(64, 'La zona horaria no puede superar los 64 caracteres.'),
});

export type CreateHouseholdFormValues = z.infer<
  typeof createHouseholdFormSchema
>;

export function getDefaultTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}
