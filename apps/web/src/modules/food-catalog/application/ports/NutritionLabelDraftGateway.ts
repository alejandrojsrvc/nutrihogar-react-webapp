import type { FoodDetail } from './FoodCatalogGateway';
import type { InventoryItem } from '../../../inventory/domain/Inventory';

export type NutritionLabelPackageUnit = 'GRAM' | 'MILLILITER';

export interface NutritionLabelUploadInput {
  householdId: string;
  file: File;
  name?: string;
  brand?: string;
  packageQuantity?: string;
  packageUnit?: NutritionLabelPackageUnit;
}

export interface NutritionLabelAmount {
  value: number | string | null;
  unit: string | null;
  description?: string | null;
}

export interface NutritionLabelAllergens {
  contains: string[];
  may_contain: string[];
}

export interface NutritionLabelDeclaration {
  basis: {
    type: string | null;
    unit: string | null;
    value: number | string | null;
  };
  nutrients: Record<string, number | string | null>;
}

export interface NutritionLabelExtractedData {
  brand: string | null;
  warnings: string[];
  allergens: NutritionLabelAllergens | null;
  confidence: number | null;
  ingredients: string[];
  net_content: NutritionLabelAmount | null;
  product_name: string | null;
  serving_size: NutritionLabelAmount | null;
  schema_version: string | null;
  requires_review: boolean;
  nutrition_declarations: NutritionLabelDeclaration[];
  servings_per_container: number | string | null;
}

export interface NutritionLabelDraft {
  id: string;
  householdId: string;
  createdById: string;
  confirmedById: string | null;
  confirmedFoodId: string | null;
  documentHash: string;
  status: string;
  name: string | null;
  brand: string | null;
  packageQuantity: string | null;
  packageUnit: NutritionLabelPackageUnit | null;
  extractedData: NutritionLabelExtractedData;
  warnings: string[];
  missingFields: string[];
  rawText: string | null;
  confidence: number | null;
  expiresAt: string | null;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionLabelConfirmInput {
  name: string;
  brand: string;
  description: string;
  categoryId: string;
  targetFoodId?: string;
  preparationState: string;
  packageQuantity: string;
  packageUnit: NutritionLabelPackageUnit;
  minimumQuantity?: string;
  location?: string;
  expiresAt?: string;
  basisQuantity: string;
  basisUnit: NutritionLabelPackageUnit;
  nutrients: Array<{ code: string; amount: string }>;
  serving: {
    name: string;
    quantity: string;
    unit: string;
    equivalentGrams?: string;
    equivalentMilliliters?: string;
  };
}

export interface NutritionLabelConfirmation {
  food: FoodDetail;
  inventory: InventoryItem;
}

export interface NutritionLabelDraftGateway {
  createDraft(input: NutritionLabelUploadInput): Promise<NutritionLabelDraft>;
  getDraft(
    householdId: string,
    draftId: string,
  ): Promise<NutritionLabelDraft>;
  confirmDraft(
    householdId: string,
    draftId: string,
    input: NutritionLabelConfirmInput,
  ): Promise<NutritionLabelConfirmation>;
}
