import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Link, useParams } from 'react-router';
import { participantQuantitySchema, type ParticipantQuantityValues } from '@nutrihogar/schemas';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { useAcceptQuantitySuggestions, useQuantitySuggestions, useProposeQuantities, useUpdateParticipant, useWeeklyPlan } from '../hooks/useMealPlanning';
import type { PlannedMealParticipant } from '../../domain/MealPlanning';

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
  if (households.isPending || plan.isPending || suggestions.isPending || profiles.isPending) return <p className="page-section" role="status">Cargando cantidades...</p>;
  if (households.isError || plan.isError || suggestions.isError || profiles.isError || !meal) return <p className="page-section" role="alert">No se pudieron cargar las cantidades.</p>;
  const nameFor = (id: string) => profiles.profiles.find((profile) => profile.id === id)?.name ?? 'Adulto';
  return <section className="page-section meal-planning-detail" aria-labelledby="quantities-title"><BackButton fallback={`/app/plan-semanal/${weeklyPlanId}/comidas/${plannedMealId}/participantes`} /><PageHeader eyebrow="Comida planificada" title="Cantidades por adulto" titleId="quantities-title" description="Las sugerencias orientan la decisión; la cantidad confirmada es la que queda guardada." /><div className="form-actions"><button className="button button--secondary" disabled={propose.isPending} onClick={() => propose.mutate(plannedMealId!)} type="button">{propose.isPending ? 'Calculando...' : 'Proponer cantidades'}</button><button className="button button--primary" disabled={accept.isPending || !meal.participants.length} onClick={() => accept.mutate(plannedMealId!)} type="button">{accept.isPending ? 'Aceptando...' : 'Aceptar todas las sugerencias'}</button></div>{accept.isError || propose.isError ? <p role="alert">No se pudo actualizar las sugerencias. Inténtalo nuevamente.</p> : null}{accept.isSuccess ? <p role="status">Sugerencias aceptadas.</p> : null}{meal.participants.length ? <div className="quantity-list">{meal.participants.map((participant) => <QuantityRow key={participant.id} participant={participant} name={nameFor(participant.adultProfileId)} suggestion={suggestions.data?.find((item) => item.participantId === participant.id)} onSave={(input) => updateParticipantUseCaseCall(participant.id, input, update)} />)}</div> : <p className="empty-state">Asigna al menos un adulto para configurar cantidades.</p>}<Link to={`/app/plan-semanal/${weeklyPlanId}/comidas/${plannedMealId}/participantes`}>Administrar participantes</Link></section>;
}

function QuantityRow({ participant, name, suggestion, onSave }: { participant: PlannedMealParticipant; name: string; suggestion?: { quantity: number; unit: string; targetCalories: number }; onSave: (value: ParticipantQuantityValues) => Promise<void> }) {
  const form = useForm<z.input<typeof participantQuantitySchema>, unknown, ParticipantQuantityValues>({ resolver: zodResolver(participantQuantitySchema), defaultValues: { quantity: participant.confirmedQuantity ?? participant.suggestedQuantity ?? suggestion?.quantity ?? undefined, unit: participant.confirmedUnit ?? participant.suggestedUnit ?? suggestion?.unit ?? '' } });
  return <form className="quantity-row" onSubmit={form.handleSubmit(onSave)}><h2>{name}</h2>{suggestion ? <p className="quantity-row__suggestion">Sugerencia: {suggestion.quantity} {suggestion.unit}. Objetivo de referencia: {suggestion.targetCalories} kcal.</p> : <p className="quantity-row__suggestion">Sin sugerencia disponible.</p>}<div className="quantity-row__fields"><div className="form-field"><label htmlFor={`quantity-${participant.id}`}>Cantidad confirmada</label><input id={`quantity-${participant.id}`} inputMode="decimal" step="any" {...form.register('quantity')} aria-invalid={Boolean(form.formState.errors.quantity)} />{form.formState.errors.quantity ? <span className="form-field__error">{form.formState.errors.quantity.message}</span> : null}</div><div className="form-field"><label htmlFor={`unit-${participant.id}`}>Unidad</label><input id={`unit-${participant.id}`} {...form.register('unit')} aria-invalid={Boolean(form.formState.errors.unit)} />{form.formState.errors.unit ? <span className="form-field__error">{form.formState.errors.unit.message}</span> : null}</div></div><button className="button button--secondary" disabled={form.formState.isSubmitting} type="submit">{form.formState.isSubmitting ? 'Guardando...' : 'Guardar cantidad'}</button>{form.formState.isSubmitSuccessful ? <p role="status">Cantidad guardada.</p> : null}</form>;
}
async function updateParticipantUseCaseCall(id: string, value: ParticipantQuantityValues, mutation: ReturnType<typeof useUpdateParticipant>) { await mutation.mutateAsync({ participantId: id, input: { confirmedQuantity: value.quantity, confirmedUnit: value.unit } }); }
