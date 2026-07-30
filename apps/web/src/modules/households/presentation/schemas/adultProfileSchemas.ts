import { z } from 'zod';

const requiredOption = (message: string) =>
  z.string().refine((value) => value !== '', message);

export const createAdultProfileFormSchema = z.object({
  activityLevel: requiredOption('Selecciona tu nivel de actividad.'),
  birthDate: z.string().min(1, 'Indica tu fecha de nacimiento.'),
  biologicalSex: requiredOption('Selecciona una opcion.'),
  hasKitchenScale: z.boolean(),
  heightCm: z
    .string()
    .min(1, 'Indica tu altura.')
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, {
      message: 'La altura debe ser un numero mayor que cero.',
    }),
  name: z.string().trim().min(1, 'Ingresa el nombre del perfil.'),
  primaryGoal: requiredOption('Selecciona tu objetivo principal.'),
});

export type CreateAdultProfileFormValues = z.infer<
  typeof createAdultProfileFormSchema
>;
