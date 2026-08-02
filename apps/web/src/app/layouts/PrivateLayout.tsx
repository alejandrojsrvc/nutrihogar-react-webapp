import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useState } from 'react';
import { ClipboardList, House, UtensilsCrossed } from 'lucide-react';

import { useAuth } from '../../modules/auth/presentation/providers/useAuth';
import { useHouseholds } from '../../modules/households/presentation/hooks/useHouseholds';
import { useInventorySyncStatus } from '../../modules/inventory/presentation/hooks/useInventory';
import { MobileDrawer } from '../../shared/presentation/components/MobileDrawer';
import { Sidebar } from '../../shared/presentation/components/Sidebar';
import { Topbar } from '../../shared/presentation/components/Topbar';

export function PrivateLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { error, isSigningOut, logout } = useAuth();
  const { activeHousehold } = useHouseholds();
  const syncStatus = useInventorySyncStatus(activeHousehold?.id);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const kitchenMode = /^\/app\/(preparaciones|porciones)/.test(location.pathname);

  async function handleLogout() {
    if (await logout()) {
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className={`private-layout${kitchenMode ? ' private-layout--kitchen' : ''}`}>
      <Topbar isMenuOpen={isMenuOpen} kitchenMode={kitchenMode} onMenuOpen={() => setIsMenuOpen(true)} />
      {syncStatus.data ? <p className="private-layout__sync" role="status">{syncStatus.data.isOnline ? 'Conectado' : 'Sin conexión'}{syncStatus.data.pendingCount > 0 ? ` · ${syncStatus.data.pendingCount} pendiente${syncStatus.data.pendingCount === 1 ? '' : 's'}` : ''}{syncStatus.data.conflictsCount > 0 ? ` · ${syncStatus.data.conflictsCount} conflicto${syncStatus.data.conflictsCount === 1 ? '' : 's'}` : ''}</p> : null}
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
        <NavLink end to="/app"><House size={18} aria-hidden="true" /><span>Inicio</span></NavLink>
        <NavLink className="mobile-bottom-bar__primary" to="/app/comidas/nueva"><UtensilsCrossed size={18} aria-hidden="true" /><span>Registrar</span></NavLink>
        <NavLink to="/app/lista-de-compras"><ClipboardList size={18} aria-hidden="true" /><span>Lista</span></NavLink>
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
