import { useNavigate, useParams } from 'react-router';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import {
  useCreateRecipe,
  useRecipe,
  useUpdateRecipe,
} from '../hooks/useRecipes';
import {
  emptyRecipeFormValues,
  recipeToFormValues,
  RecipeForm,
} from '../components/RecipeForm';
import '../recipes.css';
import { ChefHat } from 'lucide-react';

export function RecipeFormPage() {
  const { recipeId } = useParams();
  const isEditing = Boolean(recipeId);
  const navigate = useNavigate();
  const households = useHouseholds();
  const recipe = useRecipe(recipeId);
  const create = useCreateRecipe();
  const update = useUpdateRecipe();
  if (households.isPending || (isEditing && recipe.isPending))
    return (
      <p className="page-section" role="status">
        Cargando formulario...
      </p>
    );
  if (
    !households.activeHousehold ||
    (isEditing && (recipe.isError || !recipe.data))
  )
    return (
      <p className="page-section" role="alert">
        No se pudo cargar el formulario de receta.
      </p>
    );
  if (isEditing && recipe.data?.status === 'ARCHIVED')
    return (
      <p className="page-section" role="alert">
        Una receta archivada no se puede editar.
      </p>
    );
  const initialValues =
    isEditing && recipe.data
      ? recipeToFormValues(recipe.data)
      : emptyRecipeFormValues();
  return (
    <section
      className="page-section recipe-form-page"
      aria-labelledby="recipe-form-title"
    >
      <BackButton
        fallback={isEditing ? `/app/recetas/${recipeId}` : '/app/recetas'}
      />
      <PageHeader
        description="Comparte tus recetas caseras y nutre a tu familia."
        icon={<ChefHat size={25} />}
        title={isEditing ? 'Editar receta' : 'Crear receta'}
        titleId="recipe-form-title"
      />
      <RecipeForm
        initialValues={initialValues}
        isSubmitting={create.isPending || update.isPending}
        onSubmit={(input) => {
          if (isEditing && recipeId)
            update.mutate(
              { recipeId, input },
              { onSuccess: () => navigate(`/app/recetas/${recipeId}`) },
            );
          else
            create.mutate(
              { householdId: households.activeHousehold!.id, input },
              {
                onSuccess: (created) => navigate(`/app/recetas/${created.id}`),
              },
            );
        }}
        submitLabel={isEditing ? 'Guardar cambios' : 'Crear receta'}
        cancelTo={isEditing ? `/app/recetas/${recipeId}` : '/app/recetas'}
        errorMessage={
          create.isError || update.isError
            ? 'No se pudo guardar la receta. Revisa los datos e inténtalo nuevamente.'
            : undefined
        }
      />
    </section>
  );
}
