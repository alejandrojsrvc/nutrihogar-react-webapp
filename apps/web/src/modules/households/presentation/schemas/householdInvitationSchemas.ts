import { z } from 'zod';

export const createHouseholdInvitationFormSchema = z.object({
  email: z.string().trim().email('Ingresa un correo electrónico válido.'),
  role: z.enum(['ADMIN', 'MEMBER']),
});

export type CreateHouseholdInvitationFormValues = z.infer<
  typeof createHouseholdInvitationFormSchema
>;
