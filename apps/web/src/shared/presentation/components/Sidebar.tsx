import { Apple, ClipboardList, House, LogOut, Soup, UserRound, UtensilsCrossed } from 'lucide-react';
import { NavLink } from 'react-router';
import type { ReactNode } from 'react';
import { Button } from './Button';
import { ThemeControl } from './ThemeControl';

function NavigationLink({
  children,
  icon,
  to,
}: {
  children: string;
  icon: ReactNode;
  to: string;
}) {
  return (
    <NavLink className="sidebar__link" to={to}>
      {icon}
      <span>{children}</span>
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
      <div className="sidebar__section">
        <p className="sidebar__label">Tu espacio</p>
        <NavigationLink icon={<House size={18} aria-hidden="true" />} to="/app">Inicio</NavigationLink>
        <NavLink className="sidebar__link sidebar__link--primary" to="/app/comidas/nueva"><UtensilsCrossed size={18} aria-hidden="true" /><span>Registrar comida</span></NavLink>
        <NavigationLink icon={<UserRound size={18} aria-hidden="true" />} to="/app/perfil">Perfil</NavigationLink>
      </div>
      <div className="sidebar__section">
        <p className="sidebar__label">Organizar</p>
        <NavigationLink icon={<Apple size={18} aria-hidden="true" />} to="/app/alimentos">Alimentos</NavigationLink>
        <NavigationLink icon={<Soup size={18} aria-hidden="true" />} to="/app/recetas">Recetas</NavigationLink>
        <span className="sidebar__link sidebar__link--disabled" aria-disabled="true"><ClipboardList size={18} aria-hidden="true" /><span>Plan</span><small>Próximamente</small></span>
      </div>
      <ThemeControl />
      <Button className="sidebar__logout" disabled={isSigningOut} onClick={onLogout} type="button" variant="tertiary">
        <LogOut size={17} aria-hidden="true" />
        {isSigningOut ? 'Cerrando...' : 'Cerrar sesion'}
      </Button>
    </nav>
  );
}
