import { NavLink, useLocation } from 'react-router';
import { BrandLockup } from './BrandLockup';
import { BrandMark } from './BrandMark';

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
        {primaryNavigation.map((item) => {
          const active = isPrimaryNavigationActive(item.to, pathname);
          return (
            <div className="sidebar__group" key={item.to}>
              <NavLink
                aria-current={active ? 'page' : undefined}
                className={`sidebar__link${item.action ? ' sidebar__link--action' : ''}`}
                end={item.end}
                to={item.to}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
              {active && secondaryItems ? (
                <nav
                  aria-label={`Opciones de ${item.label}`}
                  className="sidebar__secondary"
                >
                  {secondaryItems.map((secondaryItem) => (
                    <NavLink
                      end={secondaryItem.end}
                      key={secondaryItem.to}
                      to={secondaryItem.to}
                    >
                      {secondaryItem.label}
                    </NavLink>
                  ))}
                </nav>
              ) : null}
            </div>
          );
        })}
      </nav>
      <div className="sidebar__footer">
        <BrandMark size={42} strokeWidth={1.5} />
        <p>
          Pequeñas decisiones,
          <br />
          grandes cambios.
        </p>
      </div>
    </aside>
  );
}
