import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <main className="not-found-page">
      <p className="not-found-page__code">404</p>
      <h1>Esta pagina no esta en la mesa</h1>
      <p>Puede que el enlace haya cambiado o ya no este disponible.</p>
      <Link className="button button--primary" to="/">
        Volver al inicio
      </Link>
    </main>
  );
}
