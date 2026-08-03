import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useRecipe } from '../hooks/useRecipes';
import {
  useConfirmPreparedBatchIngredients,
  usePreparedBatch,
  useStartPreparedBatch,
  useUpdatePreparedBatchIngredients,
} from '../hooks/usePreparedBatches';
import type { PreparedBatchIngredientInput } from '../../application/ports/PreparedBatchGateway';

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

  function save(next: 'draft' | 'confirm') {
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
      />
      <div className="form-field">
        <label htmlFor="prepared-at">Fecha y hora</label>
        <input
          id="prepared-at"
          onChange={(event) => setPreparedAt(event.target.value)}
          type="datetime-local"
          value={preparedAt}
        />
      </div>
      <section className="recipe-form__section">
        <h2>Ingredientes utilizados</h2>
        {ingredients.map((item, index) => (
          <div
            className="recipe-ingredient-row"
            key={item.id ?? `${item.foodId}-${index}`}
          >
            <strong>{item.foodId}</strong>
            <div className="form-field">
              <label htmlFor={`batch-quantity-${index}`}>
                Cantidad ({item.unit})
              </label>
              <input
                id={`batch-quantity-${index}`}
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
            </div>
            <button
              className="button button--danger"
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
              Eliminar
            </button>
          </div>
        ))}
      </section>
      {update.isError || start.isError || confirm.isError ? (
        <p role="alert">
          No se pudo guardar la preparación. Revisa las cantidades.
        </p>
      ) : null}
      <div className="recipe-form__actions">
        <Link
          className="button button--secondary"
          to={`/app/recetas/${recipeId}`}
        >
          Cancelar
        </Link>
        <button
          className="button button--secondary"
          disabled={!ingredients.length || start.isPending || update.isPending}
          onClick={() => save('draft')}
          type="button"
        >
          Guardar borrador
        </button>
        <button
          className="button button--primary"
          disabled={
            !ingredients.length ||
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
    </section>
  );
}
