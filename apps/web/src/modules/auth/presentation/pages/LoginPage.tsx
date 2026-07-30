import { Link } from 'react-router';

export function LoginPage() {
  return (
    <section className="welcome-panel" aria-labelledby="login-title">
      <p className="eyebrow">Tu alimentacion, en familia</p>
      <h1 id="login-title">Bienvenido a NutriHogar</h1>
      <p className="lead">
        Un espacio simple para organizar la nutricion y el bienestar de tu
        hogar.
      </p>
      <Link className="button button--primary" to="/onboarding">
        Continuar
      </Link>
      <p className="supporting-text">
        El inicio de sesion estara disponible proximamente.
      </p>
    </section>
  );
}
