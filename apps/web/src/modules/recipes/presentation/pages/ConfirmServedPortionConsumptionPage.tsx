import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';

import { formatCalories, formatGrams } from '@nutrihogar/domain';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { usePreparedBatchDetails } from '../hooks/usePreparedBatches';
import { useConfirmServedPortionConsumption } from '../hooks/usePortionConsumption';
import { PreparationProgress } from '../components/PreparationProgress';
import type { RemainderDisposition } from '../../application/ports/ServedPortionConsumptionGateway';
import '../recipes.css';

const dispositions: Array<{ value: RemainderDisposition; label: string }> = [
  { value: 'SAVED', label: 'Guardado' },
  { value: 'DISCARDED', label: 'Desechado' },
  { value: 'SHARED', label: 'Compartido' },
  { value: 'CONSUMED_LATER', label: 'Consumido después' },
];

export function ConfirmServedPortionConsumptionPage() {
  const { portionId = '' } = useParams();
  const batchId =
    new URLSearchParams(useLocation().search).get('batchId') ?? '';
  const navigate = useNavigate();
  const details = usePreparedBatchDetails(batchId || undefined);
  const profiles = useAdultProfiles(details.data?.batch.householdId);
  const confirm = useConfirmServedPortionConsumption();
  const [remainderWeight, setRemainderWeight] = useState('');
  const [mealType, setMealType] = useState('LUNCH');
  const [consumedAt, setConsumedAt] = useState(toDateTimeLocal(new Date()));
  const [remainderDisposition, setRemainderDisposition] =
    useState<RemainderDisposition>('SAVED');

  if (!portionId)
    return (
      <p className="page-section" role="alert">
        Falta identificar la porción. Abre esta acción desde una preparación.
      </p>
    );
  if (!batchId)
    return (
      <section className="page-section" role="alert">
        <p>
          Falta el contexto de la preparación y no es posible verificar esta
          porción de forma segura.
        </p>
        <Link className="button button--secondary" to="/app">
          Volver al inicio
        </Link>
      </section>
    );
  if (details.isPending)
    return (
      <p className="page-section" role="status">
        Cargando porción...
      </p>
    );
  if (details.isError || !details.data)
    return (
      <p className="page-section" role="alert">
        No se pudo cargar la porción servida.
      </p>
    );

  const portion = details.data.servedPortions.find(
    (item) => item.id === portionId,
  );
  if (!portion)
    return (
      <p className="page-section" role="alert">
        No se encontró la porción solicitada.
      </p>
    );

  if (portion.consumedWeight != null)
    return (
      <section className="page-section portion-page" role="status">
        <BackButton fallback={`/app/preparaciones/${batchId}`} />
        <Link
          className="button button--primary"
          to={`/app/preparaciones/${batchId}`}
        >
          Ver preparación
        </Link>
      </section>
    );

  const servedWeight = portion.servedWeight;
  const remainder = remainderWeight === '' ? 0 : Number(remainderWeight);
  const consumedWeight = Math.max(
    servedWeight - (Number.isFinite(remainder) ? remainder : 0),
    0,
  );
  const invalidRemainder =
    !Number.isFinite(remainder) || remainder < 0 || remainder > servedWeight;
  const profileName =
    profiles.profiles.find((profile) => profile.id === portion.adultProfileId)
      ?.name ??
    (profiles.isPending ? 'El integrante' : 'El integrante no disponible');
  const nutrients = scaleNutrients(
    portion.nutritionSnapshot,
    servedWeight === 0 ? 0 : consumedWeight / servedWeight,
  );

  function submit() {
    if (invalidRemainder || !portionId) return;
    confirm.mutate(
      {
        input: {
          consumedAt: new Date(consumedAt),
          mealType,
          remainderDisposition:
            remainder > 0 ? remainderDisposition : undefined,
          remainderWeight: remainder,
        },
        portionId,
        batchId,
      },
      { onSuccess: () => navigate(`/app/resumen/${consumedAt.slice(0, 10)}`) },
    );
  }

  return (
    <section
      className="page-section portion-page"
      aria-labelledby="confirm-consumption-title"
    >
      <BackButton
        fallback={batchId ? `/app/preparaciones/${batchId}` : '/app'}
      />
      <PreparationProgress current="portions" />
      <form
        className="portion-form"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <fieldset className="preparation-fieldset">
          <legend>Porción de {profileName}</legend>
          <p className="lead">Peso servido: {servedWeight} g</p>
          <div className="form-field">
            <label htmlFor="remainder-weight">Peso restante (g)</label>
            <input
              id="remainder-weight"
              inputMode="decimal"
              min="0"
              onChange={(event) => setRemainderWeight(event.target.value)}
              step="0.1"
              type="number"
              value={remainderWeight}
            />
            {invalidRemainder ? (
              <p className="form-field__error">
                El resto no puede superar la porción servida.
              </p>
            ) : null}
            <div className="recipe-inline-actions">
              <button
                className="button button--secondary"
                onClick={() => setRemainderWeight('0')}
                type="button"
              >
                No quedó nada
              </button>
              <button
                className="button button--secondary"
                onClick={() => setRemainderWeight(String(servedWeight))}
                type="button"
              >
                Quedó todo
              </button>
            </div>
          </div>
          {remainder > 0 ? (
            <div className="form-field">
              <label htmlFor="remainder-disposition">
                Qué harás con el resto
              </label>
              <select
                id="remainder-disposition"
                onChange={(event) =>
                  setRemainderDisposition(
                    event.target.value as RemainderDisposition,
                  )
                }
                value={remainderDisposition}
              >
                {dispositions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </fieldset>
        <dl className="nutrition-value-list">
          <div>
            <dt>Consumo real</dt>
            <dd>{consumedWeight.toFixed(1)} g</dd>
          </div>
          <div>
            <dt>Calorías</dt>
            <dd>{formatCalories(nutrients.calories)}</dd>
          </div>
          <div>
            <dt>Proteína</dt>
            <dd>{formatGrams(nutrients.proteinGrams)}</dd>
          </div>
          <div>
            <dt>Carbohidratos</dt>
            <dd>{formatGrams(nutrients.carbohydrateGrams)}</dd>
          </div>
          <div>
            <dt>Grasas</dt>
            <dd>{formatGrams(nutrients.fatGrams)}</dd>
          </div>
        </dl>
        <fieldset className="preparation-fieldset">
          <legend>Momento del consumo</legend>
          <div className="form-field">
            <label htmlFor="consumption-meal-type">Tipo de comida</label>
            <select
              id="consumption-meal-type"
              onChange={(event) => setMealType(event.target.value)}
              value={mealType}
            >
              <option value="BREAKFAST">Desayuno</option>
              <option value="LUNCH">Almuerzo</option>
              <option value="SNACK">Merienda</option>
              <option value="DINNER">Cena</option>
              <option value="EXTRA">Extra</option>
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="consumption-date">Fecha y hora</label>
            <input
              id="consumption-date"
              onChange={(event) => setConsumedAt(event.target.value)}
              required
              type="datetime-local"
              value={consumedAt}
            />
          </div>
        </fieldset>
        <p className="supporting-text">
          El backend confirmará los valores nutricionales definitivos.
        </p>
        {confirm.isError ? (
          <p role="alert">
            No se pudo confirmar el consumo. Inténtalo nuevamente.
          </p>
        ) : null}
        <div className="recipe-page-actions">
          <Link
            className="button button--secondary"
            to={batchId ? `/app/preparaciones/${batchId}` : '/app'}
          >
            Cancelar
          </Link>
          <button
            className="button button--primary"
            disabled={invalidRemainder || confirm.isPending}
            type="submit"
          >
            {confirm.isPending ? 'Confirmando...' : 'Confirmar consumo'}
          </button>
        </div>
      </form>
    </section>
  );
}

function scaleNutrients(values: Record<string, number>, ratio: number) {
  return {
    calories:
      (values.calories ?? values.ENERGY_KCAL ?? values.CALORIES)
        ? (values.calories ?? values.ENERGY_KCAL ?? values.CALORIES) * ratio
        : 0,
    proteinGrams: (values.proteinGrams ?? values.PROTEIN ?? 0) * ratio,
    carbohydrateGrams:
      (values.carbohydrateGrams ?? values.CARBOHYDRATE ?? values.CARBS ?? 0) *
      ratio,
    fatGrams: (values.fatGrams ?? values.FAT ?? 0) * ratio,
  };
}

function toDateTimeLocal(value: Date) {
  const offset = value.getTimezoneOffset() * 60000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}
