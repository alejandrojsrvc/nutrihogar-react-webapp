export type FoodType = 'GENERIC' | 'COMMERCIAL' | 'CUSTOM' | 'PREPARED';
export type PreparationState =
  | 'RAW'
  | 'COOKED'
  | 'READY_TO_EAT'
  | 'NOT_APPLICABLE';
export type SearchPreparationState = Exclude<
  PreparationState,
  'NOT_APPLICABLE'
>;
export type ReferenceUnit = 'GRAM' | 'MILLILITER' | 'UNIT';
export type ConfidenceLevel =
  | 'VERIFIED'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'USER_PROVIDED';

export interface FoodCategory {
  id: string;
  code: string;
  name: string;
  displayOrder: number;
}

export interface NutrientDefinition {
  id: string;
  code: string;
  name: string;
  unit: string;
  group: string;
  displayOrder: number;
  isRequired: boolean;
}

export interface FoodNutrient {
  id: string;
  nutrientDefinition: NutrientDefinition;
  amount: number;
}

export interface FoodServing {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  equivalentGrams: number | null;
  equivalentMilliliters: number | null;
}

export interface FoodSummary {
  id: string;
  householdId: string | null;
  name: string;
  brand: string | null;
  category: FoodCategory;
  foodType: FoodType;
  preparationState: PreparationState;
  referenceQuantity: number;
  referenceUnit: ReferenceUnit;
  energyKcal: number | null;
  proteinGrams: number | null;
  carbohydrateGrams: number | null;
  fatGrams: number | null;
}

export interface FoodDetail extends FoodSummary {
  description: string | null;
  source: string;
  sourceReference: string | null;
  confidenceLevel: ConfidenceLevel;
  isGlobal: boolean;
  nutrients: FoodNutrient[];
  servings: FoodServing[];
  aliases: string[];
}

export interface FoodSelection {
  food: FoodDetail | FoodSummary;
  quantity: number;
  unit: import('@nutrihogar/domain').MeasurementUnit;
  measurementMethod: import('@nutrihogar/domain').MeasurementMethod;
  servingId?: string;
  servingEquivalent?: number | null;
}

export interface FoodSearchCriteria {
  query?: string;
  categoryId?: string;
  preparationState?: SearchPreparationState;
  page: number;
  limit: number;
}

export interface FoodSearchResult {
  items: FoodSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface FoodNutrientInput {
  nutrientDefinitionId: string;
  amount: number;
}

export interface FoodServingInput {
  name: string;
  quantity: number;
  unit: string;
  equivalentGrams?: number | null;
  equivalentMilliliters?: number | null;
}

export interface CustomFoodInput {
  name: string;
  brand?: string | null;
  categoryId: string;
  preparationState: PreparationState;
  referenceQuantity: number;
  referenceUnit: ReferenceUnit;
  source?: string;
  confidenceLevel: ConfidenceLevel;
  nutrients: FoodNutrientInput[];
  servings: FoodServingInput[];
}

export type UpdateCustomFoodInput = Partial<CustomFoodInput>;

export interface FoodCatalogGateway {
  search(criteria: FoodSearchCriteria): Promise<FoodSearchResult>;
  getById(foodId: string): Promise<FoodDetail>;
  listCategories(): Promise<FoodCategory[]>;
  listNutrients(): Promise<NutrientDefinition[]>;
  createCustomFood(
    householdId: string,
    input: CustomFoodInput,
  ): Promise<FoodDetail>;
  updateCustomFood(
    foodId: string,
    input: UpdateCustomFoodInput,
  ): Promise<FoodDetail>;
  deleteCustomFood(foodId: string): Promise<void>;
}
