import { useState } from 'react';
import { ChefHat } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { Badge } from '../../../../shared/presentation/components/Badge';
import { Dialog } from '../../../../shared/presentation/components/Overlay';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useFoodDetail } from '../../../food-catalog/presentation/hooks/useFoodCatalog';
import { formatQuantity, humanizeEnum, statusTone } from '../recipePresentation';
import {
  useArchiveRecipe,
  useRecipe,
  useRecipeNutrition,
} from '../hooks/useRecipes';
import '../recipes.css';

export function RecipeDetailPage() {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const recipe = useRecipe(recipeId);
  const nutrition = useRecipeNutrition(recipeId);
  const archive = useArchiveRecipe();
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  if (!recipeId)
    return (
      <p className="page-section" role="alert">
        Falta identificar la receta. Vuelve a la lista e inténtalo nuevamente.
      </p>
    );
  if (recipe.isPending)
    return (
      <p className="page-section" role="status">
        Cargando receta...
      </p>
    );
  if (recipe.isError || !recipe.data)
    return (
      <section className="page-section" role="alert">
        <p>No se pudo cargar la receta.</p>
        <button
          className="button button--secondary"
          onClick={() => void recipe.refetch()}
          type="button"
        >
          Reintentar
        </button>
      </section>
    );
  const value = recipe.data;
  const archived = value.status === 'ARCHIVED';
  function archiveRecipe() {
    archive.mutate(recipeId, {
      onSuccess: () => navigate('/app/recetas'),
    });
  }
  return (
    <section
      className="page-section recipe-detail-page"
      aria-labelledby="recipe-detail-title"
    >
      <BackButton fallback="/app/recetas" />
      <PageHeader
        eyebrow="Receta familiar"
        title={value.name}
        titleId="recipe-detail-title"
        description={value.description ?? undefined}
        icon={<ChefHat size={22} />}
      />
      <div className="recipe-status-line">
        <Badge tone={statusTone(value.status)}>{humanizeEnum(value.status)}</Badge>
        {archived ? (
          <span className="supporting-text">
            Esta receta se conserva como historial y no puede usarse para nuevas
            preparaciones.
          </span>
        ) : null}
      </div>
      {!archived ? (
        <div className="recipe-page-actions">
          <Link
            className="button button--primary"
            to={`/app/preparaciones/nueva?recipeId=${value.id}`}
          >
            Cocinar esta receta
          </Link>
          <Link
            className="button button--secondary"
            to={`/app/recetas/${value.id}/editar`}
          >
            Editar receta
          </Link>
          <button
            className="button button--danger"
            disabled={archive.isPending}
            onClick={() => setArchiveDialogOpen(true)}
            type="button"
          >
            {archive.isPending ? 'Archivando...' : 'Archivar receta'}
          </button>
        </div>
      ) : null}
      <dl className="recipe-detail-meta">
        <div>
          <dt>Categoría</dt>
          <dd>
            {value.category ? humanizeEnum(value.category) : 'Sin categoría'}
          </dd>
        </div>
        <div>
          <dt>Preparación</dt>
          <dd>
            {value.estimatedPreparationMinutes == null
              ? 'Sin estimar'
              : `${value.estimatedPreparationMinutes} min`}
          </dd>
        </div>
        <div>
          <dt>Porciones</dt>
          <dd>{value.defaultServings}</dd>
        </div>
      </dl>
      <section className="recipe-detail-section">
        <h2>Ingredientes</h2>
        <ul className="recipe-detail-list">
          {[...value.ingredients]
            .sort((a, b) => a.position - b.position)
            .map((ingredient) => (
              <IngredientRow ingredient={ingredient} key={ingredient.id} />
            ))}
        </ul>
      </section>
      <section className="recipe-detail-section">
        <h2>Instrucciones</h2>
        {value.instructions.length === 0 ? (
          <p>Esta receta aún no tiene instrucciones.</p>
        ) : (
          <ol className="recipe-instructions">
            {[...value.instructions]
              .sort((a, b) => a.position - b.position)
              .map((instruction) => (
                <li key={instruction.id}>{instruction.description}</li>
              ))}
          </ol>
        )}
      </section>
      <RecipeNutritionSection nutrition={nutrition} />
      {archive.isError ? (
        <p role="alert">No se pudo archivar la receta. Inténtalo nuevamente.</p>
      ) : null}
      <Dialog
        onClose={() => setArchiveDialogOpen(false)}
        open={archiveDialogOpen}
        title="Archivar receta"
      >
        <p>
          Esta receta seguirá en el historial, pero no podrá usarse para nuevas
          preparaciones.
        </p>
        {archive.isError ? (
          <p role="alert">No se pudo archivar. Puedes intentarlo nuevamente.</p>
        ) : null}
        <div className="recipe-dialog-actions">
          <button
            className="button button--secondary"
            onClick={() => setArchiveDialogOpen(false)}
            type="button"
          >
            Conservar receta
          </button>
          <button
            className="button button--danger"
            disabled={archive.isPending}
            onClick={archiveRecipe}
            type="button"
          >
            {archive.isPending ? 'Archivando...' : 'Archivar receta'}
          </button>
        </div>
      </Dialog>
    </section>
  );
}

function IngredientRow({
  ingredient,
}: {
  ingredient: {
    foodId: string;
    quantity: number;
    unit: string;
    servingId: string | null;
    notes: string | null;
  };
}) {
  const food = useFoodDetail(ingredient.foodId);
  return (
    <li>
      <strong>
        {food.data?.name ??
          (food.isPending
            ? 'Cargando alimento...'
            : 'Alimento no disponible')}
      </strong>
      <span>{formatQuantity(ingredient.quantity, ingredient.unit)}</span>
      {food.data?.preparationState ? (
        <small>{humanizeEnum(food.data.preparationState)}</small>
      ) : null}
      {ingredient.notes ? <small>{ingredient.notes}</small> : null}
    </li>
  );
}

function RecipeNutritionSection({
  nutrition,
}: {
  nutrition: ReturnType<typeof useRecipeNutrition>;
}) {
  if (nutrition.isPending)
    return (
      <section className="recipe-nutrition">
        <h2>Nutrición estimada</h2>
        <p role="status">Calculando nutrientes...</p>
      </section>
    );
  if (nutrition.isError || !nutrition.data)
    return (
      <section className="recipe-nutrition" role="alert">
        <h2>Nutrición estimada</h2>
        <p>No se pudo calcular la nutrición de esta receta.</p>
        <button
          className="button button--secondary"
          onClick={() => void nutrition.refetch()}
          type="button"
        >
          Reintentar
        </button>
      </section>
    );
  const value = nutrition.data;
  return (
    <section className="recipe-nutrition">
      <p className="eyebrow">Cálculo teórico</p>
      <h2>Nutrición estimada</h2>
      <p>
        Los valores por porción son estimados. El cálculo definitivo dependerá
        del peso cocido y de la porción servida.
      </p>
      <div className="recipe-nutrition__grid">
        <NutritionValues
          label="Total de la receta"
          values={value.totalNutrients}
        />
        <NutritionValues
          label="Por porción"
          values={value.perServingNutrients}
        />
      </div>
      {value.warnings.length ? (
        <div className="recipe-warnings" role="status">
          <strong>Hay datos nutricionales incompletos.</strong>
          <ul>
            {value.warnings.map((warning) => (
              <li key={`${warning.ingredientId}-${warning.code}`}>
                {warning.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function NutritionValues({
  label,
  values,
}: {
  label: string;
  values: Record<string, number>;
}) {
  return (
    <div>
      <h3>{label}</h3>
      <dl className="nutrition-value-list">
        {Object.entries(values).map(([code, amount]) => (
          <div key={code}>
            <dt>{nutritionLabels[code] ?? humanizeEnum(code)}</dt>
            <dd>{amount}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
const nutritionLabels: Record<string, string> = {
  ENERGY_KCAL: 'Calorías (kcal)',
  PROTEIN: 'Proteína (g)',
  CARBOHYDRATE: 'Carbohidratos (g)',
  FAT: 'Grasas (g)',
  FIBER: 'Fibra (g)',
};
