import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';

import { formatCalories, formatGrams } from '@nutrihogar/domain';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { usePreparedBatchDetails } from '../hooks/usePreparedBatches';
import { useConfirmServedPortionConsumption } from '../hooks/usePortionConsumption';
import type { RemainderDisposition } from '../../application/ports/ServedPortionConsumptionGateway';

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
      ?.name ?? portion.adultProfileId;
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
      },
      { onSuccess: () => navigate(`/app/resumen/${consumedAt.slice(0, 10)}`) },
    );
  }

  return (
    <section
      className="page-section"
      aria-labelledby="confirm-consumption-title"
    >
      <BackButton
        fallback={batchId ? `/app/preparaciones/${batchId}` : '/app'}
      />
      <PageHeader
        eyebrow="Seguimiento de consumo"
        title="Confirma lo consumido"
        titleId="confirm-consumption-title"
      />
      <p className="lead">
        {profileName} recibió {servedWeight} g de la preparación.
      </p>
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
        <div className="recipe-form__actions">
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
          <label htmlFor="remainder-disposition">Qué harás con el resto</label>
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
          type="datetime-local"
          value={consumedAt}
        />
      </div>
      <p className="supporting-text">
        El backend confirmará los valores nutricionales definitivos.
      </p>
      {confirm.isError ? (
        <p role="alert">
          No se pudo confirmar el consumo. Inténtalo nuevamente.
        </p>
      ) : null}
      <div className="recipe-form__actions">
        <Link
          className="button button--secondary"
          to={batchId ? `/app/preparaciones/${batchId}` : '/app'}
        >
          Cancelar
        </Link>
        <button
          className="button button--primary"
          disabled={invalidRemainder || confirm.isPending}
          onClick={submit}
          type="button"
        >
          {confirm.isPending ? 'Confirmando...' : 'Confirmar consumo'}
        </button>
      </div>
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
