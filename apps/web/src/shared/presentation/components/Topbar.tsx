import { Menu } from 'lucide-react';
import { Link } from 'react-router';

import { IconButton } from './IconButton';

export function Topbar({ onMenuOpen }: { onMenuOpen: () => void }) {
  return (
    <header className="app-topbar">
      <Link className="app-topbar__brand" to="/app" aria-label="Inicio de NutriHogar">
        <span className="brand-mark" aria-hidden="true">N</span>
        <span>NutriHogar</span>
      </Link>
      <div className="app-topbar__context">
        <span className="app-topbar__context-label">Area familiar</span>
        <strong>Mi hogar</strong>
      </div>
      <IconButton aria-label="Abrir menú de navegación" className="app-topbar__menu" onClick={onMenuOpen} type="button">
        <Menu size={20} aria-hidden="true" />
      </IconButton>
    </header>
  );
}
