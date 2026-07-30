import { NavLink, Outlet, useNavigate } from 'react-router';

import { useAuth } from '../../modules/auth/presentation/providers/useAuth';

export function PrivateLayout() {
  const navigate = useNavigate();
  const { error, isSigningOut, logout } = useAuth();

  async function handleLogout() {
    if (await logout()) {
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className="private-layout">
      <header className="app-header">
        <NavLink
          className="app-header__brand"
          to="/app"
          aria-label="Inicio de NutriHogar"
        >
          <span className="brand-mark" aria-hidden="true">
            N
          </span>
          <span>NutriHogar</span>
        </NavLink>
        <div className="app-header__actions">
          <span className="app-header__context">Area familiar</span>
          <button
            className="button button--secondary"
            disabled={isSigningOut}
            onClick={() => void handleLogout()}
            type="button"
          >
            {isSigningOut ? 'Cerrando...' : 'Cerrar sesion'}
          </button>
        </div>
      </header>
      {error ? (
        <p className="auth-error auth-error--layout" role="alert">
          {error.message}
        </p>
      ) : null}
      <main className="private-layout__content">
        <Outlet />
      </main>
      <nav className="bottom-navigation" aria-label="Navegacion principal">
        <NavLink to="/app">Inicio</NavLink>
        <span aria-disabled="true">Plan</span>
        <span aria-disabled="true">Inventario</span>
      </nav>
    </div>
  );
}
