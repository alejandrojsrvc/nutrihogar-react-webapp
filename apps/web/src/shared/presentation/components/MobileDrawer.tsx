import { LogOut, X } from 'lucide-react';
import { NavLink } from 'react-router';

import { IconButton } from './IconButton';
import { Button } from './Button';
import { mainNavigation } from '../navigation/mainNavigation';

export function MobileDrawer({
  isOpen,
  isSigningOut,
  onClose,
  onLogout,
}: {
  isOpen: boolean;
  isSigningOut: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="mobile-drawer-layer">
      <button className="mobile-drawer__backdrop" aria-label="Cerrar menú" onClick={onClose} type="button" />
      <aside aria-labelledby="mobile-navigation-title" aria-modal="true" className="mobile-drawer" id="mobile-navigation-drawer" role="dialog">
        <div className="mobile-drawer__header">
          <strong id="mobile-navigation-title">Menú de navegación</strong>
          <IconButton aria-label="Cerrar menú" onClick={onClose} type="button"><X size={20} aria-hidden="true" /></IconButton>
        </div>
        <nav aria-label="Menú de navegación">
        {mainNavigation.map((group) => <div className="mobile-drawer__section" key={group.label}>
          <p className="sidebar__label">{group.label}</p>
          {group.items.map((item) => <NavLink className={`sidebar__link${item.primary ? ' sidebar__link--primary' : ''}`} end={item.end} key={item.to} onClick={onClose} to={item.to}>{item.icon}<span>{item.label}</span></NavLink>)}
        </div>)}
        </nav>
        <Button className="mobile-drawer__logout" disabled={isSigningOut} onClick={onLogout} type="button" variant="tertiary"><LogOut size={17} aria-hidden="true" />{isSigningOut ? 'Cerrando...' : 'Cerrar sesión'}</Button>
      </aside>
    </div>
  );
}
