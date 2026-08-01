import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { createTestAuthGateway, renderRoute } from '../../../../test/renderRoute';

vi.mock('../../../../modules/inventory/infrastructure/storage/DexieInventoryLocalRepository', () => ({
  DexieInventoryLocalRepository: class {
    getSnapshot = async () => null;
    saveSnapshot = async () => undefined;
    saveOperation = async () => undefined;
    listPendingOperations = async () => [];
    markOperationsSynchronized = async () => undefined;
  },
}));

describe('Purchase pages', () => {
  it('lists purchases and links to the detail', async () => {
    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);
      const pathname = new URL(request.url).pathname;
      if (pathname === '/api/households') return jsonResponse([{ currency: 'ARS', id: 'household-1', name: 'Hogar', timezone: 'UTC' }]);
      if (pathname === '/api/households/household-1/purchases') return jsonResponse({ items: [purchase()] });
      throw new Error(`Unexpected request: ${request.url}`);
    });

    renderRoute('/app/compras', createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }));

    expect(await screen.findByRole('heading', { name: 'Mercado' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mercado/ })).toHaveAttribute('href', '/app/compras/purchase-1');
  });

  it('shows the empty product validation in a new purchase', async () => {
    const user = userEvent.setup();
    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);
      if (new URL(request.url).pathname === '/api/households') return jsonResponse([{ currency: 'ARS', id: 'household-1', name: 'Hogar', timezone: 'UTC' }]);
      throw new Error(`Unexpected request: ${request.url}`);
    });

    renderRoute('/app/compras/nueva', createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }));
    await user.click(await screen.findByRole('button', { name: 'Guardar borrador' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Agrega al menos un producto');
  });
});

function purchase() {
  return { currency: 'ARS', householdId: 'household-1', id: 'purchase-1', items: [{ id: 'purchase-item-1', nameSnapshot: 'Arroz', quantity: 2, unit: 'KG' }], purchaseDate: '2026-08-01T12:00:00.000Z', status: 'DRAFT', storeName: 'Mercado', total: 1200 };
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' }, status: 200 });
}
