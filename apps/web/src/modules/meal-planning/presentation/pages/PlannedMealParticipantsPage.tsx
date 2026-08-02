import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import type { PlannedMeal } from '../../domain/MealPlanning';
import { useAssignParticipant, useDeleteParticipant, useWeeklyPlan } from '../hooks/useMealPlanning';

export function PlannedMealParticipantsPage() {
  const { weeklyPlanId, plannedMealId } = useParams();
  const navigate = useNavigate();
  const households = useHouseholds();
  const plan = useWeeklyPlan(weeklyPlanId);
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const assign = useAssignParticipant();
  const remove = useDeleteParticipant();
  const [selectedOverride, setSelectedOverride] = useState<string[] | null>(null);
  const meal = plan.data?.meals.find((item) => item.id === plannedMealId);
  if (households.isPending || plan.isPending || profiles.isPending) return <p className="page-section" role="status">Cargando participantes...</p>;
  if (households.isError || profiles.isError || plan.isError || !meal) return <p className="page-section" role="alert">No se pudo cargar la comida o sus participantes.</p>;
  const activeProfiles = profiles.profiles.filter((profile) => profile.isActive !== false);
  const selected = selectedOverride ?? meal.participants.map((participant) => participant.adultProfileId);
  const saving = assign.isPending || remove.isPending;
  const save = async () => {
    const current = new Set(meal.participants.map((participant) => participant.adultProfileId));
    for (const adultProfileId of selected.filter((id) => !current.has(id))) await assign.mutateAsync({ plannedMealId: plannedMealId!, adultProfileId });
    for (const participant of meal.participants.filter((item) => !selected.includes(item.adultProfileId))) await remove.mutateAsync(participant.id);
  };
  return <section className="page-section meal-planning-detail" aria-labelledby="participants-title">
    <BackButton fallback={`/app/plan-semanal?semana=${plan.data!.weekStart}`} />
    <PageHeader eyebrow="Comida planificada" title={`Participantes de ${meal.name ?? mealLabel(meal)}`} titleId="participants-title" description="Selecciona los adultos que compartirán esta comida." />
    <form onSubmit={(event) => { event.preventDefault(); void save(); }}>
      <fieldset className="participant-selection" disabled={saving}>
        <legend>Adultos activos</legend>
          {activeProfiles.length ? activeProfiles.map((profile) => <label className="participant-selection__option" key={profile.id}><input type="checkbox" checked={selected.includes(profile.id)} onChange={() => setSelectedOverride(selected.includes(profile.id) ? selected.filter((id) => id !== profile.id) : [...selected, profile.id])} />{profile.name}</label>) : <p>No hay adultos activos disponibles.</p>}
      </fieldset>
      <div className="form-actions"><button className="button button--primary" disabled={saving || !activeProfiles.length} type="submit">{saving ? 'Guardando...' : 'Guardar participantes'}</button><Link className="button button--secondary" to={`/app/plan-semanal/${weeklyPlanId}/comidas/${plannedMealId}/cantidades`}>Configurar cantidades</Link></div>
      {assign.isError || remove.isError ? <p role="alert">No se pudieron guardar todos los participantes. Revisa la selección e inténtalo nuevamente.</p> : null}
      {!saving && (assign.isSuccess || remove.isSuccess) ? <p role="status">Participantes actualizados.</p> : null}
    </form>
    <button className="button button--secondary" type="button" onClick={() => navigate(`/app/plan-semanal?semana=${plan.data!.weekStart}`)}>Volver al plan</button>
  </section>;
}

function mealLabel(meal: PlannedMeal) { return ({ BREAKFAST: 'desayuno', LUNCH: 'comida', DINNER: 'cena', SNACK: 'colación', EXTRA: 'comida' } as Record<string, string>)[meal.type]; }
