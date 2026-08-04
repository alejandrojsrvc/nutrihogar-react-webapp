const labels: Record<string, string> = {
  ACTIVE: 'Activa',
  ADDED_TO_INVENTORY: 'Agregado al inventario',
  ARCHIVED: 'Archivada',
  AVAILABLE: 'Disponible',
  BREAKFAST: 'Desayuno',
  CANCELLED: 'Cancelada',
  CARBOHYDRATE: 'Carbohidratos',
  carbohydrateGrams: 'Carbohidratos',
  calories: 'Calorías',
  CONSUMED: 'Consumido',
  CONSUMED_LATER: 'Consumido después',
  DINNER: 'Cena',
  DISCARDED: 'Descartado',
  DRAFT: 'Ingredientes por confirmar',
  ENERGY_KCAL: 'Calorías',
  EXPIRED: 'Vencido',
  FAT: 'Grasas',
  fatGrams: 'Grasas',
  FINALIZED: 'Finalizada',
  FREEZER: 'Congelador',
  INGREDIENTS_CONFIRMED: 'Ingredientes confirmados',
  LUNCH: 'Almuerzo',
  PANTRY: 'Despensa',
  PARTIAL: 'Disponibilidad parcial',
  PENDING: 'Consumo pendiente',
  PROTEIN: 'Proteína',
  proteinGrams: 'Proteína',
  fiberGrams: 'Fibra',
  REFRIGERATOR: 'Refrigerador',
  SAVED: 'Guardado',
  SHARED: 'Compartido',
  SNACK: 'Merienda',
  SERVED: 'Servida',
  UNAVAILABLE: 'Sin existencias',
};

const units: Record<string, string> = {
  CUP: 'taza',
  GRAM: 'g',
  KILOGRAM: 'kg',
  LITER: 'l',
  MILLILITER: 'ml',
  PIECE: 'unidad',
  SERVING: 'porción',
  TABLESPOON: 'cda.',
  TEASPOON: 'cdta.',
  UNIT: 'unidad',
};

export function humanizeEnum(value: string | null | undefined) {
  if (!value) return 'No indicado';
  return (
    labels[value] ??
    value
      .toLowerCase()
      .replaceAll('_', ' ')
      .replace(/^./, (letter) => letter.toUpperCase())
  );
}

export function humanizeUnit(value: string) {
  return units[value.toUpperCase()] ?? humanizeEnum(value).toLowerCase();
}

export function formatQuantity(quantity: number, unit: string) {
  const amount = new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 2,
  }).format(quantity);
  return `${amount} ${humanizeUnit(unit)}`;
}

export function formatNutrientAmount(amount: number, nutrient: string) {
  const value = new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 2,
  }).format(amount);
  return `${value} ${['ENERGY_KCAL', 'CALORIES', 'calories'].includes(nutrient) ? 'kcal' : 'g'}`;
}

export function statusTone(status: string) {
  if (
    [
      'ACTIVE',
      'ADDED_TO_INVENTORY',
      'AVAILABLE',
      'FINALIZED',
      'CONFIRMED',
      'CONSUMED',
    ].includes(status)
  )
    return 'positive' as const;
  if (['DRAFT', 'INGREDIENTS_CONFIRMED', 'PARTIAL'].includes(status))
    return 'warning' as const;
  if (['CANCELLED', 'DISCARDED', 'EXPIRED', 'UNAVAILABLE'].includes(status))
    return 'danger' as const;
  return 'neutral' as const;
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
