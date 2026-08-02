import { z } from 'zod';

const positiveNumber = (message: string) => z.string().trim().min(1, message).refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, { message });

export const purchaseSchema = z.object({
  currency: z.string().trim().min(1, 'Indica la moneda.'),
  purchaseDate: z.string().min(1, 'Indica la fecha de compra.'),
  storeName: z.string().trim().min(1, 'Indica el comercio.'),
  total: positiveNumber('Indica un total mayor que cero.'),
});

export type PurchaseFormValues = z.infer<typeof purchaseSchema>;

export function parseDateInput(value: string) {
  return new Date(value);
}

export function formatDateInput(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
