import { Link, NavLink, useLocation } from 'react-router';

import {
  isPrimaryNavigationActive,
  primaryNavigation,
} from '../navigation/mainNavigation';

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="sidebar" aria-label="Navegación principal">
      <Link className="sidebar__brand" to="/app">
        <span className="brand-mark" aria-hidden="true">
          N
        </span>
        <span>NutriHogar</span>
      </Link>
      <nav aria-label="Destinos principales" className="sidebar__destinations">
        {primaryNavigation.map((item) => (
          <NavLink
            aria-current={
              isPrimaryNavigationActive(item.to, pathname) ? 'page' : undefined
            }
            className="sidebar__link"
            key={item.to}
            to={item.to}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
