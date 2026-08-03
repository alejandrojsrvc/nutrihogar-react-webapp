import {
  CalendarDays,
  House,
  Package,
  ChartNoAxesCombined,
} from 'lucide-react';
import type { ReactNode } from 'react';

export interface NavigationItem {
  label: string;
  to: string;
  icon: ReactNode;
  end?: boolean;
  primary?: boolean;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export type AppSection = 'hoy' | 'planificar' | 'hogar' | 'progreso';

export const primaryNavigation: NavigationItem[] = [
  {
    end: true,
    icon: <House size={19} aria-hidden="true" />,
    label: 'Hoy',
    to: '/app',
  },
  {
    icon: <CalendarDays size={19} aria-hidden="true" />,
    label: 'Planificar',
    to: '/app/plan-semanal',
  },
  {
    icon: <Package size={19} aria-hidden="true" />,
    label: 'Hogar',
    to: '/app/inventario',
  },
  {
    icon: <ChartNoAxesCombined size={19} aria-hidden="true" />,
    label: 'Progreso',
    to: '/app/resumen',
  },
];

export const secondaryNavigation = {
  planificar: [
    { label: 'Semana', to: '/app/plan-semanal', end: true },
    { label: 'Recetas', to: '/app/recetas' },
    { label: 'Compras', to: '/app/lista-de-compras' },
  ],
  hogar: [
    { label: 'Inventario', to: '/app/inventario' },
    { label: 'Familia', to: '/app/familia' },
  ],
} as const;

export function getAppSection(pathname: string): AppSection {
  if (
    pathname.startsWith('/app/plan-semanal') ||
    pathname.startsWith('/app/recetas') ||
    pathname.startsWith('/app/preparaciones') ||
    pathname.startsWith('/app/lista-de-compras') ||
    pathname.startsWith('/app/compras')
  )
    return 'planificar';
  if (
    pathname.startsWith('/app/inventario') ||
    pathname.startsWith('/app/perfil') ||
    pathname.startsWith('/app/perfiles') ||
    pathname.startsWith('/app/familia') ||
    pathname.startsWith('/app/invitaciones')
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
      : null;
}

export function isPrimaryNavigationActive(to: string, pathname: string) {
  if (to === '/app') return pathname === '/app';
  if (to === '/app/plan-semanal') return getAppSection(pathname) === 'planificar';
  if (to === '/app/inventario') return getAppSection(pathname) === 'hogar';
  if (to === '/app/resumen') return getAppSection(pathname) === 'progreso';
  return false;
}
