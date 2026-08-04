import { ChefHat } from 'lucide-react';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useRouteParams } from '../../../../shared/presentation/hooks/useRouteParams';
import { useRecipe } from '../hooks/useRecipes';

export function RecipeDetailHeader() {
  const { recipeId } = useRouteParams();
  const recipe = useRecipe(recipeId);

  return (
    <PageHeader
      description={recipe.data?.description ?? undefined}
      eyebrow="Receta familiar"
      icon={<ChefHat size={22} />}
      title={recipe.data?.name ?? 'Receta'}
      titleId="recipe-detail-title"
    />
  );
}
