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

describe('Inventory form pages', () => {
  it('requires an alimento before creating an inventory item', async () => {
    const user = userEvent.setup();
    setOnline();
    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);
      if (new URL(request.url).pathname === '/api/households') return jsonResponse([{ currency: 'ARS', id: 'household-1', name: 'Hogar', timezone: 'UTC' }]);
      throw new Error(`Unexpected request: ${request.url}`);
    });

    renderRoute('/app/inventario/nuevo', createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }));

    await user.click(await screen.findByRole('button', { name: 'Agregar existencia' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Selecciona un alimento.');
  });

  it('requires a reason when adjusting a quantity', async () => {
    const user = userEvent.setup();
    setOnline();
    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);
      const pathname = new URL(request.url).pathname;
      if (pathname === '/api/households') return jsonResponse([{ currency: 'ARS', id: 'household-1', name: 'Hogar', timezone: 'UTC' }]);
      if (pathname === '/api/inventory/items/item-1') return jsonResponse({ ...item(), createdAt: '2026-08-01T12:00:00.000Z', updatedAt: '2026-08-01T12:00:00.000Z' });
      throw new Error(`Unexpected request: ${request.url}`);
    });

    renderRoute('/app/inventario/item-1/ajustar', createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }));

    const submit = await screen.findByRole('button', { name: 'Confirmar ajuste' });
    await user.click(submit);
    expect(await screen.findByText('Explica la razón del ajuste.')).toBeInTheDocument();
  });
});

function item() {
  return { currentQuantity: 500, foodId: 'food-1', id: 'item-1', itemType: 'FOOD', minimumQuantity: 100, name: 'Arroz', status: 'ACTIVE', unit: 'GRAM', version: 2, householdId: 'household-1' };
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' }, status: 200 });
}

function setOnline() {
  Object.defineProperty(window.navigator, 'onLine', { configurable: true, get: () => true });
}
