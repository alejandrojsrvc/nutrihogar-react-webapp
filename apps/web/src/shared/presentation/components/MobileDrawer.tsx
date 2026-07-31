import { LogOut, X } from 'lucide-react';
import { NavLink } from 'react-router';

import { IconButton } from './IconButton';
import { Button } from './Button';

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
      <aside className="mobile-drawer" aria-label="Menú de navegación">
        <div className="mobile-drawer__header">
          <strong>NutriHogar</strong>
          <IconButton aria-label="Cerrar menú" onClick={onClose} type="button"><X size={20} aria-hidden="true" /></IconButton>
        </div>
        <p className="sidebar__label">Tu espacio</p>
        <NavLink className="sidebar__link" onClick={onClose} to="/app">Inicio</NavLink>
        <NavLink className="sidebar__link sidebar__link--primary" onClick={onClose} to="/app/comidas/nueva">Registrar comida</NavLink>
        <NavLink className="sidebar__link" onClick={onClose} to="/app/perfil">Perfil</NavLink>
        <NavLink className="sidebar__link" onClick={onClose} to="/app/alimentos">Alimentos</NavLink>
        <Button className="mobile-drawer__logout" disabled={isSigningOut} onClick={onLogout} type="button" variant="tertiary"><LogOut size={17} aria-hidden="true" />{isSigningOut ? 'Cerrando...' : 'Cerrar sesión'}</Button>
      </aside>
    </div>
  );
}
