import { useState } from 'react';
import { CookingPot, Trash2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useFoodDetail } from '../../../food-catalog/presentation/hooks/useFoodCatalog';
import { PreparationProgress } from '../components/PreparationProgress';
import { humanizeUnit } from '../recipePresentation';
import { useRecipe } from '../hooks/useRecipes';
import {
  useConfirmPreparedBatchIngredients,
  usePreparedBatch,
  useStartPreparedBatch,
  useUpdatePreparedBatchIngredients,
} from '../hooks/usePreparedBatches';
import type { PreparedBatchIngredientInput } from '../../application/ports/PreparedBatchGateway';
import '../recipes.css';

export function StartPreparedBatchPage() {
  const params = new URLSearchParams(useLocation().search);
  const recipeId = params.get('recipeId') ?? '';
  const batchId = params.get('batchId') ?? '';
  const navigate = useNavigate();
  const recipe = useRecipe(recipeId || undefined);
  const batch = usePreparedBatch(batchId || undefined);
  const start = useStartPreparedBatch();
  const update = useUpdatePreparedBatchIngredients();
  const confirm = useConfirmPreparedBatchIngredients();
  const [draftIngredients, setDraftIngredients] = useState<
    PreparedBatchIngredientInput[] | null
  >(null);
  const [preparedAt, setPreparedAt] = useState(
    new Date().toISOString().slice(0, 16),
  );

  if (!recipeId)
    return (
      <section className="page-section" role="alert">
        <p>Falta indicar qué receta quieres cocinar.</p>
        <Link className="button button--secondary" to="/app/recetas">
          Volver a recetas
        </Link>
      </section>
    );
  if (recipe.isPending || (batchId && batch.isPending))
    return (
      <p className="page-section" role="status">
        Cargando preparación...
      </p>
    );
  if (
    recipe.isError ||
    !recipe.data ||
    (batchId && (batch.isError || !batch.data))
  )
    return (
      <p className="page-section" role="alert">
        No se pudo cargar la receta o preparación.
      </p>
    );

  const ingredients: PreparedBatchIngredientInput[] =
    draftIngredients ??
    batch.data?.ingredients.map((item) => ({
      id: item.id,
      foodId: item.foodId,
      notes: item.notes,
      position: item.position,
      quantity: item.quantity,
      servingId: item.servingId,
      unit: item.unit,
    })) ??
    recipe.data.ingredients.map((item, index) => ({
      foodId: item.foodId,
      position: index + 1,
      quantity: item.quantity,
      servingId: item.servingId,
      unit: item.unit,
    }));
  const currentBatchId = batch.data?.id ?? '';
  const invalidIngredients =
    !ingredients.length ||
    ingredients.some(
      (ingredient) =>
        !Number.isFinite(ingredient.quantity) || ingredient.quantity <= 0,
    );

  if (batch.data && batch.data.status !== 'DRAFT') {
    const finalized = batch.data.status === 'FINALIZED';
    const cancelled = batch.data.status === 'CANCELLED';
    return (
      <section className="page-section preparation-page">
        <BackButton fallback={`/app/preparaciones/${batch.data.id}`} />
        <PageHeader
          eyebrow="Preparación familiar"
          title={cancelled ? 'Preparación cancelada' : 'Ingredientes ya confirmados'}
          description={
            cancelled
              ? 'Esta preparación ya no puede modificarse.'
              : finalized
                ? 'La preparación ya tiene su cálculo nutricional definitivo.'
                : 'Las cantidades ya no pueden editarse. Continúa con el peso cocido.'
          }
          icon={<CookingPot size={22} />}
        />
        {!cancelled ? (
          <PreparationProgress current={finalized ? 'portions' : 'weight'} />
        ) : null}
        {!cancelled ? (
          <Link
            className="button button--primary"
            to={
              finalized
                ? `/app/preparaciones/${batch.data.id}`
                : `/app/preparaciones/${batch.data.id}/finalizar`
            }
          >
            {finalized ? 'Ver preparación' : 'Registrar peso cocido'}
          </Link>
        ) : null}
      </section>
    );
  }

  function save(next: 'draft' | 'confirm') {
    if (invalidIngredients) return;
    const continueWith = (id: string) =>
      update.mutate(
        { batchId: id, ingredients },
        {
          onSuccess: () =>
            next === 'confirm'
              ? confirm.mutate(id, {
                  onSuccess: () =>
                    navigate(`/app/preparaciones/${id}/finalizar`),
                })
              : navigate(
                  `/app/preparaciones/nueva?recipeId=${recipeId}&batchId=${id}`,
                ),
        },
      );
    if (currentBatchId) continueWith(currentBatchId);
    else
      start.mutate(
        { recipeId: recipe.data!.id, preparedAt: new Date(preparedAt) },
        { onSuccess: (created) => continueWith(created.id) },
      );
  }

  return (
    <section
      className="page-section preparation-page"
      aria-labelledby="preparation-title"
    >
      <BackButton fallback={`/app/recetas/${recipeId}`} />
      <PageHeader
        eyebrow="Preparación familiar"
        title={`Cocinar ${recipe.data.name}`}
        titleId="preparation-title"
        description="Ajusta las cantidades reales sin modificar la receta original."
        icon={<CookingPot size={22} />}
      />
      <PreparationProgress current="ingredients" />
      <form className="preparation-form" onSubmit={(event) => event.preventDefault()}>
        {!currentBatchId ? (
          <fieldset className="preparation-fieldset">
            <legend>Cuándo cocinaste</legend>
            <div className="form-field">
              <label htmlFor="prepared-at">Fecha y hora</label>
              <input
                id="prepared-at"
                onChange={(event) => setPreparedAt(event.target.value)}
                required
                type="datetime-local"
                value={preparedAt}
              />
            </div>
          </fieldset>
        ) : null}
        <fieldset className="preparation-fieldset">
          <legend>Ingredientes utilizados</legend>
          <div className="preparation-row-list">
            {ingredients.map((item, index) => (
              <div
                className="preparation-row"
                key={item.id ?? `${item.foodId}-${index}`}
              >
                <div className="preparation-row__identity">
                  <IngredientName foodId={item.foodId} />
                  <small>{humanizeUnit(item.unit)}</small>
                </div>
                <div className="form-field">
                  <label htmlFor={`batch-quantity-${index}`}>
                    Cantidad ({humanizeUnit(item.unit)})
                  </label>
                  <input
                    aria-describedby={
                      !Number.isFinite(item.quantity) || item.quantity <= 0
                        ? `batch-quantity-error-${index}`
                        : undefined
                    }
                    aria-invalid={
                      !Number.isFinite(item.quantity) || item.quantity <= 0
                    }
                    id={`batch-quantity-${index}`}
                    inputMode="decimal"
                    min="0.000001"
                    step="any"
                    type="number"
                    value={item.quantity}
                    onChange={(event) =>
                      setDraftIngredients((current) =>
                        (current ?? ingredients).map((ingredient, currentIndex) =>
                          currentIndex === index
                            ? {
                                ...ingredient,
                                quantity: Number(event.target.value),
                              }
                            : ingredient,
                        ),
                      )
                    }
                  />
                  {!Number.isFinite(item.quantity) || item.quantity <= 0 ? (
                    <p
                      className="form-field__error"
                      id={`batch-quantity-error-${index}`}
                    >
                      Indica una cantidad mayor que cero.
                    </p>
                  ) : null}
                </div>
                <div className="recipe-row-actions">
                  <button
                    className="button button--text"
                    onClick={() =>
                      setDraftIngredients((current) =>
                        (current ?? ingredients)
                          .filter((_, currentIndex) => currentIndex !== index)
                          .map((ingredient, position) => ({
                            ...ingredient,
                            position: position + 1,
                          })),
                      )
                    }
                    type="button"
                  >
                    <Trash2 size={16} aria-hidden="true" /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
          {!ingredients.length ? (
            <p role="alert">La preparación necesita al menos un ingrediente.</p>
          ) : null}
        </fieldset>
        {update.isError || start.isError || confirm.isError ? (
          <p role="alert">
            No se pudo guardar la preparación. Tus cantidades siguen aquí para
            que puedas revisarlas.
          </p>
        ) : null}
        <div className="recipe-page-actions">
          <Link
            className="button button--secondary"
            to={`/app/recetas/${recipeId}`}
          >
            Cancelar
          </Link>
          <button
            className="button button--secondary"
            disabled={invalidIngredients || start.isPending || update.isPending}
            onClick={() => save('draft')}
            type="button"
          >
            Guardar borrador
          </button>
          <button
            className="button button--primary"
            disabled={
              invalidIngredients ||
              start.isPending ||
              update.isPending ||
              confirm.isPending
            }
            onClick={() => save('confirm')}
            type="button"
          >
            Confirmar ingredientes
          </button>
        </div>
      </form>
    </section>
  );
}

function IngredientName({ foodId }: { foodId: string }) {
  const food = useFoodDetail(foodId);
  return (
    <strong>
      {food.data?.name ??
        (food.isPending ? 'Cargando alimento...' : 'Alimento no disponible')}
    </strong>
  );
}
