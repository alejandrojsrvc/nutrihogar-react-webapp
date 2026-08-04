import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  createTestAuthGateway,
  renderRoute,
} from '../../../../test/renderRoute';

vi.mock(
  '../../../../modules/inventory/infrastructure/storage/DexieInventoryLocalRepository',
  () => ({
    DexieInventoryLocalRepository: class {
      getSnapshot = async () => null;
      saveSnapshot = async () => undefined;
      saveOperation = async () => undefined;
      listPendingOperations = async () => [];
      markOperationsSynchronized = async () => undefined;
    },
  }),
);

describe('InventoryDetailPage', () => {
  it('shows inventory metadata, traceability and movements in descending order', async () => {
    const user = userEvent.setup();
    setOnline();
    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);
      const pathname = new URL(request.url).pathname;
      if (pathname === '/api/households')
        return jsonResponse([
          {
            currency: 'ARS',
            id: 'household-1',
            name: 'Hogar',
            timezone: 'UTC',
          },
        ]);
      if (pathname === '/api/inventory/items/item-1')
        return jsonResponse(item());
      if (pathname === '/api/inventory/items/item-1/movements')
        return jsonResponse({
          items: [
            {
              actorId: 'user-1',
              createdAt: '2026-08-02T12:00:00.000Z',
              id: 'movement-old',
              inventoryItemId: 'item-1',
              occurredAt: '2026-08-01T12:00:00.000Z',
              quantity: 200,
              reason: 'Compra',
              type: 'PURCHASE',
              unit: 'GRAM',
            },
            {
              actorId: 'user-1',
              createdAt: '2026-08-03T12:00:00.000Z',
              id: 'movement-new',
              inventoryItemId: 'item-1',
              occurredAt: '2026-08-03T12:00:00.000Z',
              quantity: 50,
              reason: 'Conteo',
              type: 'ADJUSTMENT_INCREASE',
              unit: 'GRAM',
            },
          ],
          limit: 20,
          page: 1,
          total: 2,
        });
      throw new Error(`Unexpected request: ${request.url}`);
    });

    renderRoute(
      '/app/inventario/item-1',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Arroz' }),
    ).toBeInTheDocument();
    expect(screen.getByText('500 g')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ver alimento' })).toHaveAttribute(
      'href',
      '/app/alimentos/food-1',
    );
    const movements = await screen.findAllByRole('listitem');
    expect(movements[0]).toHaveTextContent('Ajuste de aumento');
    expect(movements[1]).toHaveTextContent('Compra');

    await user.click(screen.getByRole('button', { name: 'Registrar consumo' }));
    const dialog = await screen.findByRole('dialog', {
      name: 'Registrar consumo',
    });
    expect(dialog).toBeInTheDocument();
    await user.type(screen.getByLabelText(/Cantidad disponible/), '-1');
    await user.click(
      within(dialog).getByRole('button', { name: 'Registrar consumo' }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ingresa una cantidad mayor que cero',
    );
  });
});

function item() {
  return {
    currentQuantity: 500,
    foodId: 'food-1',
    id: 'item-1',
    itemType: 'FOOD',
    minimumQuantity: 100,
    name: 'Arroz',
    status: 'ACTIVE',
    unit: 'GRAM',
    version: 2,
    householdId: 'household-1',
  };
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
}

function setOnline() {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    get: () => true,
  });
}
