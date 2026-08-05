import type { ComponentType } from 'react';

export type RouteDepth = 'root' | 'secondary' | 'detail' | 'task';
export type AppChrome = 'app' | 'onboarding' | 'none';

export interface RouteHandle {
  pageHeader?: ComponentType;
  depth?: RouteDepth;
  chrome?: AppChrome;
  back?: string;
}

export function routeDepth(pathname: string): RouteDepth {
  if (
    pathname === '/app' ||
    pathname === '/app/plan-semanal' ||
    pathname === '/app/inventario' ||
    pathname === '/app/resumen' ||
    pathname.startsWith('/app/resumen/')
  )
    return 'root';
  if (
    [
      '/app/recetas',
      '/app/alimentos',
      '/app/compras',
      '/app/lista-de-compras',
      '/app/familia',
      '/app/perfil',
    ].includes(pathname)
  )
    return 'secondary';
  if (
    [
      '/editar',
      '/nueva',
      '/nuevo',
      '/repetir',
      '/ajustar',
      '/consumir-preparado',
      '/confirmar',
      '/finalizar',
      '/servir',
      '/sobrante',
      '/participantes',
      '/cantidades',
      '/preparar',
      '/propuesta',
    ].some((segment) => pathname.includes(segment))
  )
    return 'task';
  if (pathname.startsWith('/app/')) return 'detail';
  return 'root';
}

export function fallbackForRoute(pathname: string) {
  const mealTask = pathname.match(/^\/app\/comidas\/([^/]+)\/(editar|repetir)$/);
  if (mealTask) return `/app/comidas/${mealTask[1]}`;
  if (pathname.startsWith('/app/comidas')) return '/app';
  const foodEdit = pathname.match(/^\/app\/alimentos\/([^/]+)\/editar$/);
  if (foodEdit) return `/app/alimentos/${foodEdit[1]}`;
  if (pathname.startsWith('/app/alimentos')) return '/app/alimentos';
  const recipeEdit = pathname.match(/^\/app\/recetas\/([^/]+)\/editar$/);
  if (recipeEdit) return `/app/recetas/${recipeEdit[1]}`;
  if (pathname.startsWith('/app/recetas')) return '/app/recetas';
  if (
    pathname.startsWith('/app/preparaciones') ||
    pathname.startsWith('/app/porciones') ||
    pathname.startsWith('/app/sobrantes')
  )
    return '/app/recetas';
  if (pathname.startsWith('/app/plan-semanal')) return '/app/plan-semanal';
  if (pathname.startsWith('/app/inventario')) return '/app/inventario';
  if (pathname.startsWith('/app/compras')) return '/app/compras';
  if (pathname.startsWith('/app/lista-de-compras')) return '/app/lista-de-compras';
  if (pathname.startsWith('/app/perfiles')) return '/app/familia';
  if (pathname.startsWith('/app/perfil')) return '/app/perfil';
  if (pathname.startsWith('/app/invitaciones')) return '/app/familia';
  if (pathname.startsWith('/app/resumen')) return '/app/resumen';
  return '/app';
}
