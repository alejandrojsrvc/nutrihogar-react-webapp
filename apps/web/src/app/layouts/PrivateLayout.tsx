import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';

import { useAuth } from '../../modules/auth/presentation/providers/useAuth';
import { useAdultProfiles } from '../../modules/households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../modules/households/presentation/hooks/useHouseholds';
import { Sidebar } from '../../shared/presentation/components/Sidebar';
import { SectionNavigation } from '../../shared/presentation/components/SectionNavigation';
import { Topbar } from '../../shared/presentation/components/Topbar';
import {
  isPrimaryNavigationActive,
  primaryNavigation,
  secondaryNavigationForPath,
} from '../../shared/presentation/navigation/mainNavigation';

export function PrivateLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { error, isSigningOut, logout } = useAuth();
  const { activeHousehold } = useHouseholds();
  const profiles = useAdultProfiles(activeHousehold?.id);
  const kitchenMode = /^\/app\/(preparaciones|porciones)/.test(
    location.pathname,
  );
  const profileName =
    profiles.profiles.find((profile) => profile.isActive !== false)?.name ??
    'Mi perfil';
  const [connectionMessage, setConnectionMessage] = useState<string | null>(
    null,
  );
  const secondaryItems = secondaryNavigationForPath(location.pathname);

  useEffect(() => {
    let timeout: number | undefined;
    const showConnectionMessage = (isOnline: boolean) => {
      setConnectionMessage(
        isOnline
          ? 'Conexión restablecida.'
          : 'Sin conexión. Los cambios compatibles quedarán pendientes.',
      );
      if (timeout) window.clearTimeout(timeout);
      timeout = window.setTimeout(() => setConnectionMessage(null), 4500);
    };
    const handleOnline = () => showConnectionMessage(true);
    const handleOffline = () => showConnectionMessage(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timeout) window.clearTimeout(timeout);
    };
  }, []);

  async function handleLogout() {
    if (await logout()) {
      navigate('/login', { replace: true });
    }
  }

  return (
    <div
      className={`private-layout${kitchenMode ? ' private-layout--kitchen' : ''}`}
    >
      <Topbar
        householdName={activeHousehold?.name ?? 'Mi hogar'}
        isSigningOut={isSigningOut}
        kitchenMode={kitchenMode}
        onLogout={() => void handleLogout()}
        profileName={profileName}
      />
      {connectionMessage ? (
        <p className="connection-feedback" role="status" aria-live="polite">
          {connectionMessage}
        </p>
      ) : null}
      {error ? (
        <p className="auth-error auth-error--layout" role="alert">
          {error.message}
        </p>
      ) : null}
      <div className="app-shell">
        <Sidebar />
        <main className="private-layout__content">
          {secondaryItems ? (
            <SectionNavigation
              ariaLabel="Secciones de la aplicación"
              items={secondaryItems}
            />
          ) : null}
          <Outlet />
        </main>
      </div>
      <nav className="mobile-bottom-bar" aria-label="Secciones principales">
        {primaryNavigation.map((item) => (
          <NavLink
            aria-current={
              isPrimaryNavigationActive(item.to, location.pathname)
                ? 'page'
                : undefined
            }
            className={
              isPrimaryNavigationActive(item.to, location.pathname)
                ? 'mobile-bottom-bar__link is-active'
                : 'mobile-bottom-bar__link'
            }
            key={item.to}
            to={item.to}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
