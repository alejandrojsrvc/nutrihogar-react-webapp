import { createApiClient, type ApiClient } from '@nutrihogar/api-client';

import { createSupabaseAuthSessionGateway } from '../../shared/infrastructure/auth/SupabaseAuthSessionGateway';
import { UnavailableAuthSessionGateway } from '../../shared/infrastructure/auth/UnavailableAuthSessionGateway';
import { SyncCurrentUserUseCase } from '../../modules/auth/application/use-cases/SyncCurrentUserUseCase';
import { CreateAdultProfileUseCase } from '../../modules/households/application/use-cases/CreateAdultProfileUseCase';
import { GetFoodDetailUseCase } from '../../modules/food-catalog/application/use-cases/GetFoodDetailUseCase';
import { ListFoodCategoriesUseCase } from '../../modules/food-catalog/application/use-cases/ListFoodCategoriesUseCase';
import { ListFoodNutrientsUseCase } from '../../modules/food-catalog/application/use-cases/ListFoodNutrientsUseCase';
import { SearchFoodsUseCase } from '../../modules/food-catalog/application/use-cases/SearchFoodsUseCase';
import { CreateCustomFoodUseCase } from '../../modules/food-catalog/application/use-cases/CreateCustomFoodUseCase';
import { DeleteCustomFoodUseCase } from '../../modules/food-catalog/application/use-cases/DeleteCustomFoodUseCase';
import { UpdateCustomFoodUseCase } from '../../modules/food-catalog/application/use-cases/UpdateCustomFoodUseCase';
import {
  ConfirmNutritionGoalSuggestionUseCase,
  GenerateNutritionGoalSuggestionUseCase,
  GetCurrentNutritionGoalUseCase,
} from '../../modules/nutrition-goals/application/use-cases/NutritionGoalUseCases';
import { HttpNutritionGoalGateway } from '../../modules/nutrition-goals/infrastructure/http/HttpNutritionGoalGateway';
import { RegisterMealUseCase } from '../../modules/meals/application/use-cases/RegisterMealUseCase';
import { HttpMealGateway } from '../../modules/meals/infrastructure/http/HttpMealGateway';
import { GetMealDetailsUseCase } from '../../modules/meals/application/use-cases/GetMealDetailsUseCase';
import { GetDailyNutritionSummaryUseCase } from '../../modules/meals/application/use-cases/GetDailyNutritionSummaryUseCase';
import { UpdateMealUseCase } from '../../modules/meals/application/use-cases/UpdateMealUseCase';
import { CancelMealUseCase } from '../../modules/meals/application/use-cases/CancelMealUseCase';
import { DuplicateMealUseCase } from '../../modules/meals/application/use-cases/DuplicateMealUseCase';
import { HttpDailyNutritionSummaryGateway } from '../../modules/meals/infrastructure/http/HttpDailyNutritionSummaryGateway';
import { AcceptHouseholdInvitationUseCase } from '../../modules/households/application/use-cases/AcceptHouseholdInvitationUseCase';
import { CreateHouseholdInvitationUseCase } from '../../modules/households/application/use-cases/CreateHouseholdInvitationUseCase';
import { CreateHouseholdUseCase } from '../../modules/households/application/use-cases/CreateHouseholdUseCase';
import { GetHouseholdInvitationTokenUseCase } from '../../modules/households/application/use-cases/GetHouseholdInvitationTokenUseCase';
import { ListHouseholdInvitationsUseCase } from '../../modules/households/application/use-cases/ListHouseholdInvitationsUseCase';
import { RememberHouseholdInvitationTokenUseCase } from '../../modules/households/application/use-cases/RememberHouseholdInvitationTokenUseCase';
import { ListAdultProfilesUseCase } from '../../modules/households/application/use-cases/ListAdultProfilesUseCase';
import { ListHouseholdsUseCase } from '../../modules/households/application/use-cases/ListHouseholdsUseCase';
import { ResolveActiveHouseholdUseCase } from '../../modules/households/application/use-cases/ResolveActiveHouseholdUseCase';
import { SelectActiveHouseholdUseCase } from '../../modules/households/application/use-cases/SelectActiveHouseholdUseCase';
import { UpdateAdultProfileUseCase } from '../../modules/households/application/use-cases/UpdateAdultProfileUseCase';
import { CheckHealthUseCase } from '../../shared/application/use-cases/CheckHealthUseCase';
import { ResolveOnboardingStepUseCase } from '../../modules/onboarding/application/use-cases/ResolveOnboardingStepUseCase';
import { HttpCurrentUserGateway } from '../../shared/infrastructure/http/HttpCurrentUserGateway';
import { HttpAdultProfileGateway } from '../../shared/infrastructure/http/HttpAdultProfileGateway';
import { HttpHealthGateway } from '../../shared/infrastructure/http/HttpHealthGateway';
import { HttpFoodCatalogGateway } from '../../shared/infrastructure/http/HttpFoodCatalogGateway';
import { HttpHouseholdGateway } from '../../shared/infrastructure/http/HttpHouseholdGateway';
import { HttpHouseholdInvitationGateway } from '../../shared/infrastructure/http/HttpHouseholdInvitationGateway';
import { LocalStorageActiveHouseholdGateway } from '../../shared/infrastructure/storage/LocalStorageActiveHouseholdGateway';
import { LocalStorageAdultProfileDraftStorage } from '../../shared/infrastructure/storage/LocalStorageAdultProfileDraftStorage';
import { LocalStorageHouseholdInvitationLinkGateway } from '../../shared/infrastructure/storage/LocalStorageHouseholdInvitationLinkGateway';
import { HttpInventoryGateway } from '../../modules/inventory/infrastructure/http/HttpInventoryGateway';
import { HttpInventorySyncGateway } from '../../modules/inventory/infrastructure/http/HttpInventorySyncGateway';
import { DexieInventoryLocalRepository } from '../../modules/inventory/infrastructure/storage/DexieInventoryLocalRepository';
import { BrowserConnectivityGateway } from '../../modules/inventory/infrastructure/storage/BrowserConnectivityGateway';
import { getInventoryDeviceId } from '../../modules/inventory/infrastructure/storage/InventoryDeviceId';
import {
  AdjustInventoryItemUseCase,
  ConsumeInventoryItemUseCase,
  CreateManualInventoryItemUseCase,
  GetInventorySyncStatusUseCase,
  GetInventoryItemUseCase,
  ArchiveInventoryItemUseCase,
  ListInventoryMovementsUseCase,
  ListPendingInventoryOperationsUseCase,
  ListInventoryConflictOperationsUseCase,
  DiscardInventoryOperationUseCase,
  RetryInventoryOperationUseCase,
  LoadInventoryUseCase,
  SynchronizeInventoryUseCase,
  UpdateInventoryItemUseCase,
  ConsumePreparedFoodUseCase,
  WasteInventoryItemUseCase,
  ExpireInventoryItemUseCase,
} from '../../modules/inventory/application/use-cases/InventoryUseCases';
import type { AuthSessionGateway } from '../../modules/auth/application/ports/AuthSessionGateway';
import { HttpRecipeGateway } from '../../modules/recipes/infrastructure/http/HttpRecipeGateway';
import { CreateRecipeUseCase } from '../../modules/recipes/application/use-cases/CreateRecipeUseCase';
import { UpdateRecipeUseCase } from '../../modules/recipes/application/use-cases/UpdateRecipeUseCase';
import { LoadRecipeUseCase } from '../../modules/recipes/application/use-cases/LoadRecipeUseCase';
import { ListRecipesUseCase } from '../../modules/recipes/application/use-cases/ListRecipesUseCase';
import { ArchiveRecipeUseCase } from '../../modules/recipes/application/use-cases/ArchiveRecipeUseCase';
import { LoadRecipeNutritionUseCase } from '../../modules/recipes/application/use-cases/LoadRecipeNutritionUseCase';
import { HttpPreparedBatchGateway } from '../../modules/recipes/infrastructure/http/HttpPreparedBatchGateway';
import { HttpServedPortionGateway } from '../../modules/recipes/infrastructure/http/HttpServedPortionGateway';
import { HttpServedPortionConsumptionGateway } from '../../modules/recipes/infrastructure/http/HttpServedPortionConsumptionGateway';
import { HttpPreparedFoodLeftoverGateway } from '../../modules/recipes/infrastructure/http/HttpPreparedFoodLeftoverGateway';
import { HttpPreparedBatchInventoryGateway } from '../../modules/recipes/infrastructure/http/HttpPreparedBatchInventoryGateway';
import { LoadPreparedBatchUseCase } from '../../modules/recipes/application/use-cases/LoadPreparedBatchUseCase';
import { LoadPreparedBatchDetailsUseCase } from '../../modules/recipes/application/use-cases/LoadPreparedBatchDetailsUseCase';
import { StartPreparedBatchUseCase } from '../../modules/recipes/application/use-cases/StartPreparedBatchUseCase';
import { UpdatePreparedBatchIngredientsUseCase } from '../../modules/recipes/application/use-cases/UpdatePreparedBatchIngredientsUseCase';
import { ConfirmPreparedBatchIngredientsUseCase } from '../../modules/recipes/application/use-cases/ConfirmPreparedBatchIngredientsUseCase';
import { FinalizePreparedBatchUseCase } from '../../modules/recipes/application/use-cases/FinalizePreparedBatchUseCase';
import { CancelPreparedBatchUseCase } from '../../modules/recipes/application/use-cases/CancelPreparedBatchUseCase';
import { ServePreparedBatchPortionsUseCase } from '../../modules/recipes/application/use-cases/ServePreparedBatchPortionsUseCase';
import { ConfirmServedPortionConsumptionUseCase } from '../../modules/recipes/application/use-cases/ConfirmServedPortionConsumptionUseCase';
import {
  CreatePreparedFoodLeftoverUseCase,
  GetPreparedFoodLeftoverUseCase,
  ListPreparedFoodLeftoversUseCase,
  UpdatePreparedFoodLeftoverStatusUseCase,
  AddPreparedFoodLeftoverToInventoryUseCase,
} from '../../modules/recipes/application/use-cases/PreparedFoodLeftoverUseCases';
import {
  ConfirmPreparedBatchInventoryUseCase,
  LoadPreparedBatchInventoryPreviewUseCase,
} from '../../modules/recipes/application/use-cases/PreparedBatchInventoryUseCases';
import { HttpPurchaseGateway } from '../../modules/purchases/infrastructure/http/HttpPurchaseGateway';
import { HttpShoppingListGateway } from '../../modules/shopping-list/infrastructure/http/HttpShoppingListGateway';
import { HttpMealPlanningGateway } from '../../modules/meal-planning/infrastructure/http/HttpMealPlanningGateway';
import {
  ListWeeklyPlansUseCase,
  LoadWeeklyPlanUseCase,
  CreateWeeklyPlanUseCase,
  AddPlannedMealUseCase,
  UpdatePlannedMealUseCase,
  AssignParticipantUseCase,
  DeleteParticipantUseCase,
  ProposeQuantitiesUseCase,
  ListQuantitiesUseCase,
  AcceptQuantitySuggestionsUseCase,
  UpdateParticipantUseCase,
  GetRequirementsUseCase,
  CompareInventoryUseCase,
  AddMissingShoppingItemsUseCase,
  GetAdherenceUseCase,
  GetPreparationUseCase,
  PreparePlannedMealUseCase,
  LinkConsumptionUseCase,
} from '../../modules/meal-planning/application/use-cases/MealPlanningUseCases';
import {
  CancelPurchaseUseCase,
  ConfirmPurchaseUseCase,
  CreatePurchaseUseCase,
  ListPurchasesUseCase,
  LoadPurchaseUseCase,
  UpdatePurchaseUseCase,
} from '../../modules/purchases/application/use-cases/PurchaseUseCases';
import {
  AddShoppingListItemUseCase,
  ConvertShoppingListToPurchaseUseCase,
  GenerateShoppingListUseCase,
  LoadShoppingListUseCase,
  MarkShoppingListItemPurchasedUseCase,
  RemoveShoppingListItemUseCase,
  UpdateShoppingListItemUseCase,
} from '../../modules/shopping-list/application/use-cases/ShoppingListUseCases';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const authSessionGateway: AuthSessionGateway =
  supabaseUrl && supabasePublishableKey
    ? createSupabaseAuthSessionGateway({
        publishableKey: supabasePublishableKey,
        redirectTo: new URL('/onboarding', window.location.origin).toString(),
        url: supabaseUrl,
      })
    : new UnavailableAuthSessionGateway();

export const apiClient: ApiClient = createApiClient({
  baseUrl: apiBaseUrl,
  getAccessToken: async () =>
    (await authSessionGateway.getSession())?.accessToken,
});

const healthGateway = new HttpHealthGateway(apiClient);
const foodCatalogGateway = new HttpFoodCatalogGateway(apiClient);
const nutritionGoalGateway = new HttpNutritionGoalGateway(apiClient);
const mealGateway = new HttpMealGateway(apiClient);
const dailyNutritionSummaryGateway = new HttpDailyNutritionSummaryGateway(
  apiClient,
);
const recipeGateway = new HttpRecipeGateway(apiClient);
const preparedBatchGateway = new HttpPreparedBatchGateway(apiClient);
const servedPortionGateway = new HttpServedPortionGateway(apiClient);
const servedPortionConsumptionGateway = new HttpServedPortionConsumptionGateway(
  apiClient,
);
const preparedFoodLeftoverGateway = new HttpPreparedFoodLeftoverGateway(
  apiClient,
);
const preparedBatchInventoryGateway = new HttpPreparedBatchInventoryGateway(
  apiClient,
);
const currentUserGateway = new HttpCurrentUserGateway(apiClient);
const adultProfileGateway = new HttpAdultProfileGateway(apiClient);
const householdGateway = new HttpHouseholdGateway(apiClient);
const householdInvitationGateway = new HttpHouseholdInvitationGateway(
  apiClient,
);
const activeHouseholdGateway = new LocalStorageActiveHouseholdGateway();
export const adultProfileDraftStorage =
  new LocalStorageAdultProfileDraftStorage();
const householdInvitationLinkGateway =
  new LocalStorageHouseholdInvitationLinkGateway();
const inventoryGateway = new HttpInventoryGateway(apiClient);
const inventorySyncGateway = new HttpInventorySyncGateway(apiClient);
const inventoryLocalRepository = new DexieInventoryLocalRepository();
const connectivityGateway = new BrowserConnectivityGateway();
const purchaseGateway = new HttpPurchaseGateway(apiClient);
const shoppingListGateway = new HttpShoppingListGateway(apiClient);
const mealPlanningGateway = new HttpMealPlanningGateway(apiClient);

export const syncCurrentUserUseCase = new SyncCurrentUserUseCase(
  currentUserGateway,
);
export const checkHealthUseCase = new CheckHealthUseCase(healthGateway);
export const searchFoodsUseCase = new SearchFoodsUseCase(foodCatalogGateway);
export const getFoodDetailUseCase = new GetFoodDetailUseCase(
  foodCatalogGateway,
);
export const listFoodCategoriesUseCase = new ListFoodCategoriesUseCase(
  foodCatalogGateway,
);
export const listFoodNutrientsUseCase = new ListFoodNutrientsUseCase(
  foodCatalogGateway,
);
export const createCustomFoodUseCase = new CreateCustomFoodUseCase(
  foodCatalogGateway,
);
export const updateCustomFoodUseCase = new UpdateCustomFoodUseCase(
  foodCatalogGateway,
);
export const deleteCustomFoodUseCase = new DeleteCustomFoodUseCase(
  foodCatalogGateway,
);
export const generateNutritionGoalSuggestionUseCase =
  new GenerateNutritionGoalSuggestionUseCase(nutritionGoalGateway);
export const confirmNutritionGoalSuggestionUseCase =
  new ConfirmNutritionGoalSuggestionUseCase(nutritionGoalGateway);
export const getCurrentNutritionGoalUseCase =
  new GetCurrentNutritionGoalUseCase(nutritionGoalGateway);
export const registerMealUseCase = new RegisterMealUseCase(mealGateway);
export const getMealDetailsUseCase = new GetMealDetailsUseCase(mealGateway);
export const updateMealUseCase = new UpdateMealUseCase(mealGateway);
export const cancelMealUseCase = new CancelMealUseCase(mealGateway);
export const duplicateMealUseCase = new DuplicateMealUseCase(mealGateway);
export const getDailyNutritionSummaryUseCase =
  new GetDailyNutritionSummaryUseCase(dailyNutritionSummaryGateway);
export const createRecipeUseCase = new CreateRecipeUseCase(recipeGateway);
export const updateRecipeUseCase = new UpdateRecipeUseCase(recipeGateway);
export const loadRecipeUseCase = new LoadRecipeUseCase(recipeGateway);
export const listRecipesUseCase = new ListRecipesUseCase(recipeGateway);
export const archiveRecipeUseCase = new ArchiveRecipeUseCase(recipeGateway);
export const loadRecipeNutritionUseCase = new LoadRecipeNutritionUseCase(
  recipeGateway,
);
export const loadPreparedBatchUseCase = new LoadPreparedBatchUseCase(
  preparedBatchGateway,
);
export const loadPreparedBatchDetailsUseCase =
  new LoadPreparedBatchDetailsUseCase(preparedBatchGateway);
export const startPreparedBatchUseCase = new StartPreparedBatchUseCase(
  preparedBatchGateway,
);
export const updatePreparedBatchIngredientsUseCase =
  new UpdatePreparedBatchIngredientsUseCase(preparedBatchGateway);
export const confirmPreparedBatchIngredientsUseCase =
  new ConfirmPreparedBatchIngredientsUseCase(preparedBatchGateway);
export const finalizePreparedBatchUseCase = new FinalizePreparedBatchUseCase(
  preparedBatchGateway,
);
export const cancelPreparedBatchUseCase = new CancelPreparedBatchUseCase(
  preparedBatchGateway,
);
export const servePreparedBatchPortionsUseCase =
  new ServePreparedBatchPortionsUseCase(servedPortionGateway);
export const confirmServedPortionConsumptionUseCase =
  new ConfirmServedPortionConsumptionUseCase(servedPortionConsumptionGateway);
export const createPreparedFoodLeftoverUseCase =
  new CreatePreparedFoodLeftoverUseCase(preparedFoodLeftoverGateway);
export const listPreparedFoodLeftoversUseCase =
  new ListPreparedFoodLeftoversUseCase(preparedFoodLeftoverGateway);
export const getPreparedFoodLeftoverUseCase =
  new GetPreparedFoodLeftoverUseCase(preparedFoodLeftoverGateway);
export const updatePreparedFoodLeftoverStatusUseCase =
  new UpdatePreparedFoodLeftoverStatusUseCase(preparedFoodLeftoverGateway);
export const addPreparedFoodLeftoverToInventoryUseCase =
  new AddPreparedFoodLeftoverToInventoryUseCase(preparedFoodLeftoverGateway);
export const loadPreparedBatchInventoryPreviewUseCase =
  new LoadPreparedBatchInventoryPreviewUseCase(preparedBatchInventoryGateway);
export const confirmPreparedBatchInventoryUseCase =
  new ConfirmPreparedBatchInventoryUseCase(preparedBatchInventoryGateway);
export const listHouseholdsUseCase = new ListHouseholdsUseCase(
  householdGateway,
);
export const createHouseholdUseCase = new CreateHouseholdUseCase(
  householdGateway,
);
export const listHouseholdInvitationsUseCase =
  new ListHouseholdInvitationsUseCase(householdInvitationGateway);
export const createHouseholdInvitationUseCase =
  new CreateHouseholdInvitationUseCase(householdInvitationGateway);
export const acceptHouseholdInvitationUseCase =
  new AcceptHouseholdInvitationUseCase(householdInvitationGateway);
export const getHouseholdInvitationTokenUseCase =
  new GetHouseholdInvitationTokenUseCase(householdInvitationLinkGateway);
export const rememberHouseholdInvitationTokenUseCase =
  new RememberHouseholdInvitationTokenUseCase(householdInvitationLinkGateway);
export const loadInventoryUseCase = new LoadInventoryUseCase(
  inventoryGateway,
  inventoryLocalRepository,
  connectivityGateway,
);
export const getInventoryItemUseCase = new GetInventoryItemUseCase(
  inventoryGateway,
  inventoryLocalRepository,
  connectivityGateway,
);
export const createManualInventoryItemUseCase =
  new CreateManualInventoryItemUseCase(inventoryGateway, connectivityGateway);
export const adjustInventoryItemUseCase = new AdjustInventoryItemUseCase(
  inventoryGateway,
  inventoryLocalRepository,
  connectivityGateway,
);
export const consumeInventoryItemUseCase = new ConsumeInventoryItemUseCase(
  inventoryGateway,
  inventoryLocalRepository,
  connectivityGateway,
);
export const wasteInventoryItemUseCase = new WasteInventoryItemUseCase(
  inventoryGateway,
  inventoryLocalRepository,
  connectivityGateway,
);
export const expireInventoryItemUseCase = new ExpireInventoryItemUseCase(
  inventoryGateway,
  inventoryLocalRepository,
  connectivityGateway,
);
export const updateInventoryItemUseCase = new UpdateInventoryItemUseCase(
  inventoryGateway,
);
export const consumePreparedFoodUseCase = new ConsumePreparedFoodUseCase(
  inventoryGateway,
);
export const archiveInventoryItemUseCase = new ArchiveInventoryItemUseCase(
  inventoryGateway,
);
export const listInventoryMovementsUseCase = new ListInventoryMovementsUseCase(
  inventoryGateway,
);
export const listPendingInventoryOperationsUseCase =
  new ListPendingInventoryOperationsUseCase(inventoryLocalRepository);
export const listInventoryConflictOperationsUseCase =
  new ListInventoryConflictOperationsUseCase(inventoryLocalRepository);
export const discardInventoryOperationUseCase =
  new DiscardInventoryOperationUseCase(inventoryLocalRepository);
export const retryInventoryOperationUseCase =
  new RetryInventoryOperationUseCase(inventoryLocalRepository);
export const synchronizeInventoryUseCase = new SynchronizeInventoryUseCase(
  inventorySyncGateway,
  inventoryLocalRepository,
  connectivityGateway,
  getInventoryDeviceId(),
);
export const getInventorySyncStatusUseCase = new GetInventorySyncStatusUseCase(
  inventoryLocalRepository,
  connectivityGateway,
);
export const listPurchasesUseCase = new ListPurchasesUseCase(purchaseGateway);
export const loadPurchaseUseCase = new LoadPurchaseUseCase(purchaseGateway);
export const createPurchaseUseCase = new CreatePurchaseUseCase(purchaseGateway);
export const updatePurchaseUseCase = new UpdatePurchaseUseCase(purchaseGateway);
export const confirmPurchaseUseCase = new ConfirmPurchaseUseCase(
  purchaseGateway,
);
export const cancelPurchaseUseCase = new CancelPurchaseUseCase(purchaseGateway);
export const loadShoppingListUseCase = new LoadShoppingListUseCase(
  shoppingListGateway,
);
export const addShoppingListItemUseCase = new AddShoppingListItemUseCase(
  shoppingListGateway,
);
export const updateShoppingListItemUseCase = new UpdateShoppingListItemUseCase(
  shoppingListGateway,
);
export const removeShoppingListItemUseCase = new RemoveShoppingListItemUseCase(
  shoppingListGateway,
);
export const markShoppingListItemPurchasedUseCase =
  new MarkShoppingListItemPurchasedUseCase(shoppingListGateway);
export const generateShoppingListUseCase = new GenerateShoppingListUseCase(
  shoppingListGateway,
);
export const convertShoppingListToPurchaseUseCase =
  new ConvertShoppingListToPurchaseUseCase(shoppingListGateway);
export const listWeeklyPlansUseCase = new ListWeeklyPlansUseCase(
  mealPlanningGateway,
);
export const loadWeeklyPlanUseCase = new LoadWeeklyPlanUseCase(
  mealPlanningGateway,
);
export const createWeeklyPlanUseCase = new CreateWeeklyPlanUseCase(
  mealPlanningGateway,
);
export const addPlannedMealUseCase = new AddPlannedMealUseCase(
  mealPlanningGateway,
);
export const updatePlannedMealUseCase = new UpdatePlannedMealUseCase(
  mealPlanningGateway,
);
export const assignParticipantUseCase = new AssignParticipantUseCase(
  mealPlanningGateway,
);
export const deleteParticipantUseCase = new DeleteParticipantUseCase(
  mealPlanningGateway,
);
export const proposeQuantitiesUseCase = new ProposeQuantitiesUseCase(
  mealPlanningGateway,
);
export const listQuantitiesUseCase = new ListQuantitiesUseCase(
  mealPlanningGateway,
);
export const acceptQuantitySuggestionsUseCase =
  new AcceptQuantitySuggestionsUseCase(mealPlanningGateway);
export const updateParticipantUseCase = new UpdateParticipantUseCase(
  mealPlanningGateway,
);
export const getRequirementsUseCase = new GetRequirementsUseCase(
  mealPlanningGateway,
);
export const compareInventoryUseCase = new CompareInventoryUseCase(
  mealPlanningGateway,
);
export const addMissingShoppingItemsUseCase =
  new AddMissingShoppingItemsUseCase(mealPlanningGateway);
export const getAdherenceUseCase = new GetAdherenceUseCase(mealPlanningGateway);
export const getPreparationUseCase = new GetPreparationUseCase(
  mealPlanningGateway,
);
export const preparePlannedMealUseCase = new PreparePlannedMealUseCase(
  mealPlanningGateway,
);
export const linkConsumptionUseCase = new LinkConsumptionUseCase(
  mealPlanningGateway,
);
export const listAdultProfilesUseCase = new ListAdultProfilesUseCase(
  adultProfileGateway,
);
export const createAdultProfileUseCase = new CreateAdultProfileUseCase(
  adultProfileGateway,
);
export const updateAdultProfileUseCase = new UpdateAdultProfileUseCase(
  adultProfileGateway,
);
export const resolveOnboardingStepUseCase = new ResolveOnboardingStepUseCase();
export const resolveActiveHouseholdUseCase = new ResolveActiveHouseholdUseCase(
  activeHouseholdGateway,
);
export const selectActiveHouseholdUseCase = new SelectActiveHouseholdUseCase(
  activeHouseholdGateway,
);
