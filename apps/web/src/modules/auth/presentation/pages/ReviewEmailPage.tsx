import { Link, useLocation } from 'react-router';

import { getAuthRedirectPath } from '../utils/authRedirect';

export function ReviewEmailPage() {
  const location = useLocation();
  const redirectPath = getAuthRedirectPath(location.state);

  return (
    <section className="welcome-panel" aria-labelledby="review-email-title">
      <p className="eyebrow">Un último paso</p>
      <h1 id="review-email-title">Revisa tu correo</h1>
      <p className="lead">
        Te enviamos un enlace para confirmar tu cuenta. Cuando lo confirmes,
        volverás a NutriHogar para continuar.
      </p>
      <Link
        className="button button--primary"
        state={{ from: redirectPath }}
        to="/login"
      >
        Volver al inicio de sesión
      </Link>
    </section>
  );
}
