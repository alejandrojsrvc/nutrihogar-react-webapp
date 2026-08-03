import { z } from 'zod';

export const shoppingListItemSchema = z.object({
  name: z.string().trim().min(1, 'Indica el producto.'),
  quantity: z
    .string()
    .trim()
    .min(1, 'Indica la cantidad.')
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, {
      message: 'La cantidad debe ser mayor que cero.',
    }),
  unit: z.string().trim().min(1, 'Indica la unidad.'),
});

export type ShoppingListItemFormValues = z.infer<typeof shoppingListItemSchema>;
