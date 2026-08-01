import { Navigate, type RouteObject } from 'react-router';

import { PrivateLayout } from '../layouts/PrivateLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { PublicOnlyRoute } from '../routing/PublicOnlyRoute';
import { RequireAuth } from '../routing/RequireAuth';
import { RequireCompletedOnboarding } from '../routing/RequireCompletedOnboarding';
import { HomePage } from '../../modules/home/presentation/pages/HomePage';
import { LoginPage } from '../../modules/auth/presentation/pages/LoginPage';
import { RegisterPage } from '../../modules/auth/presentation/pages/RegisterPage';
import { ReviewEmailPage } from '../../modules/auth/presentation/pages/ReviewEmailPage';
import { OnboardingPage } from '../../modules/onboarding/presentation/pages/OnboardingPage';
import { AcceptHouseholdInvitationPage } from '../../modules/households/presentation/pages/AcceptHouseholdInvitationPage';
import { AdultProfilePage } from '../../modules/households/presentation/pages/AdultProfilePage';
import { HouseholdInvitationsPage } from '../../modules/households/presentation/pages/HouseholdInvitationsPage';
import { FoodCatalogPage } from '../../modules/food-catalog/presentation/pages/FoodCatalogPage';
import { FoodDetailPage } from '../../modules/food-catalog/presentation/pages/FoodDetailPage';
import { CustomFoodFormPage } from '../../modules/food-catalog/presentation/pages/CustomFoodFormPage';
import { NutritionGoalPage } from '../../modules/nutrition-goals/presentation/pages/NutritionGoalPage';
import { NutritionGoalProposalPage } from '../../modules/nutrition-goals/presentation/pages/NutritionGoalProposalPage';
import { RegisterMealPage } from '../../modules/meals/presentation/pages/RegisterMealPage';
import { DailyNutritionSummaryPage } from '../../modules/meals/presentation/pages/DailyNutritionSummaryPage';
import { MealDetailPage } from '../../modules/meals/presentation/pages/MealDetailPage';
import { EditMealPage } from '../../modules/meals/presentation/pages/EditMealPage';
import { DuplicateMealPage } from '../../modules/meals/presentation/pages/DuplicateMealPage';
import { RecipeListPage } from '../../modules/recipes/presentation/pages/RecipeListPage';
import { RecipeDetailPage } from '../../modules/recipes/presentation/pages/RecipeDetailPage';
import { RecipeFormPage } from '../../modules/recipes/presentation/pages/RecipeFormPage';
import { StartPreparedBatchPage } from '../../modules/recipes/presentation/pages/StartPreparedBatchPage';
import { FinalizePreparedBatchPage } from '../../modules/recipes/presentation/pages/FinalizePreparedBatchPage';
import { PreparedBatchDetailPage } from '../../modules/recipes/presentation/pages/PreparedBatchDetailPage';
import { ServePreparedBatchPortionsPage } from '../../modules/recipes/presentation/pages/ServePreparedBatchPortionsPage';
import { ConfirmServedPortionConsumptionPage } from '../../modules/recipes/presentation/pages/ConfirmServedPortionConsumptionPage';
import { CreatePreparedFoodLeftoverPage } from '../../modules/recipes/presentation/pages/CreatePreparedFoodLeftoverPage';
import { PreparedFoodLeftoversPage } from '../../modules/recipes/presentation/pages/PreparedFoodLeftoversPage';
import { PreparedFoodLeftoverDetailPage } from '../../modules/recipes/presentation/pages/PreparedFoodLeftoverDetailPage';
import { InventoryListPage } from '../../modules/inventory/presentation/pages/InventoryListPage';
import { NotFoundPage } from '../../shared/presentation/pages/NotFoundPage';

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
          { path: '/onboarding', element: <OnboardingPage /> },
          { path: '/app/perfil', element: <AdultProfilePage /> },
          {
            path: '/app/alimentos',
            element: <FoodCatalogPage />,
          },
          { path: '/app/alimentos/nuevo', element: <CustomFoodFormPage /> },
          {
            path: '/app/alimentos/:foodId/editar',
            element: <CustomFoodFormPage />,
          },
          { path: '/app/alimentos/:foodId', element: <FoodDetailPage /> },
          { path: '/app/perfiles/:profileId/meta', element: <NutritionGoalPage /> },
          { path: '/app/perfiles/:profileId/meta/propuesta', element: <NutritionGoalProposalPage /> },
          { path: '/app/comidas/nueva', element: <RegisterMealPage /> },
          { path: '/app/comidas/:mealId/editar', element: <EditMealPage /> },
          { path: '/app/comidas/:mealId/repetir', element: <DuplicateMealPage /> },
          { path: '/app/comidas/:mealId', element: <MealDetailPage /> },
          { path: '/app/resumen/:date', element: <DailyNutritionSummaryPage /> },
          { path: '/app/recetas', element: <RecipeListPage /> },
          { path: '/app/recetas/nueva', element: <RecipeFormPage /> },
          { path: '/app/recetas/:recipeId/editar', element: <RecipeFormPage /> },
          { path: '/app/recetas/:recipeId', element: <RecipeDetailPage /> },
          { path: '/app/preparaciones/nueva', element: <StartPreparedBatchPage /> },
          { path: '/app/preparaciones/:batchId/finalizar', element: <FinalizePreparedBatchPage /> },
          { path: '/app/preparaciones/:batchId/servir', element: <ServePreparedBatchPortionsPage /> },
          { path: '/app/preparaciones/:batchId', element: <PreparedBatchDetailPage /> },
          { path: '/app/porciones/:portionId/confirmar', element: <ConfirmServedPortionConsumptionPage /> },
          { path: '/app/preparaciones/:batchId/sobrante', element: <CreatePreparedFoodLeftoverPage /> },
          { path: '/app/sobrantes', element: <PreparedFoodLeftoversPage /> },
          { path: '/app/sobrantes/:leftoverId', element: <PreparedFoodLeftoverDetailPage /> },
          { path: '/app/inventario', element: <InventoryListPage /> },
          { path: '/app/invitaciones', element: <HouseholdInvitationsPage /> },
          {
            element: <RequireCompletedOnboarding />,
            children: [
              { path: '/app', element: <HomePage /> },
            ],
          },
          {
            path: '/invitaciones/:token',
            element: <AcceptHouseholdInvitationPage />,
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
