import { LogOut } from 'lucide-react';
import { NavLink } from 'react-router';
import type { ReactNode } from 'react';
import { Button } from './Button';
import { ThemeControl } from './ThemeControl';
import { mainNavigation } from '../navigation/mainNavigation';

function NavigationLink({
  children,
  icon,
  to,
  end,
  primary,
}: {
  children: string;
  icon: ReactNode;
  to: string;
  end?: boolean;
  primary?: boolean;
}) {
  return (
    <NavLink className={`sidebar__link${primary ? ' sidebar__link--primary' : ''}`} end={end} to={to}>
      {icon}<span>{children}</span>
    </NavLink>
  );
}

export function Sidebar({
  isSigningOut,
  onLogout,
}: {
  isSigningOut: boolean;
  onLogout: () => void;
}) {
  return (
    <nav className="sidebar" aria-label="Navegacion principal">
      {mainNavigation.map((group) => <div className="sidebar__section" key={group.label}>
        <p className="sidebar__label">{group.label}</p>
        {group.items.map((item) => <NavigationLink end={item.end} icon={item.icon} key={item.to} primary={item.primary} to={item.to}>{item.label}</NavigationLink>)}
      </div>)}
      <ThemeControl />
      <Button className="sidebar__logout" disabled={isSigningOut} onClick={onLogout} type="button" variant="tertiary">
        <LogOut size={17} aria-hidden="true" />
        {isSigningOut ? 'Cerrando...' : 'Cerrar sesion'}
      </Button>
    </nav>
  );
}
