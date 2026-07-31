import { Link, useNavigate, useParams } from 'react-router';
import { useState } from 'react';

import {
  formatCalories,
  formatGrams,
  type NutritionSummary,
} from '@nutrihogar/domain';
import { EmptyState } from '../../../../shared/presentation/components/EmptyState';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { useDailyNutritionSummary } from '../hooks/useMeals';

const mealTypeLabels: Record<string, string> = {
  BREAKFAST: 'Desayuno',
  DINNER: 'Cena',
  EXTRA: 'Extra',
  LUNCH: 'Almuerzo',
  SNACK: 'Merienda',
};

const nutrients: Array<{
  key: keyof NutritionSummary;
  label: string;
  color: string;
}> = [
  { color: 'protein', key: 'proteinGrams', label: 'Proteína' },
  { color: 'carbohydrates', key: 'carbohydrateGrams', label: 'Carbohidratos' },
  { color: 'fat', key: 'fatGrams', label: 'Grasas' },
  { color: 'fiber', key: 'fiberGrams', label: 'Fibra' },
];

export function DailyNutritionSummaryPage() {
  const navigate = useNavigate();
  const { date = today() } = useParams();
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const activeProfileId = selectedProfileId || profiles.profiles[0]?.id || '';
  const summaryQuery = useDailyNutritionSummary(activeProfileId, date);

  function changeDate(value: string) {
    if (value) navigate(`/app/resumen/${value}`);
  }

  if (!households.activeHousehold || profiles.isPending) {
    return <p className="page-section" role="status">Cargando integrantes...</p>;
  }

  if (profiles.isError) {
    return <p className="page-section" role="alert">No se pudieron cargar los integrantes.</p>;
  }

  if (profiles.profiles.length === 0) {
    return (
      <section className="page-section" aria-labelledby="summary-empty-profile-title">
        <PageHeader eyebrow="Resumen diario" title="Configura un adulto primero" titleId="summary-empty-profile-title" />
        <p className="lead">Necesitas un perfil adulto para consultar el consumo del día.</p>
        <Link className="button button--primary" to="/app/perfil">Configurar perfil</Link>
      </section>
    );
  }

  return (
    <section className="page-section daily-summary-page" aria-labelledby="daily-summary-title">
      <PageHeader
        action={<Link className="button button--primary" to={`/app/comidas/nueva?profileId=${activeProfileId}&date=${date}`}>Registrar comida</Link>}
        eyebrow="Nutrición familiar"
        title="Resumen del día"
        titleId="daily-summary-title"
      />
      <div className="summary-filters">
        <div className="form-field">
          <label htmlFor="summary-profile">Adulto</label>
          <select id="summary-profile" value={activeProfileId} onChange={(event) => setSelectedProfileId(event.target.value)}>
            {profiles.profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="summary-date">Fecha</label>
          <input id="summary-date" type="date" value={date} onChange={(event) => changeDate(event.target.value)} />
        </div>
      </div>

      {summaryQuery.isPending ? <p className="summary-status" role="status">Cargando el resumen...</p> : null}
      {summaryQuery.isError ? <p className="summary-status" role="alert">No se pudo cargar el resumen. Inténtalo nuevamente.</p> : null}
      {summaryQuery.data ? <SummaryContent summary={summaryQuery.data} /> : null}
    </section>
  );
}

function SummaryContent({ summary }: { summary: NonNullable<ReturnType<typeof useDailyNutritionSummary>['data']> }) {
  return (
    <>
      <div className="daily-summary-heading">
        <div>
          <p className="eyebrow">{formatDate(summary.date)}</p>
          <h2>{summary.profile.name}</h2>
        </div>
        <p className="daily-summary-heading__calories">{formatCalories(summary.consumed.calories)} <span>consumidas</span></p>
      </div>
      {!summary.goal ? (
        <EmptyState title="Este día no tiene meta" description="Puedes consultar el consumo registrado aunque todavía no haya una meta nutricional vigente." />
      ) : null}
      <section className="nutrition-summary" aria-labelledby="nutrition-summary-title">
        <div className="section-heading"><div><p className="eyebrow">Balance nutricional</p><h2 id="nutrition-summary-title">Consumido frente al objetivo</h2></div></div>
        <NutritionMetric label="Calorías" color="calories" consumed={summary.consumed.calories} goal={summary.goal?.calories} remaining={summary.remaining.calories} unit="kcal" />
        {nutrients.map((nutrient) => <NutritionMetric key={nutrient.key} label={nutrient.label} color={nutrient.color} consumed={summary.consumed[nutrient.key]} goal={summary.goal?.[nutrient.key]} remaining={summary.remaining[nutrient.key]} unit="g" />)}
      </section>
      <section className="daily-meals" aria-labelledby="daily-meals-title">
        <div className="section-heading"><div><p className="eyebrow">Registro</p><h2 id="daily-meals-title">Comidas del día</h2></div></div>
        {summary.meals.length === 0 ? <EmptyState title="Todavía no hay comidas" description="Registra la primera comida de este día para verla aquí." /> : <div className="daily-meal-list">{summary.meals.map((meal) => <Link className="daily-meal" key={meal.id} to={`/app/comidas/${meal.id}`}><span><strong>{mealTypeLabels[meal.mealType] ?? meal.mealType}</strong><small>{formatTime(meal.consumedAt)}</small></span><span className="daily-meal__totals">{formatCalories(meal.totals.calories)}<small>Ver detalle</small></span></Link>)}</div>}
      </section>
    </>
  );
}

function NutritionMetric({ color, consumed, goal, label, remaining, unit }: { color: string; consumed: number; goal?: number; label: string; remaining: number; unit: string }) {
  const percentage = goal && goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
  return <div className={`nutrition-metric nutrition-metric--${color}`}><div className="nutrition-metric__heading"><span>{label}</span><strong>{formatValue(consumed, unit)}{goal == null ? '' : ` / ${formatValue(goal, unit)}`}</strong></div>{goal != null ? <><div className="nutrition-metric__track" role="progressbar" aria-label={`${label}: ${formatValue(consumed, unit)} de ${formatValue(goal, unit)}`} aria-valuemax={goal} aria-valuemin={0} aria-valuenow={Math.min(consumed, goal)}><span style={{ width: `${percentage}%` }} /></div><p className="nutrition-metric__remaining">{remaining > 0 ? `Restan ${formatValue(remaining, unit)}` : 'Objetivo alcanzado'}</p></> : <p className="supporting-text">Sin objetivo para esta fecha</p>}</div>;
}

function formatValue(value: number, unit: string) { return unit === 'kcal' ? formatCalories(value) : formatGrams(value); }
function formatDate(value: string) { return new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)); }
function formatTime(value: string) { return new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value)); }
function today() { return new Date().toISOString().slice(0, 10); }
