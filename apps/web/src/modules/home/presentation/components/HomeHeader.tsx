import { House, Sun } from 'lucide-react';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { todayInTimezone } from '../../../meal-planning/domain/week';
import '../home.css';

export function HomeHeader() {
  const {
    activeHousehold,
    households,
    isError: householdsError,
    isPending: householdsPending,
  } = useHouseholds();

  if (householdsPending) {
    return (
      <PageHeader
        eyebrow="Inicio"
        icon={<House size={22} />}
        title="Cargando tu espacio familiar"
        titleId="home-loading-title"
      />
    );
  }

  if (householdsError) {
    return (
      <PageHeader
        eyebrow="Inicio"
        icon={<House size={22} />}
        title="No pudimos cargar tu hogar"
        titleId="home-error-title"
      />
    );
  }

  if (households.length === 0) return null;

  if (!activeHousehold) {
    return (
      <PageHeader
        description="Selecciona el espacio familiar que quieres consultar."
        eyebrow="Tus hogares"
        icon={<House size={22} />}
        title="Elige un hogar para continuar"
        titleId="household-select-title"
      />
    );
  }

  const date = todayInTimezone(activeHousehold.timezone);

  return (
    <header className="home-header">
      <div className="home-page__title-wrap">
        <span className="home-page__title-icon" aria-hidden="true">
          <Sun size={28} strokeWidth={1.8} />
        </span>
        <div>
          <h1 id="home-title">Hoy</h1>
          <p className="home-page__date">{formatToday(date, activeHousehold.timezone)}</p>
        </div>
      </div>
    </header>
  );
}

function formatToday(date: string, timezone: string) {
  const formatted = new Intl.DateTimeFormat('es-ES', {
    timeZone: timezone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${date}T12:00:00`));
  return formatted
    .replace(',', '')
    .replace(/^./, (letter) => letter.toUpperCase());
}
