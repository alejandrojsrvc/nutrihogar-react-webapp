import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import {
  ErrorState,
  LoadingState,
} from '../../../../shared/presentation/components/AsyncState';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import {
  useAssignParticipant,
  useDeleteParticipant,
  useWeeklyPlan,
} from '../hooks/useMealPlanning';
import { RelatedActions } from '../components/RelatedActions';

export function PlannedMealParticipantsPage() {
  const { weeklyPlanId, plannedMealId } = useParams();
  const households = useHouseholds();
  const plan = useWeeklyPlan(weeklyPlanId);
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const assign = useAssignParticipant();
  const remove = useDeleteParticipant();
  const [submitting, setSubmitting] = useState(false);
  const [selectedOverride, setSelectedOverride] = useState<string[] | null>(
    null,
  );
  const meal = plan.data?.meals.find((item) => item.id === plannedMealId);
  if (households.isPending || plan.isPending || profiles.isPending)
    return (
      <section className="page-section">
        <LoadingState message="Cargando participantes..." />
      </section>
    );
  if (households.isError || profiles.isError || plan.isError || !meal)
    return (
      <section className="page-section">
        <ErrorState message="No se pudo cargar la comida o sus participantes." />
      </section>
    );
  const activeProfiles = profiles.profiles.filter(
    (profile) => profile.isActive !== false,
  );
  const selected =
    selectedOverride ??
    meal.participants.map((participant) => participant.adultProfileId);
  const saving = submitting || assign.isPending || remove.isPending;
  const save = async () => {
    setSubmitting(true);
    try {
      const current = new Set(
        meal.participants.map((participant) => participant.adultProfileId),
      );
      for (const adultProfileId of selected.filter((id) => !current.has(id)))
        await assign.mutateAsync({
          plannedMealId: plannedMealId!,
          adultProfileId,
        });
      for (const participant of meal.participants.filter(
        (item) => !selected.includes(item.adultProfileId),
      ))
        await remove.mutateAsync(participant.id);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <section
      className="page-section meal-planning-detail"
      aria-labelledby="participants-title"
    >
      <BackButton
        fallback={`/app/plan-semanal?semana=${plan.data!.weekStart}`}
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void save().catch(() => undefined);
        }}
      >
        <fieldset className="participant-selection" disabled={saving}>
          <legend>Adultos activos</legend>
          {activeProfiles.length ? (
            activeProfiles.map((profile) => (
              <label className="participant-selection__option" key={profile.id}>
                <input
                  type="checkbox"
                  checked={selected.includes(profile.id)}
                  onChange={() =>
                    setSelectedOverride(
                      selected.includes(profile.id)
                        ? selected.filter((id) => id !== profile.id)
                        : [...selected, profile.id],
                    )
                  }
                />
                {profile.name}
              </label>
            ))
          ) : (
            <p>No hay adultos activos disponibles.</p>
          )}
        </fieldset>
        <div className="form-actions meal-planning-detail__sticky-actions">
          <button
            className="button button--primary"
            disabled={saving || !activeProfiles.length}
            type="submit"
          >
            {saving ? 'Guardando...' : 'Guardar participantes'}
          </button>
        </div>
        {assign.isError || remove.isError ? (
          <p role="alert">
            No se pudieron guardar todos los participantes. Revisa la selección
            e inténtalo nuevamente.
          </p>
        ) : null}
        {!saving && (assign.isSuccess || remove.isSuccess) ? (
          <p role="status">Participantes actualizados.</p>
        ) : null}
      </form>
      <RelatedActions>
        <Link
          to={`/app/plan-semanal/${weeklyPlanId}/comidas/${plannedMealId}/cantidades`}
        >
          Configurar cantidades
        </Link>
        <Link to={`/app/plan-semanal?semana=${plan.data!.weekStart}`}>
          Volver al plan
        </Link>
      </RelatedActions>
    </section>
  );
}
