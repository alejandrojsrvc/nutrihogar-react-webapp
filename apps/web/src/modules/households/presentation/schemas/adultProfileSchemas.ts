import { z } from 'zod';

const dietaryRestrictionTypeSchema = z.enum([
  'ALLERGY',
  'INTOLERANCE',
  'PREFERENCE',
]);

const dietaryRestrictionFormSchema = z.object({
  name: z.string().trim().min(1, 'Indica el nombre de la restriccion.'),
  notes: z
    .string()
    .trim()
    .max(500, 'Las notas no pueden superar los 500 caracteres.'),
  severity: z
    .string()
    .trim()
    .max(100, 'La severidad no puede superar los 100 caracteres.'),
  type: dietaryRestrictionTypeSchema,
});

export const adultProfileFormSchema = z.object({
  activityLevel: z.enum(
    ['SEDENTARY', 'LIGHT', 'MODERATE', 'HIGH', 'VERY_HIGH'],
    'Selecciona tu nivel de actividad.',
  ),
  birthDate: z
    .string()
    .min(1, 'Indica tu fecha de nacimiento.')
    .refine(isValidDateInput, 'Indica una fecha valida.')
    .refine((value) => !isFutureDate(value), {
      message: 'La fecha de nacimiento no puede ser futura.',
    }),
  biologicalSex: z.enum(['MALE', 'FEMALE'], 'Selecciona una opcion.'),
  dietaryRestrictions: z.array(dietaryRestrictionFormSchema),
  hasKitchenScale: z.boolean(),
  weightKg: z
    .string()
    .refine(
      (value) =>
        value.trim() === '' ||
        (Number.isFinite(Number(value)) && Number(value) > 0),
      {
        message: 'El peso debe ser un numero mayor que cero.',
      },
    ),
  heightCm: z
    .string()
    .min(1, 'Indica tu altura.')
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, {
      message: 'La altura debe ser un numero mayor que cero.',
    }),
  name: z.string().trim().min(1, 'Ingresa el nombre del perfil.'),
  primaryGoal: z.enum(
    ['FAT_LOSS', 'MAINTENANCE', 'MUSCLE_GAIN'],
    'Selecciona tu objetivo principal.',
  ),
});

export type AdultProfileFormValues = z.infer<typeof adultProfileFormSchema>;

export function getTodayDateInputValue(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${today.getFullYear()}-${month}-${day}`;
}

function isValidDateInput(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);
  const [year, month, day] = value.split('-').map(Number);

  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
}

function isFutureDate(value: string): boolean {
  return value > getTodayDateInputValue();
}
