import {
  Bell,
  ChevronDown,
  CircleUserRound,
  House,
  LogOut,
  Settings,
} from 'lucide-react';
import { Link } from 'react-router';
import type { MouseEvent } from 'react';
import { useActiveProfile } from '../providers/ActiveProfileContext';
import { ThemeControl } from './ThemeControl';

export function ProfileMenu({
  isSigningOut,
  onLogout,
  householdName,
  profileName,
}: {
  isSigningOut: boolean;
  onLogout: () => void;
  householdName: string;
  profileName: string;
}) {
  const { activeProfile, profiles, selectActiveProfile } = useActiveProfile();

  return (
    <details className="profile-menu">
      <summary
        aria-label={`Menú de ${profileName}`}
        className="profile-menu__trigger"
        >
          <span className="profile-menu__avatar" aria-hidden="true">
            {initials(profileName)}
          </span>
          <span className="profile-menu__name">{profileName}</span>
          <ChevronDown size={16} aria-hidden="true" />
        </summary>
      <div className="profile-menu__content">
        <p className="profile-menu__heading">
          {householdName}
          <small>{profileName}</small>
        </p>
        {profiles.length > 1 ? (
          <div className="profile-menu__profiles" aria-label="Cambiar integrante">
            {profiles.map((profile) => (
              <button
                aria-pressed={profile.id === activeProfile?.id}
                className="profile-menu__item"
                key={profile.id}
                onClick={() => selectActiveProfile(profile.id)}
                type="button"
              >
                <CircleUserRound size={18} aria-hidden="true" />
                <span>{profile.name}</span>
                {profile.id === activeProfile?.id ? <small>Activo</small> : null}
              </button>
            ))}
          </div>
        ) : null}
        <button
          className="profile-menu__item profile-menu__item--disabled"
          disabled
          type="button"
        >
          <Bell size={18} aria-hidden="true" />
          <span>Notificaciones</span>
          <small>No disponible todavía</small>
        </button>
        <Link
          className="profile-menu__item"
          onClick={closeProfileMenu}
          to="/app/familia"
        >
          <House size={18} aria-hidden="true" />
          <span>Configuración del hogar</span>
        </Link>
        <div className="profile-menu__theme">
          <ThemeControl />
        </div>
        <Link
          className="profile-menu__item"
          onClick={closeProfileMenu}
          to="/app/perfil"
        >
          <Settings size={18} aria-hidden="true" />
          <span>Preferencias personales</span>
        </Link>
        <button
          className="profile-menu__item profile-menu__logout"
          disabled={isSigningOut}
          onClick={(event) => {
            closeProfileMenu(event);
            onLogout();
          }}
          type="button"
        >
          <LogOut size={18} aria-hidden="true" />
          <span>{isSigningOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
        </button>
      </div>
    </details>
  );
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function closeProfileMenu(event: MouseEvent<HTMLElement>) {
  event.currentTarget.closest('details')?.removeAttribute('open');
}
