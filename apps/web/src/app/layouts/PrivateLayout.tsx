import { NavLink, Outlet } from 'react-router';

export function PrivateLayout() {
  return (
    <div className="private-layout">
      <header className="app-header">
        <NavLink
          className="app-header__brand"
          to="/app"
          aria-label="Inicio de NutriHogar"
        >
          <span className="brand-mark" aria-hidden="true">
            N
          </span>
          <span>NutriHogar</span>
        </NavLink>
        <span className="app-header__context">Area familiar</span>
      </header>
      <main className="private-layout__content">
        <Outlet />
      </main>
      <nav className="bottom-navigation" aria-label="Navegacion principal">
        <NavLink to="/app">Inicio</NavLink>
        <span aria-disabled="true">Plan</span>
        <span aria-disabled="true">Inventario</span>
      </nav>
    </div>
  );
}
