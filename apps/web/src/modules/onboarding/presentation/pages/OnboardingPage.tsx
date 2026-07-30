import { Link } from 'react-router';

export function OnboardingPage() {
  return (
    <section className="page-section" aria-labelledby="onboarding-title">
      <p className="eyebrow">Primeros pasos</p>
      <h1 id="onboarding-title">Preparemos tu hogar</h1>
      <p className="lead">
        Aqui podras configurar las personas, preferencias y objetivos de tu
        familia.
      </p>
      <div className="placeholder-block">
        <span className="placeholder-block__number">1</span>
        <div>
          <h2>Configuracion del hogar</h2>
          <p>Este recorrido se habilitara en una proxima etapa.</p>
        </div>
      </div>
      <Link className="button button--primary" to="/app">
        Ver inicio provisional
      </Link>
    </section>
  );
}
