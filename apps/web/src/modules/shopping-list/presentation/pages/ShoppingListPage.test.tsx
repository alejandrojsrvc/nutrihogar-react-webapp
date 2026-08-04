import { screen, waitFor } from '@testing-library/react';
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

describe('ShoppingListPage', () => {
  it('shows pending items and distinguishes the purchased action from inventory changes', async () => {
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
      if (pathname === '/api/households/household-1/shopping-list')
        return jsonResponse({
          items: [
            {
              id: 'shopping-1',
              name: 'Leche',
              quantity: 2,
              source: 'MANUAL',
              unit: 'L',
              purchased: false,
            },
          ],
        });
      if (pathname === '/api/shopping-list/items/shopping-1/mark-purchased')
        return jsonResponse({});
      throw new Error(`Unexpected request: ${request.url}`);
    });

    renderRoute(
      '/app/lista-de-compras',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    expect(await screen.findByText('Leche')).toBeInTheDocument();
    expect(screen.getByText(/2 L · Manual/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Marcar comprado' }));
    expect(screen.getByText(/2 L · Manual/)).toBeInTheDocument();
  });

  it('validates conversion visibly and preserves the selected-item payload', async () => {
    const user = userEvent.setup();
    setOnline();
    let conversionBody: Record<string, unknown> | undefined;
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
      if (pathname === '/api/households/household-1/shopping-list')
        return jsonResponse({
          items: [
            {
              foodId: 'food-1',
              id: 'shopping-1',
              name: 'Leche',
              purchased: false,
              quantity: 2,
              source: 'MANUAL',
              unit: 'UNIT',
            },
          ],
        });
      if (
        pathname ===
        '/api/households/household-1/shopping-list/convert-to-purchase'
      ) {
        conversionBody = (await request.json()) as Record<string, unknown>;
        return jsonResponse({
          currency: 'ARS',
          householdId: 'household-1',
          id: 'purchase-1',
          items: [],
          purchaseDate: '2026-08-04T12:00:00.000Z',
          status: 'DRAFT',
          storeName: 'Mercado',
          total: 100,
        });
      }
      if (pathname === '/api/purchases/purchase-1')
        return jsonResponse({
          currency: 'ARS',
          householdId: 'household-1',
          id: 'purchase-1',
          items: [],
          purchaseDate: '2026-08-04T12:00:00.000Z',
          status: 'DRAFT',
          storeName: 'Mercado',
          total: 100,
        });
      throw new Error(`Unexpected request: ${request.url}`);
    });

    renderRoute(
      '/app/lista-de-compras',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    await user.click(
      await screen.findByRole('checkbox', {
        name: 'Incluir Leche en la compra',
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Registrar compra' }));
    await user.click(screen.getByRole('button', { name: 'Crear borrador' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Indica el comercio.',
    );

    await user.type(screen.getByLabelText('Comercio'), 'Mercado');
    await user.type(screen.getByLabelText('Total'), '100');
    await user.clear(screen.getByLabelText('Cantidad de Leche'));
    await user.type(screen.getByLabelText('Cantidad de Leche'), '3');
    await user.selectOptions(screen.getByLabelText('Unidad de Leche'), 'GRAM');
    await user.click(screen.getByRole('button', { name: 'Crear borrador' }));

    await waitFor(() =>
      expect(conversionBody).toMatchObject({
        itemIds: ['shopping-1'],
        items: [
          {
            foodId: 'food-1',
            nameSnapshot: 'Leche',
            quantity: 3,
            sourceShoppingItemId: 'shopping-1',
            unit: 'GRAM',
          },
        ],
        storeName: 'Mercado',
        total: 100,
      }),
    );
  });
});

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
