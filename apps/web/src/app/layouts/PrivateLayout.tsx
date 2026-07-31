import { NavLink, Outlet, useNavigate } from 'react-router';
import { useState } from 'react';
import { House, UserRound, UtensilsCrossed } from 'lucide-react';

import { useAuth } from '../../modules/auth/presentation/providers/useAuth';
import { MobileDrawer } from '../../shared/presentation/components/MobileDrawer';
import { Sidebar } from '../../shared/presentation/components/Sidebar';
import { Topbar } from '../../shared/presentation/components/Topbar';

export function PrivateLayout() {
  const navigate = useNavigate();
  const { error, isSigningOut, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function handleLogout() {
    if (await logout()) {
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className="private-layout">
      <Topbar onMenuOpen={() => setIsMenuOpen(true)} />
      {error ? (
        <p className="auth-error auth-error--layout" role="alert">
          {error.message}
        </p>
      ) : null}
      <div className="app-shell">
        <Sidebar isSigningOut={isSigningOut} onLogout={() => void handleLogout()} />
        <main className="private-layout__content">
          <Outlet />
        </main>
      </div>
      <nav className="mobile-bottom-bar" aria-label="Acciones principales">
        <NavLink to="/app"><House size={18} aria-hidden="true" /><span>Inicio</span></NavLink>
        <NavLink className="mobile-bottom-bar__primary" to="/app/comidas/nueva"><UtensilsCrossed size={18} aria-hidden="true" /><span>Registrar</span></NavLink>
        <NavLink to="/app/perfil"><UserRound size={18} aria-hidden="true" /><span>Perfil</span></NavLink>
      </nav>
      <MobileDrawer
        isOpen={isMenuOpen}
        isSigningOut={isSigningOut}
        onClose={() => setIsMenuOpen(false)}
        onLogout={() => void handleLogout()}
      />
    </div>
  );
}
