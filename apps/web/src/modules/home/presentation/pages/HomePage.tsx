import { Link, Navigate } from 'react-router';

import { useHealth } from '../../../../shared/presentation/hooks/useHealth';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';

export function HomePage() {
  const healthQuery = useHealth();
  const {
    activeHousehold,
    households,
    isError: householdsError,
    isPending: householdsPending,
    selectActiveHousehold,
  } = useHouseholds();
  const profilesQuery = useAdultProfiles(activeHousehold?.id);

  if (householdsPending) {
    return (
      <section className="page-section" aria-labelledby="home-loading-title">
        <p className="eyebrow">Inicio</p>
        <h1 id="home-loading-title">Cargando tu espacio familiar</h1>
        <p className="lead" role="status">
          Consultando tus hogares...
        </p>
      </section>
    );
  }

  if (householdsError) {
    return (
      <section className="page-section" aria-labelledby="home-error-title">
        <p className="eyebrow">Inicio</p>
        <h1 id="home-error-title">No pudimos cargar tu hogar</h1>
        <p className="lead" role="alert">
          No se pudo conectar con la API de NutriHogar.
        </p>
      </section>
    );
  }

  if (households.length === 0) {
    return <Navigate replace to="/onboarding" />;
  }

  if (!activeHousehold) {
    return (
      <section className="page-section" aria-labelledby="household-select-title">
        <p className="eyebrow">Tus hogares</p>
        <h1 id="household-select-title">Elige un hogar para continuar</h1>
        <p className="lead">
          Selecciona el espacio familiar que quieres consultar.
        </p>
        <div className="household-list" role="list">
          {households.map((household) => (
            <button
              className="household-list__item"
              key={household.id}
              onClick={() => selectActiveHousehold(household)}
              type="button"
            >
              <span>{household.name}</span>
              <small>{household.currency}</small>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="page-section" aria-labelledby="home-title">
      <p className="eyebrow">Inicio</p>
      <h1 id="home-title">Tu hogar empieza aqui</h1>
      <div className="household-summary">
        <p className="household-summary__label">Hogar activo</p>
        <h2>{activeHousehold.name}</h2>
        <p>
          {activeHousehold.currency} · {activeHousehold.timezone}
        </p>
      </div>
      <p className="lead">
        Cuando completes la configuracion, encontraras en este espacio el plan
        de hoy y las acciones principales.
      </p>
      <div className="household-section">
        <h2>Integrantes</h2>
        {profilesQuery.isPending ? (
          <p role="status">Cargando integrantes...</p>
        ) : null}
        {profilesQuery.isError ? (
          <p role="alert">No se pudieron cargar los integrantes.</p>
        ) : null}
        {!profilesQuery.isPending &&
        !profilesQuery.isError &&
        profilesQuery.profiles.length === 0 ? (
          <p>Aun no hay perfiles adultos configurados en este hogar.</p>
        ) : null}
        {profilesQuery.profiles.length > 0 ? (
          <div className="profile-list">
            {profilesQuery.profiles.map((profile) => (
              <div className="profile-card" key={profile.id}>
                <strong>{profile.name}</strong>
                <span>{profile.heightCm} cm</span>
              </div>
            ))}
          </div>
        ) : null}
        <Link className="button button--secondary" to="/app/perfil">
          Configurar perfil
        </Link>
        <Link className="button button--secondary" to="/app/invitaciones">
          Gestionar invitaciones
        </Link>
      </div>
      {healthQuery.isPending && (
        <p className="lead" role="status">
          Comprobando la conexion con NutriHogar...
        </p>
      )}
      {healthQuery.isError && (
        <p className="lead" role="alert">
          No se pudo conectar con la API de NutriHogar.
        </p>
      )}
      {healthQuery.data && (
        <p className="lead" role="status">
          API disponible.
        </p>
      )}
      <div className="empty-state">
        <div className="empty-state__illustration" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <h2>Aun no hay informacion para mostrar</h2>
        <p>Los datos de tu familia apareceran aqui.</p>
      </div>
    </section>
  );
}
