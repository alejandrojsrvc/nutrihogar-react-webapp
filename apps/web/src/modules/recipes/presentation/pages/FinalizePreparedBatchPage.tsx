import { useState } from 'react';
import { Scale } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { Dialog } from '../../../../shared/presentation/components/Overlay';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { PreparationProgress } from '../components/PreparationProgress';
import { formatNutrientAmount } from '../recipePresentation';
import {
  usePreparedBatch,
  useConfirmPreparedBatchIngredients,
  useFinalizePreparedBatch,
} from '../hooks/usePreparedBatches';
import '../recipes.css';
export function FinalizePreparedBatchPage() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const batch = usePreparedBatch(batchId);
  const confirm = useConfirmPreparedBatchIngredients();
  const finalize = useFinalizePreparedBatch();
  const [weight, setWeight] = useState('');
  const [finalizeDialogOpen, setFinalizeDialogOpen] = useState(false);
  const parsedWeight = Number(weight);
  const validWeight = Number.isFinite(parsedWeight) && parsedWeight > 0;
  if (!batchId)
    return (
      <p className="page-section" role="alert">
        Falta identificar la preparación. Vuelve a la receta e inténtalo nuevamente.
      </p>
    );
  if (batch.isPending)
    return (
      <p className="page-section" role="status">
        Cargando preparación...
      </p>
    );
  if (batch.isError || !batch.data)
    return (
      <p className="page-section" role="alert">
        No se pudo cargar la preparación.
      </p>
    );
  const value = batch.data;
  if (value.status === 'DRAFT')
    return (
      <section className="page-section preparation-page">
        <BackButton fallback={`/app/preparaciones/${value.id}`} />
        <PageHeader
          eyebrow="Preparación"
          title="Confirma los ingredientes"
          icon={<Scale size={22} />}
        />
        <PreparationProgress current="ingredients" />
        <p>Los nutrientes se calcularán cuando confirmes las cantidades.</p>
        <button
          className="button button--primary"
          disabled={confirm.isPending}
          onClick={() =>
            confirm.mutate(value.id, { onSuccess: () => void batch.refetch() })
          }
          type="button"
        >
          Confirmar ingredientes
        </button>
      </section>
    );
  if (value.status === 'CANCELLED')
    return (
      <section className="page-section preparation-page" role="alert">
        <BackButton fallback={value.recipeId ? `/app/recetas/${value.recipeId}` : '/app'} />
        <PageHeader
          eyebrow="Preparación cancelada"
          title={value.recipeNameSnapshot}
          description="Esta preparación ya no puede finalizarse."
          icon={<Scale size={22} />}
        />
      </section>
    );
  if (value.status === 'FINALIZED') return <PreparedResult batch={value} />;
  return (
    <section className="page-section preparation-page" aria-labelledby="finalize-title">
      <BackButton fallback={`/app/preparaciones/${value.id}`} />
      <PageHeader
        eyebrow="Preparación confirmada"
        title="Registrar peso cocido"
        titleId="finalize-title"
        description="El peso cocido permite calcular la densidad nutricional real de esta preparación."
        icon={<Scale size={22} />}
      />
      <PreparationProgress current="weight" />
      <form
        className="preparation-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (validWeight) setFinalizeDialogOpen(true);
        }}
      >
        <fieldset className="preparation-fieldset">
          <legend>Peso de toda la preparación</legend>
          <div className="form-field">
            <label htmlFor="cooked-weight">Peso final cocido (g)</label>
            <input
              aria-describedby="cooked-weight-help"
              id="cooked-weight"
              inputMode="decimal"
              min="0.000001"
              onChange={(event) => setWeight(event.target.value)}
              step="any"
              type="number"
              value={weight}
            />
            <p className="supporting-text" id="cooked-weight-help">
              Pesa el resultado completo antes de servir o guardar sobrantes.
            </p>
          </div>
        </fieldset>
        {finalize.isError ? (
          <p role="alert">
            No se pudo finalizar. Tu peso sigue aquí; verifica que sea mayor que
            cero e inténtalo nuevamente.
          </p>
        ) : null}
        <div className="recipe-page-actions">
          <Link className="button button--secondary" to={`/app/preparaciones/${value.id}`}>
            Volver
          </Link>
          <button
            className="button button--primary"
            disabled={finalize.isPending || !validWeight}
            type="submit"
          >
            Finalizar preparación
          </button>
        </div>
      </form>
      <Dialog
        onClose={() => setFinalizeDialogOpen(false)}
        open={finalizeDialogOpen}
        title="Finalizar preparación"
      >
        <p>
          Se guardará un peso cocido de {weight} g. Después no podrás cambiar los
          ingredientes de esta preparación.
        </p>
        {finalize.isError ? (
          <p role="alert">
            No se pudo finalizar. Revisa el peso o inténtalo nuevamente.
          </p>
        ) : null}
        <div className="recipe-dialog-actions">
          <button
            className="button button--secondary"
            onClick={() => setFinalizeDialogOpen(false)}
            type="button"
          >
            Revisar peso
          </button>
          <button
            className="button button--primary"
            disabled={finalize.isPending}
            onClick={() =>
              finalize.mutate(
                { batchId: value.id, weight: parsedWeight },
                { onSuccess: () => navigate(`/app/preparaciones/${value.id}`) },
              )
            }
            type="button"
          >
            {finalize.isPending ? 'Finalizando...' : 'Confirmar peso final'}
          </button>
        </div>
      </Dialog>
    </section>
  );
}
function PreparedResult({
  batch,
}: {
  batch: NonNullable<ReturnType<typeof usePreparedBatch>['data']>;
}) {
  return (
    <section className="page-section preparation-page">
      <BackButton fallback={`/app/preparaciones/${batch.id}`} />
      <PageHeader
        eyebrow="Preparación finalizada"
        title={batch.recipeNameSnapshot}
        description="La nutrición se calculó con el peso cocido registrado."
        icon={<Scale size={22} />}
      />
      <PreparationProgress current="portions" />
      <dl className="recipe-detail-meta">
        <div>
          <dt>Peso cocido</dt>
          <dd>{batch.finalCookedWeight} g</dd>
        </div>
        <div>
          <dt>Calorías por 100 g</dt>
          <dd>
            {batch.nutrientsPer100Grams.ENERGY_KCAL == null
              ? 'Sin dato'
              : formatNutrientAmount(
                  batch.nutrientsPer100Grams.ENERGY_KCAL,
                  'ENERGY_KCAL',
                )}
          </dd>
        </div>
        <div>
          <dt>Proteína por 100 g</dt>
          <dd>
            {batch.nutrientsPer100Grams.PROTEIN == null
              ? 'Sin dato'
              : formatNutrientAmount(
                  batch.nutrientsPer100Grams.PROTEIN,
                  'PROTEIN',
                )}
          </dd>
        </div>
      </dl>
      <div className="recipe-page-actions">
        <Link
          className="button button--primary"
          to={`/app/preparaciones/${batch.id}/servir`}
        >
          Servir porciones
        </Link>
        <Link className="button button--secondary" to={`/app/preparaciones/${batch.id}`}>
          Ver detalle
        </Link>
      </div>
    </section>
  );
}
