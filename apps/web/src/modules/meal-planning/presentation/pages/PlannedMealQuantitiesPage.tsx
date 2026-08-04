import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Link, useParams } from 'react-router';
import {
  participantQuantitySchema,
  type ParticipantQuantityValues,
} from '@nutrihogar/schemas';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import {
  ErrorState,
  LoadingState,
} from '../../../../shared/presentation/components/AsyncState';
import { EmptyState } from '../../../../shared/presentation/components/EmptyState';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import {
  useAcceptQuantitySuggestions,
  useQuantitySuggestions,
  useProposeQuantities,
  useUpdateParticipant,
  useWeeklyPlan,
} from '../hooks/useMealPlanning';
import type { PlannedMealParticipant } from '../../domain/MealPlanning';
import { RelatedActions } from '../components/RelatedActions';

const unitOptions = [
  ['SERVING', 'Porción'],
  ['GRAM', 'Gramos'],
  ['MILLILITER', 'Mililitros'],
  ['UNIT', 'Unidad'],
] as const;

export function PlannedMealQuantitiesPage() {
  const { weeklyPlanId, plannedMealId } = useParams();
  const households = useHouseholds();
  const plan = useWeeklyPlan(weeklyPlanId);
  const suggestions = useQuantitySuggestions(plannedMealId);
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const propose = useProposeQuantities();
  const accept = useAcceptQuantitySuggestions();
  const update = useUpdateParticipant();
  const meal = plan.data?.meals.find((item) => item.id === plannedMealId);
  if (
    households.isPending ||
    plan.isPending ||
    suggestions.isPending ||
    profiles.isPending
  )
    return (
      <section className="page-section">
        <LoadingState message="Cargando cantidades..." />
      </section>
    );
  if (
    households.isError ||
    plan.isError ||
    suggestions.isError ||
    profiles.isError ||
    !meal
  )
    return (
      <section className="page-section">
        <ErrorState message="No se pudieron cargar las cantidades." />
      </section>
    );
  const nameFor = (id: string) =>
    profiles.profiles.find((profile) => profile.id === id)?.name ?? 'Adulto';
  return (
    <section
      className="page-section meal-planning-detail"
      aria-labelledby="quantities-title"
    >
      <BackButton
        fallback={`/app/plan-semanal/${weeklyPlanId}/comidas/${plannedMealId}/participantes`}
      />
      <section className="quantity-tools" aria-labelledby="quantity-tools-title">
        <div>
          <h2 id="quantity-tools-title">Sugerencias del plan</h2>
          <p>Calculadas con los objetivos vigentes de cada adulto.</p>
        </div>
        <div className="form-actions">
          <button
            className="button button--secondary"
            disabled={propose.isPending}
            onClick={() => propose.mutate(plannedMealId!)}
            type="button"
          >
            {propose.isPending ? 'Calculando...' : 'Proponer cantidades'}
          </button>
          <button
            className="button button--primary"
            disabled={accept.isPending || !meal.participants.length}
            onClick={() => accept.mutate(plannedMealId!)}
            type="button"
          >
            {accept.isPending
              ? 'Aceptando...'
              : 'Aceptar todas las sugerencias'}
          </button>
        </div>
      </section>
      {accept.isError || propose.isError ? (
        <p role="alert">
          No se pudo actualizar las sugerencias. Inténtalo nuevamente.
        </p>
      ) : null}
      {accept.isSuccess ? <p role="status">Sugerencias aceptadas.</p> : null}
      {meal.participants.length ? (
        <div className="quantity-list">
          {meal.participants.map((participant) => (
            <QuantityRow
              key={participant.id}
              participant={participant}
              name={nameFor(participant.adultProfileId)}
              suggestion={suggestions.data?.find(
                (item) => item.participantId === participant.id,
              )}
              onSave={(input) =>
                updateParticipantUseCaseCall(participant.id, input, update)
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No hay participantes"
          description="Asigna al menos un adulto para configurar cantidades."
        />
      )}
      <RelatedActions>
        <Link
          to={`/app/plan-semanal/${weeklyPlanId}/comidas/${plannedMealId}/participantes`}
        >
          Administrar participantes
        </Link>
        <Link to={`/app/plan-semanal?semana=${plan.data.weekStart}`}>
          Volver al plan
        </Link>
      </RelatedActions>
    </section>
  );
}

function QuantityRow({
  participant,
  name,
  suggestion,
  onSave,
}: {
  participant: PlannedMealParticipant;
  name: string;
  suggestion?: { quantity: number; unit: string; targetCalories: number };
  onSave: (value: ParticipantQuantityValues) => Promise<void>;
}) {
  const [saveError, setSaveError] = useState(false);
  const form = useForm<
    z.input<typeof participantQuantitySchema>,
    unknown,
    ParticipantQuantityValues
  >({
    resolver: zodResolver(participantQuantitySchema),
    defaultValues: {
      quantity:
        participant.confirmedQuantity ??
        participant.suggestedQuantity ??
        suggestion?.quantity ??
        undefined,
      unit:
        participant.confirmedUnit ??
        participant.suggestedUnit ??
        suggestion?.unit ??
        '',
    },
  });
  const submit = form.handleSubmit(async (value) => {
    setSaveError(false);
    await onSave(value);
  });
  return (
    <form
      className="quantity-row"
      onSubmit={(event) => {
        void submit(event).catch(() => setSaveError(true));
      }}
    >
      <h2>{name}</h2>
      {suggestion ? (
        <p className="quantity-row__suggestion">
          Sugerencia: {suggestion.quantity} {unitLabel(suggestion.unit)}.
          Objetivo de referencia: {suggestion.targetCalories} kcal.
        </p>
      ) : (
        <p className="quantity-row__suggestion">Sin sugerencia disponible.</p>
      )}
      <div className="quantity-row__fields">
        <div className="form-field">
          <label htmlFor={`quantity-${participant.id}`}>
            Cantidad confirmada
          </label>
          <input
            id={`quantity-${participant.id}`}
            inputMode="decimal"
            step="any"
            type="number"
            {...form.register('quantity')}
            aria-invalid={Boolean(form.formState.errors.quantity)}
          />
          {form.formState.errors.quantity ? (
            <span className="form-field__error">
              {form.formState.errors.quantity.message}
            </span>
          ) : null}
        </div>
        <div className="form-field">
          <label htmlFor={`unit-${participant.id}`}>Unidad</label>
          <select
            id={`unit-${participant.id}`}
            {...form.register('unit')}
            aria-invalid={Boolean(form.formState.errors.unit)}
          >
            {unitOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <p className="supporting-text">
            Usa una unidad fija para que el plan pueda compararse con
            inventario.
          </p>
          {form.formState.errors.unit ? (
            <span className="form-field__error">
              {form.formState.errors.unit.message}
            </span>
          ) : null}
        </div>
      </div>
      <button
        className="button button--secondary"
        disabled={form.formState.isSubmitting}
        type="submit"
      >
        {form.formState.isSubmitting ? 'Guardando...' : 'Guardar cantidad'}
      </button>
      {form.formState.isSubmitSuccessful ? (
        <p role="status">Cantidad guardada.</p>
      ) : null}
      {saveError ? (
        <p role="alert">
          No se pudo guardar la cantidad. El valor ingresado sigue aquí.
        </p>
      ) : null}
    </form>
  );
}
async function updateParticipantUseCaseCall(
  id: string,
  value: ParticipantQuantityValues,
  mutation: ReturnType<typeof useUpdateParticipant>,
) {
  await mutation.mutateAsync({
    participantId: id,
    input: { confirmedQuantity: value.quantity, confirmedUnit: value.unit },
  });
}
function unitLabel(value: string) {
  return unitOptions.find(([unit]) => unit === value)?.[1] ?? value;
}
