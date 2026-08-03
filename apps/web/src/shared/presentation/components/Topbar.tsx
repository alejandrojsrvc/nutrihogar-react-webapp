import { Link, useLocation } from 'react-router';

import { ProfileMenu } from './ProfileMenu';
import { getAppSection } from '../navigation/mainNavigation';

export function Topbar({
  householdName,
  isSigningOut,
  kitchenMode = false,
  onLogout,
  profileName,
}: {
  householdName: string;
  isSigningOut: boolean;
  kitchenMode?: boolean;
  onLogout: () => void;
  profileName: string;
}) {
  const { pathname } = useLocation();
  const context = kitchenMode ? 'Preparación' : sectionLabels[getAppSection(pathname)];

  return (
    <header className="app-topbar">
      <Link
        className="app-topbar__brand"
        to="/app"
        aria-label="Inicio de NutriHogar"
      >
        <span className="brand-mark" aria-hidden="true">
          N
        </span>
        <span>NutriHogar</span>
      </Link>
      <div className="app-topbar__context">
        <span className="app-topbar__context-label">Sección actual</span>
        <strong>{context}</strong>
      </div>
      <ProfileMenu
        householdName={householdName}
        isSigningOut={isSigningOut}
        onLogout={onLogout}
        profileName={profileName}
      />
    </header>
  );
}

const sectionLabels = {
  hoy: 'Hoy',
  planificar: 'Planificar',
  hogar: 'Hogar',
  progreso: 'Progreso',
} as const;
