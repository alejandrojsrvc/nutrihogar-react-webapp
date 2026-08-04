import { ChefHat } from 'lucide-react';
import { useParams } from 'react-router';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useRecipe } from '../hooks/useRecipes';

export function RecipeDetailHeader() {
  const { recipeId } = useParams();
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
