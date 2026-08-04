import { Navigate, type RouteObject } from 'react-router';

import { PrivateLayout } from '../layouts/PrivateLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { PublicOnlyRoute } from '../routing/PublicOnlyRoute';
import { RequireAuth } from '../routing/RequireAuth';
import { RequireCompletedOnboarding } from '../routing/RequireCompletedOnboarding';
import { HomePage } from '../../modules/home/presentation/pages/HomePage';
import { HomeHeader } from '../../modules/home/presentation/components/HomeHeader';
import { LoginPage } from '../../modules/auth/presentation/pages/LoginPage';
import { RegisterPage } from '../../modules/auth/presentation/pages/RegisterPage';
import { ReviewEmailPage } from '../../modules/auth/presentation/pages/ReviewEmailPage';
import { OnboardingPage } from '../../modules/onboarding/presentation/pages/OnboardingPage';
import { OnboardingHeader } from '../../modules/onboarding/presentation/components/OnboardingHeader';
import { AcceptHouseholdInvitationPage } from '../../modules/households/presentation/pages/AcceptHouseholdInvitationPage';
import { AdultProfilePage } from '../../modules/households/presentation/pages/AdultProfilePage';
import { AdultProfileHeader } from '../../modules/households/presentation/components/AdultProfileHeader';
import { AdultProfileOverviewPage } from '../../modules/households/presentation/pages/AdultProfileOverviewPage';
import { AdultProfileOverviewHeader } from '../../modules/households/presentation/components/AdultProfileOverviewHeader';
import { HouseholdInvitationsPage } from '../../modules/households/presentation/pages/HouseholdInvitationsPage';
import { HouseholdInvitationsHeader } from '../../modules/households/presentation/components/HouseholdInvitationsHeader';
import { AcceptHouseholdInvitationHeader } from '../../modules/households/presentation/components/AcceptHouseholdInvitationHeader';
import { FamilyPage } from '../../modules/households/presentation/pages/FamilyPage';
import { FamilyHeader } from '../../modules/households/presentation/components/FamilyHeader';
import { FoodCatalogPage } from '../../modules/food-catalog/presentation/pages/FoodCatalogPage';
import { FoodDetailPage } from '../../modules/food-catalog/presentation/pages/FoodDetailPage';
import { FoodDetailHeader } from '../../modules/food-catalog/presentation/components/FoodDetailHeader';
import { CustomFoodFormPage } from '../../modules/food-catalog/presentation/pages/CustomFoodFormPage';
import { NutritionGoalPage } from '../../modules/nutrition-goals/presentation/pages/NutritionGoalPage';
import { NutritionGoalHeader } from '../../modules/nutrition-goals/presentation/components/NutritionGoalHeader';
import { NutritionGoalProposalPage } from '../../modules/nutrition-goals/presentation/pages/NutritionGoalProposalPage';
import { NutritionGoalProposalHeader } from '../../modules/nutrition-goals/presentation/components/NutritionGoalProposalHeader';
import { RegisterMealPage } from '../../modules/meals/presentation/pages/RegisterMealPage';
import { DailyNutritionSummaryPage } from '../../modules/meals/presentation/pages/DailyNutritionSummaryPage';
import { DailyNutritionSummaryHeader } from '../../modules/meals/presentation/components/DailyNutritionSummaryHeader';
import { MealDetailPage } from '../../modules/meals/presentation/pages/MealDetailPage';
import { MealDetailHeader } from '../../modules/meals/presentation/components/MealDetailHeader';
import { EditMealPage } from '../../modules/meals/presentation/pages/EditMealPage';
import { EditMealHeader } from '../../modules/meals/presentation/components/EditMealHeader';
import { DuplicateMealPage } from '../../modules/meals/presentation/pages/DuplicateMealPage';
import { DuplicateMealHeader } from '../../modules/meals/presentation/components/DuplicateMealHeader';
import { RecipeListPage } from '../../modules/recipes/presentation/pages/RecipeListPage';
import { RecipeDetailPage } from '../../modules/recipes/presentation/pages/RecipeDetailPage';
import { RecipeDetailHeader } from '../../modules/recipes/presentation/components/RecipeDetailHeader';
import { RecipeFormPage } from '../../modules/recipes/presentation/pages/RecipeFormPage';
import { StartPreparedBatchPage } from '../../modules/recipes/presentation/pages/StartPreparedBatchPage';
import { StartPreparedBatchHeader } from '../../modules/recipes/presentation/components/StartPreparedBatchHeader';
import { FinalizePreparedBatchPage } from '../../modules/recipes/presentation/pages/FinalizePreparedBatchPage';
import { FinalizePreparedBatchHeader } from '../../modules/recipes/presentation/components/FinalizePreparedBatchHeader';
import { PreparedBatchDetailPage } from '../../modules/recipes/presentation/pages/PreparedBatchDetailPage';
import { PreparedBatchDetailHeader } from '../../modules/recipes/presentation/components/PreparedBatchDetailHeader';
import { ServePreparedBatchPortionsPage } from '../../modules/recipes/presentation/pages/ServePreparedBatchPortionsPage';
import { ServePreparedBatchPortionsHeader } from '../../modules/recipes/presentation/components/ServePreparedBatchPortionsHeader';
import { ConfirmServedPortionConsumptionPage } from '../../modules/recipes/presentation/pages/ConfirmServedPortionConsumptionPage';
import { ConfirmServedPortionConsumptionHeader } from '../../modules/recipes/presentation/components/ConfirmServedPortionConsumptionHeader';
import { CreatePreparedFoodLeftoverPage } from '../../modules/recipes/presentation/pages/CreatePreparedFoodLeftoverPage';
import { CreatePreparedFoodLeftoverHeader } from '../../modules/recipes/presentation/components/CreatePreparedFoodLeftoverHeader';
import { PreparedFoodLeftoversPage } from '../../modules/recipes/presentation/pages/PreparedFoodLeftoversPage';
import { PreparedFoodLeftoversHeader } from '../../modules/recipes/presentation/components/PreparedFoodLeftoversHeader';
import { PreparedFoodLeftoverDetailPage } from '../../modules/recipes/presentation/pages/PreparedFoodLeftoverDetailPage';
import { PreparedBatchInventoryPage } from '../../modules/recipes/presentation/pages/PreparedBatchInventoryPage';
import { InventoryListPage } from '../../modules/inventory/presentation/pages/InventoryListPage';
import { InventoryDetailPage } from '../../modules/inventory/presentation/pages/InventoryDetailPage';
import { InventoryDetailHeader } from '../../modules/inventory/presentation/components/InventoryDetailHeader';
import { InventoryCreatePage } from '../../modules/inventory/presentation/pages/InventoryCreatePage';
import { InventoryAdjustPage } from '../../modules/inventory/presentation/pages/InventoryAdjustPage';
import { InventoryAdjustHeader } from '../../modules/inventory/presentation/components/InventoryAdjustHeader';
import { ConsumePreparedFoodPage } from '../../modules/inventory/presentation/pages/ConsumePreparedFoodPage';
import { ConsumePreparedFoodHeader } from '../../modules/inventory/presentation/components/ConsumePreparedFoodHeader';
import { PurchaseListPage } from '../../modules/purchases/presentation/pages/PurchaseListPage';
import { PurchaseListHeader } from '../../modules/purchases/presentation/components/PurchaseListHeader';
import { PurchaseDetailPage } from '../../modules/purchases/presentation/pages/PurchaseDetailPage';
import { PurchaseDetailHeader } from '../../modules/purchases/presentation/components/PurchaseDetailHeader';
import { PurchaseFormPage } from '../../modules/purchases/presentation/pages/PurchaseFormPage';
import { ShoppingListPage } from '../../modules/shopping-list/presentation/pages/ShoppingListPage';
import { ShoppingListHeader } from '../../modules/shopping-list/presentation/components/ShoppingListHeader';
import { NotFoundPage } from '../../shared/presentation/pages/NotFoundPage';
import { WeeklyPlanPage } from '../../modules/meal-planning/presentation/pages/WeeklyPlanPage';
import { WeeklyPlanHeader } from '../../modules/meal-planning/presentation/components/WeeklyPlanHeader';
import { PlannedMealFormPage } from '../../modules/meal-planning/presentation/pages/PlannedMealFormPage';
import { PlannedMealParticipantsPage } from '../../modules/meal-planning/presentation/pages/PlannedMealParticipantsPage';
import { PlannedMealParticipantsHeader } from '../../modules/meal-planning/presentation/components/PlannedMealParticipantsHeader';
import { PlannedMealQuantitiesPage } from '../../modules/meal-planning/presentation/pages/PlannedMealQuantitiesPage';
import { WeeklyRequirementsPage } from '../../modules/meal-planning/presentation/pages/WeeklyRequirementsPage';
import { InventoryComparisonPage } from '../../modules/meal-planning/presentation/pages/InventoryComparisonPage';
import { PlannedMealPreparationPage } from '../../modules/meal-planning/presentation/pages/PlannedMealPreparationPage';
import { PlannedMealPreparationHeader } from '../../modules/meal-planning/presentation/components/PlannedMealPreparationHeader';
import { WeeklyAdherencePage } from '../../modules/meal-planning/presentation/pages/WeeklyAdherencePage';
import {
  CustomFoodFormHeader,
  FoodCatalogHeader,
  InventoryComparisonHeader,
  InventoryCreateHeader,
  InventoryListHeader,
  PlannedMealFormHeader,
  PlannedMealQuantitiesHeader,
  PreparedBatchInventoryHeader,
  PreparedFoodLeftoverDetailHeader,
  PurchaseFormHeader,
  RecipeCreateHeader,
  RecipeEditHeader,
  RecipeListHeader,
  RegisterMealHeader,
  WeeklyAdherenceHeader,
  WeeklyRequirementsHeader,
} from './pageHeaders';

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          {
            path: '/auth/revisa-tu-correo',
            element: <ReviewEmailPage />,
          },
        ],
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <PrivateLayout />,
        children: [
          {
            path: '/onboarding',
            element: <OnboardingPage />,
            handle: { pageHeader: OnboardingHeader },
          },
          {
            path: '/app/perfil',
            element: <AdultProfileOverviewPage />,
            handle: { pageHeader: AdultProfileOverviewHeader },
          },
          {
            path: '/app/familia',
            element: <FamilyPage />,
            handle: { pageHeader: FamilyHeader },
          },
          {
            path: '/app/perfiles/:profileId',
            element: <AdultProfileOverviewPage />,
            handle: { pageHeader: AdultProfileOverviewHeader },
          },
          {
            path: '/app/perfil/editar',
            element: <AdultProfilePage />,
            handle: { pageHeader: AdultProfileHeader },
          },
          {
            path: '/app/alimentos',
            element: <FoodCatalogPage />,
            handle: { pageHeader: FoodCatalogHeader },
          },
          {
            path: '/app/alimentos/nuevo',
            element: <CustomFoodFormPage />,
            handle: { pageHeader: CustomFoodFormHeader },
          },
          {
            path: '/app/alimentos/:foodId/editar',
            element: <CustomFoodFormPage />,
            handle: { pageHeader: CustomFoodFormHeader },
          },
          {
            path: '/app/alimentos/:foodId',
            element: <FoodDetailPage />,
            handle: { pageHeader: FoodDetailHeader },
          },
          {
            path: '/app/perfiles/:profileId/meta',
            element: <NutritionGoalPage />,
            handle: { pageHeader: NutritionGoalHeader },
          },
          {
            path: '/app/perfiles/:profileId/meta/propuesta',
            element: <NutritionGoalProposalPage />,
            handle: { pageHeader: NutritionGoalProposalHeader },
          },
          {
            path: '/app/comidas/nueva',
            element: <RegisterMealPage />,
            handle: { pageHeader: RegisterMealHeader },
          },
          {
            path: '/app/comidas/:mealId/editar',
            element: <EditMealPage />,
            handle: { pageHeader: EditMealHeader },
          },
          {
            path: '/app/comidas/:mealId/repetir',
            element: <DuplicateMealPage />,
            handle: { pageHeader: DuplicateMealHeader },
          },
          {
            path: '/app/comidas/:mealId',
            element: <MealDetailPage />,
            handle: { pageHeader: MealDetailHeader },
          },
          {
            path: '/app/resumen',
            element: (
              <Navigate
                replace
                to={`/app/resumen/${new Date().toISOString().slice(0, 10)}`}
              />
            ),
          },
          {
            path: '/app/resumen/:date',
            element: <DailyNutritionSummaryPage />,
            handle: { pageHeader: DailyNutritionSummaryHeader },
          },
          {
            path: '/app/recetas',
            element: <RecipeListPage />,
            handle: { pageHeader: RecipeListHeader },
          },
          {
            path: '/app/recetas/nueva',
            element: <RecipeFormPage />,
            handle: { pageHeader: RecipeCreateHeader },
          },
          {
            path: '/app/recetas/:recipeId/editar',
            element: <RecipeFormPage />,
            handle: { pageHeader: RecipeEditHeader },
          },
          {
            path: '/app/recetas/:recipeId',
            element: <RecipeDetailPage />,
            handle: { pageHeader: RecipeDetailHeader },
          },
          {
            path: '/app/preparaciones/nueva',
            element: <StartPreparedBatchPage />,
            handle: { pageHeader: StartPreparedBatchHeader },
          },
          {
            path: '/app/preparaciones/:batchId/finalizar',
            element: <FinalizePreparedBatchPage />,
            handle: { pageHeader: FinalizePreparedBatchHeader },
          },
          {
            path: '/app/preparaciones/:batchId/servir',
            element: <ServePreparedBatchPortionsPage />,
            handle: { pageHeader: ServePreparedBatchPortionsHeader },
          },
          {
            path: '/app/preparaciones/:batchId',
            element: <PreparedBatchDetailPage />,
            handle: { pageHeader: PreparedBatchDetailHeader },
          },
          {
            path: '/app/porciones/:portionId/confirmar',
            element: <ConfirmServedPortionConsumptionPage />,
            handle: { pageHeader: ConfirmServedPortionConsumptionHeader },
          },
          {
            path: '/app/preparaciones/:batchId/sobrante',
            element: <CreatePreparedFoodLeftoverPage />,
            handle: { pageHeader: CreatePreparedFoodLeftoverHeader },
          },
          {
            path: '/app/preparaciones/:batchId/inventario',
            element: <PreparedBatchInventoryPage />,
            handle: { pageHeader: PreparedBatchInventoryHeader },
          },
          {
            path: '/app/sobrantes',
            element: <PreparedFoodLeftoversPage />,
            handle: { pageHeader: PreparedFoodLeftoversHeader },
          },
          {
            path: '/app/sobrantes/:leftoverId',
            element: <PreparedFoodLeftoverDetailPage />,
            handle: { pageHeader: PreparedFoodLeftoverDetailHeader },
          },
          {
            path: '/app/inventario',
            element: <InventoryListPage />,
            handle: { pageHeader: InventoryListHeader },
          },
          {
            path: '/app/inventario/nuevo',
            element: <InventoryCreatePage />,
            handle: { pageHeader: InventoryCreateHeader },
          },
          {
            path: '/app/inventario/:inventoryItemId/ajustar',
            element: <InventoryAdjustPage />,
            handle: { pageHeader: InventoryAdjustHeader },
          },
          {
            path: '/app/inventario/:inventoryItemId/consumir-preparado',
            element: <ConsumePreparedFoodPage />,
            handle: { pageHeader: ConsumePreparedFoodHeader },
          },
          {
            path: '/app/inventario/:inventoryItemId',
            element: <InventoryDetailPage />,
            handle: { pageHeader: InventoryDetailHeader },
          },
          {
            path: '/app/compras',
            element: <PurchaseListPage />,
            handle: { pageHeader: PurchaseListHeader },
          },
          {
            path: '/app/compras/nueva',
            element: <PurchaseFormPage />,
            handle: { pageHeader: PurchaseFormHeader },
          },
          {
            path: '/app/compras/:purchaseId/editar',
            element: <PurchaseFormPage />,
            handle: { pageHeader: PurchaseFormHeader },
          },
          {
            path: '/app/compras/:purchaseId',
            element: <PurchaseDetailPage />,
            handle: { pageHeader: PurchaseDetailHeader },
          },
          {
            path: '/app/lista-de-compras',
            element: <ShoppingListPage />,
            handle: { pageHeader: ShoppingListHeader },
          },
          {
            path: '/app/plan-semanal',
            element: <WeeklyPlanPage />,
            handle: { pageHeader: WeeklyPlanHeader },
          },
          {
            path: '/app/plan-semanal/:weeklyPlanId/comidas/nueva',
            element: <PlannedMealFormPage />,
            handle: { pageHeader: PlannedMealFormHeader },
          },
          {
            path: '/app/plan-semanal/:weeklyPlanId/comidas/:plannedMealId/editar',
            element: <PlannedMealFormPage />,
            handle: { pageHeader: PlannedMealFormHeader },
          },
          {
            path: '/app/plan-semanal/:weeklyPlanId/comidas/:plannedMealId/participantes',
            element: <PlannedMealParticipantsPage />,
            handle: { pageHeader: PlannedMealParticipantsHeader },
          },
          {
            path: '/app/plan-semanal/:weeklyPlanId/comidas/:plannedMealId/cantidades',
            element: <PlannedMealQuantitiesPage />,
            handle: { pageHeader: PlannedMealQuantitiesHeader },
          },
          {
            path: '/app/plan-semanal/:weeklyPlanId/comidas/:plannedMealId/preparar',
            element: <PlannedMealPreparationPage />,
            handle: { pageHeader: PlannedMealPreparationHeader },
          },
          {
            path: '/app/plan-semanal/:weeklyPlanId/requerimientos',
            element: <WeeklyRequirementsPage />,
            handle: { pageHeader: WeeklyRequirementsHeader },
          },
          {
            path: '/app/plan-semanal/:weeklyPlanId/comparacion-inventario',
            element: <InventoryComparisonPage />,
            handle: { pageHeader: InventoryComparisonHeader },
          },
          {
            path: '/app/plan-semanal/:weeklyPlanId/adherencia',
            element: <WeeklyAdherencePage />,
            handle: { pageHeader: WeeklyAdherenceHeader },
          },
          {
            path: '/app/invitaciones',
            element: <HouseholdInvitationsPage />,
            handle: { pageHeader: HouseholdInvitationsHeader },
          },
          {
            element: <RequireCompletedOnboarding />,
            children: [
              {
                path: '/app',
                element: <HomePage />,
                handle: { pageHeader: HomeHeader },
              },
            ],
          },
          {
            path: '/invitaciones/:token',
            element: <AcceptHouseholdInvitationPage />,
            handle: { pageHeader: AcceptHouseholdInvitationHeader },
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
