import { screen } from '@testing-library/react';
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
    expect(screen.getByText('Manual')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Marcar comprado' }));
    expect(screen.getByText('Manual')).toBeInTheDocument();
  });
});

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
}
