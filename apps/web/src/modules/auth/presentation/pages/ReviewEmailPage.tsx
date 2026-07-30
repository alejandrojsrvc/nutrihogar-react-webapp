import { Link } from 'react-router';

export function ReviewEmailPage() {
  return (
    <section className="welcome-panel" aria-labelledby="review-email-title">
      <p className="eyebrow">Un ultimo paso</p>
      <h1 id="review-email-title">Revisa tu correo</h1>
      <p className="lead">
        Te enviamos un enlace para confirmar tu cuenta. Cuando lo confirmes,
        volveras a NutriHogar para continuar.
      </p>
      <Link className="button button--primary" to="/login">
        Volver al inicio de sesion
      </Link>
    </section>
  );
}
