import { Link, useParams } from 'react-router';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useWeeklyAdherence } from '../hooks/useMealPlanning';

export function WeeklyAdherencePage() {
  const { weeklyPlanId } = useParams();
  const query = useWeeklyAdherence(weeklyPlanId);
  if (query.isPending)
    return (
      <p className="page-section" role="status">
        Cargando adherencia...
      </p>
    );
  if (query.isError || !query.data)
    return (
      <section className="page-section" role="alert">
        <p>No se pudo cargar el resumen semanal.</p>
        <button
          className="button button--secondary"
          onClick={() => void query.refetch()}
          type="button"
        >
          Reintentar
        </button>
      </section>
    );
  const { counts, percentages, nutrition } = query.data;
  return (
    <section
      className="page-section meal-planning-detail"
      aria-labelledby="adherence-title"
    >
      <BackButton
        fallback={`/app/plan-semanal?semana=${query.data.weekStart}`}
      />
      <PageHeader
        eyebrow="Plan semanal"
        title="Adherencia del plan"
        titleId="adherence-title"
        description="Valores calculados por el backend a partir del plan y los consumos vinculados."
      />
      <dl className="nutrition-value-list">
        <div>
          <dt>Comidas consumidas</dt>
          <dd>{percentages.consumed}%</dd>
        </div>
        <div>
          <dt>Calorías planificadas</dt>
          <dd>{nutrition.plannedCalories}</dd>
        </div>
        <div>
          <dt>Calorías consumidas</dt>
          <dd>{nutrition.consumedCalories}</dd>
        </div>
        <div>
          <dt>Proteína planificada</dt>
          <dd>{nutrition.plannedProtein}</dd>
        </div>
        <div>
          <dt>Proteína consumida</dt>
          <dd>{nutrition.consumedProtein}</dd>
        </div>
      </dl>
      <ul className="adherence-counts">
        <li>Planificadas: {counts.planned}</li>
        <li>Consumidas: {counts.consumed}</li>
        <li>Omitidas: {counts.skipped}</li>
        <li>Canceladas: {counts.cancelled}</li>
        <li>Sustituidas: {counts.replaced}</li>
        <li>
          No planificadas: {counts.unplanned} ({percentages.unplanned}%)
        </li>
      </ul>
      {query.data.warnings.map((warning) => (
        <p className="notice" key={warning}>
          {warning}
        </p>
      ))}
      <Link
        className="button button--secondary"
        to={`/app/plan-semanal?semana=${query.data.weekStart}`}
      >
        Volver al plan
      </Link>
    </section>
  );
}
