import { NavLink, useLocation } from 'react-router';
import { Carrot } from 'lucide-react';
import { BrandLockup } from './BrandLockup';

import {
  isPrimaryNavigationActive,
  primaryNavigation,
} from '../navigation/mainNavigation';

export function Sidebar({
  secondaryItems,
}: {
  secondaryItems:
    readonly { label: string; to: string; end?: boolean }[] | null;
}) {
  const { pathname } = useLocation();

  return (
    <aside className="sidebar" aria-label="Navegación principal">
      <div className="sidebar__brand">
        <BrandLockup />
      </div>
      <nav aria-label="Destinos principales" className="sidebar__destinations">
        {primaryNavigation.map((item) => (
          <NavLink
            aria-current={
              isPrimaryNavigationActive(item.to, pathname) ? 'page' : undefined
            }
            className={`sidebar__link${item.action ? ' sidebar__link--action' : ''}`}
            end={item.end}
            key={item.to}
            to={item.to}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      {secondaryItems ? (
        <nav className="sidebar__secondary" aria-label="Secciones relacionadas">
          {secondaryItems.map((item) => (
            <NavLink end={item.end} key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      ) : null}
      <div className="sidebar__footer">
        <Carrot size={42} strokeWidth={1.5} aria-hidden="true" />
        <p>
          Pequeñas decisiones,
          <br />
          grandes cambios.
        </p>
      </div>
    </aside>
  );
}
