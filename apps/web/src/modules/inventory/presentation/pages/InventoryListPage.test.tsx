import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { createTestAuthGateway, renderRoute } from '../../../../test/renderRoute';

describe('InventoryListPage', () => {
  it('lists inventory and filters by type and search', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('navigator', { onLine: true });
    const inventoryRequests: Request[] = [];
    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);
      const pathname = new URL(request.url).pathname;
      if (pathname === '/api/households') return jsonResponse([{ currency: 'ARS', id: 'household-1', name: 'Hogar', timezone: 'UTC' }]);
      if (pathname === '/api/households/household-1/inventory') {
        inventoryRequests.push(request);
        return jsonResponse({ items: [
        { currentQuantity: 500, id: 'item-1', itemType: 'FOOD', name: 'Arroz', status: 'ACTIVE', unit: 'GRAM', version: 1 },
        { currentQuantity: 2, id: 'item-2', itemType: 'PREPARED_FOOD', name: 'Tarta familiar', status: 'ACTIVE', unit: 'UNIT', version: 1 },
        ], limit: 20, page: 1, total: 2 });
      }
      return jsonResponse({ status: 'ok' });
    });

    renderRoute('/app/inventario', createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }));

    expect(await screen.findByRole('heading', { name: 'Inventario del hogar' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Arroz' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tarta familiar' })).toBeInTheDocument();
    expect(inventoryRequests).toHaveLength(1);
    expect(inventoryRequests[0]?.url).toContain('/api/households/household-1/inventory');
    await user.selectOptions(screen.getByLabelText('Tipo'), 'PREPARED_FOOD');
    expect(screen.queryByRole('heading', { name: 'Arroz' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tarta familiar' })).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Buscar existencia'));
    await user.type(screen.getByLabelText('Buscar existencia'), 'arroz');
    expect(screen.getByRole('heading', { name: 'No encontramos existencias' })).toBeInTheDocument();
  });

  it('shows an empty state when the household has no inventory', async () => {
    vi.stubGlobal('navigator', { onLine: true });
    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);
      const pathname = new URL(request.url).pathname;
      if (pathname === '/api/households') return jsonResponse([{ currency: 'ARS', id: 'household-1', name: 'Hogar', timezone: 'UTC' }]);
      if (pathname === '/api/households/household-1/inventory') return jsonResponse({ items: [], limit: 20, page: 1, total: 0 });
      return jsonResponse({ status: 'ok' });
    });

    renderRoute('/app/inventario', createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }));

    expect(await screen.findByRole('heading', { name: 'Todavía no hay existencias' })).toBeInTheDocument();
  });
});

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' }, status: 200 });
}
