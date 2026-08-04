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

describe('Purchase pages', () => {
  it('lists purchases and links to the detail', async () => {
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
      if (pathname === '/api/households/household-1/purchases')
        return jsonResponse({ items: [purchase()] });
      throw new Error(`Unexpected request: ${request.url}`);
    });

    renderRoute(
      '/app/compras',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Mercado' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mercado/ })).toHaveAttribute(
      'href',
      '/app/compras/purchase-1',
    );
  });

  it('shows the empty product validation in a new purchase', async () => {
    const user = userEvent.setup();
    setOnline();
    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);
      if (new URL(request.url).pathname === '/api/households')
        return jsonResponse([
          {
            currency: 'ARS',
            id: 'household-1',
            name: 'Hogar',
            timezone: 'UTC',
          },
        ]);
      throw new Error(`Unexpected request: ${request.url}`);
    });

    renderRoute(
      '/app/compras/nueva',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );
    await user.type(await screen.findByLabelText('Comercio'), 'Mercado');
    await user.type(screen.getByLabelText('Total'), '100');
    await user.click(
      await screen.findByRole('button', { name: 'Guardar borrador' }),
    );

    expect(
      await screen.findByText('Agrega al menos un producto a la compra.'),
    ).toBeInTheDocument();
  });

  it('previews inventory effects before confirming a purchase', async () => {
    const user = userEvent.setup();
    setOnline();
    let confirmed = false;
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
      if (pathname === '/api/purchases/purchase-1')
        return jsonResponse({
          ...purchase(),
          status: confirmed ? 'CONFIRMED' : 'DRAFT',
        });
      if (pathname === '/api/purchases/purchase-1/confirm') {
        confirmed = true;
        return jsonResponse({ ...purchase(), status: 'CONFIRMED' });
      }
      throw new Error(`Unexpected request: ${request.url}`);
    });

    renderRoute(
      '/app/compras/purchase-1',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    await user.click(
      await screen.findByRole('button', { name: 'Confirmar compra' }),
    );
    expect(
      screen.getByText(/actualizará sus saldos de inventario/),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {
        name: 'Confirmar y actualizar inventario',
      }),
    );
    expect(
      await screen.findByText(/Compra confirmada por el servidor/),
    ).toBeInTheDocument();
  });
});

function purchase() {
  return {
    currency: 'ARS',
    householdId: 'household-1',
    id: 'purchase-1',
    items: [
      { id: 'purchase-item-1', nameSnapshot: 'Arroz', quantity: 2, unit: 'KG' },
    ],
    purchaseDate: '2026-08-01T12:00:00.000Z',
    status: 'DRAFT',
    storeName: 'Mercado',
    total: 1200,
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
