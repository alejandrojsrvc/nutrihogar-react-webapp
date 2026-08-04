import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';

import { useAuth } from '../../modules/auth/presentation/providers/useAuth';
import { useAdultProfiles } from '../../modules/households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../modules/households/presentation/hooks/useHouseholds';
import { Sidebar } from '../../shared/presentation/components/Sidebar';
import { SectionNavigation } from '../../shared/presentation/components/SectionNavigation';
import { Topbar } from '../../shared/presentation/components/Topbar';
import { ConnectionNotice } from '../../shared/presentation/components/AsyncState';
import { ActiveProfileProvider } from '../../shared/presentation/providers/ActiveProfileContext';
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
    <ActiveProfileProvider
      profiles={profiles.profiles}
    >
      <div className="private-layout">
        <div className="app-shell">
          <Sidebar secondaryItems={secondaryItems} />
          <div className="app-workspace">
            <Topbar
              householdName={activeHousehold?.name ?? 'Mi hogar'}
              isSigningOut={isSigningOut}
              onLogout={() => void handleLogout()}
            />
            {connectionMessage ? (
              <ConnectionNotice message={connectionMessage} />
            ) : null}
            {error ? (
              <p className="auth-error auth-error--layout" role="alert">
                No pudimos completar la sesión. Inténtalo nuevamente.
              </p>
            ) : null}
            <main className="private-layout__content">
              {secondaryItems ? (
                <div className="section-navigation-mobile">
                  <SectionNavigation
                    ariaLabel="Secciones de la aplicación"
                    items={secondaryItems}
                  />
                </div>
              ) : null}
              <Outlet />
            </main>
          </div>
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
                  ? `mobile-bottom-bar__link is-active${item.action ? ' mobile-bottom-bar__link--action' : ''}`
                  : `mobile-bottom-bar__link${item.action ? ' mobile-bottom-bar__link--action' : ''}`
              }
              end={item.end}
              key={item.to}
              to={item.to}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </ActiveProfileProvider>
  );
}
