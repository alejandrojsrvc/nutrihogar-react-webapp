import { Link, useParams } from 'react-router';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import {
  ErrorState,
  LoadingState,
} from '../../../../shared/presentation/components/AsyncState';
import { useWeeklyAdherence } from '../hooks/useMealPlanning';
import { RelatedActions } from '../components/RelatedActions';

export function WeeklyAdherencePage() {
  const { weeklyPlanId } = useParams();
  const query = useWeeklyAdherence(weeklyPlanId);
  if (query.isPending)
    return (
      <section className="page-section">
        <LoadingState message="Cargando adherencia..." />
      </section>
    );
  if (query.isError || !query.data)
    return (
      <section className="page-section">
        <ErrorState
          message="No se pudo cargar el resumen semanal."
          action={
            <button
              className="button button--secondary"
              onClick={() => void query.refetch()}
              type="button"
            >
              Reintentar
            </button>
          }
        />
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
      <section
        className="adherence-overview"
        aria-labelledby="adherence-overview-title"
      >
        <div>
          <span id="adherence-overview-title">Comidas consumidas</span>
          <strong>{percentages.consumed}%</strong>
        </div>
        <p>Una referencia descriptiva de lo ocurrido, sin juicios.</p>
      </section>
      <h2>Plan y consumo</h2>
      <dl className="nutrition-value-list adherence-nutrition">
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
      <h2>Detalle de comidas</h2>
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
      <RelatedActions>
        <Link to={`/app/plan-semanal/${weeklyPlanId}/requerimientos`}>
          Ver requerimientos
        </Link>
        <Link to={`/app/plan-semanal/${weeklyPlanId}/comparacion-inventario`}>
          Comparar inventario
        </Link>
        <Link to={`/app/plan-semanal?semana=${query.data.weekStart}`}>
          Volver al plan
        </Link>
      </RelatedActions>
    </section>
  );
}
