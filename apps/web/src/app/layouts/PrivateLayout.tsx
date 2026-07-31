import { NavLink, Outlet, useNavigate } from 'react-router';
import { Apple, ClipboardList, House, LogOut, UtensilsCrossed } from 'lucide-react';

import { useAuth } from '../../modules/auth/presentation/providers/useAuth';
import { Button } from '../../shared/presentation/components/Button';

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
          <Button
            variant="tertiary"
            disabled={isSigningOut}
            onClick={() => void handleLogout()}
            type="button"
          >
            <LogOut size={17} strokeWidth={2} aria-hidden="true" />
            {isSigningOut ? 'Cerrando...' : 'Cerrar sesion'}
          </Button>
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
        <NavLink to="/app"><House size={18} aria-hidden="true" /><span>Inicio</span></NavLink>
        <NavLink to="/app/comidas/nueva"><UtensilsCrossed size={18} aria-hidden="true" /><span>Registrar</span></NavLink>
        <span aria-disabled="true"><ClipboardList size={18} aria-hidden="true" /><span>Plan</span></span>
        <NavLink to="/app/alimentos"><Apple size={18} aria-hidden="true" /><span>Alimentos</span></NavLink>
      </nav>
    </div>
  );
}
