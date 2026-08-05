import { describe, expect, it } from 'vitest';

import { fallbackForRoute, routeDepth } from './routeHandle';

describe('route chrome metadata', () => {
  it('classifies deep routes as tasks and keeps a stable fallback', () => {
    expect(routeDepth('/app/comidas/meal-1/editar')).toBe('task');
    expect(routeDepth('/app/alimentos/nuevo')).toBe('task');
    expect(fallbackForRoute('/app/comidas/meal-1/editar')).toBe('/app');
  });

  it('keeps section roots out of the back flow', () => {
    expect(routeDepth('/app/plan-semanal')).toBe('root');
    expect(routeDepth('/app/resumen')).toBe('root');
    expect(routeDepth('/app/recetas')).toBe('secondary');
  });
});
