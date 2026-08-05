import {
  CalendarDays,
  CirclePlus,
  House,
  Package,
  ChartNoAxesCombined,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { NAV_ICON_SIZE } from '../icons';

export interface NavigationItem {
  label: string;
  to: string;
  icon: ReactNode;
  end?: boolean;
  action?: boolean;
  primary?: boolean;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export type AppSection =
  'hoy' | 'planificar' | 'registrar' | 'hogar' | 'progreso';

export const primaryNavigation: NavigationItem[] = [
  {
    end: true,
    icon: <House size={NAV_ICON_SIZE} aria-hidden="true" />,
    label: 'Hoy',
    to: '/app',
  },
  {
    icon: <CalendarDays size={NAV_ICON_SIZE} aria-hidden="true" />,
    label: 'Plan',
    to: '/app/plan-semanal',
  },
  {
    action: true,
    icon: <CirclePlus size={22} aria-hidden="true" />,
    label: 'Registrar',
    to: '/app/comidas/nueva',
  },
  {
    icon: <ChartNoAxesCombined size={NAV_ICON_SIZE} aria-hidden="true" />,
    label: 'Progreso',
    to: '/app/resumen',
  },
  {
    icon: <Package size={NAV_ICON_SIZE} aria-hidden="true" />,
    label: 'Hogar',
    to: '/app/inventario',
  },
];

export const secondaryNavigation = {
  planificar: [
    { label: 'Semana', to: '/app/plan-semanal', end: true },
    { label: 'Recetas', to: '/app/recetas' },
  ],
  hogar: [
    { label: 'Inventario', to: '/app/inventario' },
    { label: 'Compras', to: '/app/compras' },
    { label: 'Lista de compras', to: '/app/lista-de-compras' },
    { label: 'Familia', to: '/app/familia' },
  ],
  progreso: [{ label: 'Resumen', to: '/app/resumen' }],
} as const;

export function getAppSection(pathname: string): AppSection {
  if (
    pathname.startsWith('/app/plan-semanal') ||
    pathname.startsWith('/app/recetas') ||
    pathname.startsWith('/app/preparaciones') ||
    pathname.startsWith('/app/porciones') ||
    pathname.startsWith('/app/sobrantes')
  )
    return 'planificar';
  if (
    pathname.startsWith('/app/comidas') ||
    pathname.startsWith('/app/alimentos')
  )
    return 'registrar';
  if (
    pathname.startsWith('/app/inventario') ||
    pathname.startsWith('/app/perfil') ||
    pathname.startsWith('/app/perfiles') ||
    pathname.startsWith('/app/familia') ||
    pathname.startsWith('/app/invitaciones') ||
    pathname.startsWith('/app/lista-de-compras') ||
    pathname.startsWith('/app/compras')
  )
    return 'hogar';
  if (
    pathname.startsWith('/app/resumen') ||
    pathname.startsWith('/app/progreso')
  )
    return 'progreso';
  return 'hoy';
}

export function secondaryNavigationForPath(pathname: string) {
  const section = getAppSection(pathname);
  return section === 'planificar'
    ? secondaryNavigation.planificar
    : section === 'hogar'
      ? secondaryNavigation.hogar
      : section === 'progreso'
        ? secondaryNavigation.progreso
        : null;
}

export function isPrimaryNavigationActive(to: string, pathname: string) {
  if (to === '/app') return pathname === '/app' || pathname === '/app/';
  if (to === '/app/plan-semanal')
    return getAppSection(pathname) === 'planificar';
  if (to === '/app/comidas/nueva')
    return getAppSection(pathname) === 'registrar';
  if (to === '/app/inventario') return getAppSection(pathname) === 'hogar';
  if (to === '/app/resumen') return getAppSection(pathname) === 'progreso';
  return false;
}
