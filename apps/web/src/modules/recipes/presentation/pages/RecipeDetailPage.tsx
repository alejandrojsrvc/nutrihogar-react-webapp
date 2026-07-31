import { Link, useParams } from 'react-router';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useRecipe } from '../hooks/useRecipes';

export function RecipeDetailPage() {
  const { recipeId } = useParams();
  const recipe = useRecipe(recipeId);
  if (recipe.isPending) return <p className="page-section" role="status">Cargando receta...</p>;
  if (recipe.isError || !recipe.data) return <p className="page-section" role="alert">No se pudo cargar la receta.</p>;
  const value = recipe.data;
  return <section className="page-section recipe-detail-page" aria-labelledby="recipe-detail-title"><BackButton fallback="/app/recetas" /><PageHeader eyebrow="Receta familiar" title={value.name} titleId="recipe-detail-title" description={value.description ?? undefined} /><dl className="recipe-detail-meta"><div><dt>Categoría</dt><dd>{value.category ?? 'Sin categoría'}</dd></div><div><dt>Preparación</dt><dd>{value.estimatedPreparationMinutes == null ? 'Sin estimar' : `${value.estimatedPreparationMinutes} min`}</dd></div><div><dt>Porciones</dt><dd>{value.defaultServings}</dd></div></dl><section className="recipe-detail-section"><h2>Ingredientes</h2><ul>{value.ingredients.map((ingredient) => <li key={ingredient.id}>{ingredient.quantity} {ingredient.unit.toLowerCase()} · alimento {ingredient.foodId}</li>)}</ul></section><section className="recipe-detail-section"><h2>Instrucciones</h2>{value.instructions.length === 0 ? <p>Esta receta aún no tiene instrucciones.</p> : <ol>{value.instructions.sort((a, b) => a.position - b.position).map((instruction) => <li key={instruction.id}>{instruction.description}</li>)}</ol>}</section><Link className="button button--secondary" to="/app/recetas">Volver a recetas</Link></section>;
}
