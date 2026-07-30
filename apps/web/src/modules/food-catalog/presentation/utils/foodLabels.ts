import type {
  ConfidenceLevel,
  FoodDetail,
  FoodSummary,
  PreparationState,
  ReferenceUnit,
  SearchPreparationState,
} from '../../application/ports/FoodCatalogGateway';

export const preparationStateLabels: Record<PreparationState, string> = {
  COOKED: 'Cocido',
  NOT_APPLICABLE: 'Sin preparacion',
  RAW: 'Crudo',
  READY_TO_EAT: 'Listo para comer',
};

export const searchPreparationStateLabels: Record<
  SearchPreparationState,
  string
> = {
  COOKED: 'Cocido',
  RAW: 'Crudo',
  READY_TO_EAT: 'Listo para comer',
};

const confidenceLevelLabels: Record<ConfidenceLevel, string> = {
  HIGH: 'Alta',
  LOW: 'Baja',
  MEDIUM: 'Media',
  USER_PROVIDED: 'Proporcionada por el usuario',
  VERIFIED: 'Verificada',
};

const referenceUnitLabels: Record<ReferenceUnit, string> = {
  GRAM: 'g',
  MILLILITER: 'ml',
  UNIT: 'unidad',
};

export function getConfidenceLevelLabel(level: ConfidenceLevel): string {
  return confidenceLevelLabels[level];
}

export function getReferenceUnitLabel(unit: ReferenceUnit): string {
  return referenceUnitLabels[unit];
}

export function formatAmount(value: number | null): string {
  if (value === null) {
    return 'No disponible';
  }

  return new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatReference(food: FoodSummary | FoodDetail): string {
  return `${formatAmount(food.referenceQuantity)} ${getReferenceUnitLabel(food.referenceUnit)}`;
}

export function formatServingUnit(unit: string): string {
  const labels: Record<string, string> = {
    GRAM: 'g',
    MILLILITER: 'ml',
    UNIT: 'unidad',
  };

  return labels[unit] ?? unit.toLowerCase().replaceAll('_', ' ');
}
