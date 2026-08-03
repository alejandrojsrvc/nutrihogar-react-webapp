import { Bell, CircleUserRound, House, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router';
import type { MouseEvent } from 'react';

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
  return (
    <details className="profile-menu">
      <summary className="profile-menu__trigger">
        <CircleUserRound size={20} aria-hidden="true" />
        <span className="profile-menu__name">{profileName}</span>
      </summary>
      <div className="profile-menu__content">
        <p className="profile-menu__heading">
          {householdName}
          <small>{profileName}</small>
        </p>
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

function closeProfileMenu(event: MouseEvent<HTMLElement>) {
  event.currentTarget.closest('details')?.removeAttribute('open');
}
