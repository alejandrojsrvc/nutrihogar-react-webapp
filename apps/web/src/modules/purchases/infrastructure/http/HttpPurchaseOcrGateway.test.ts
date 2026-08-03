import { describe, expect, it, vi } from 'vitest';

import { HttpPurchaseOcrGateway } from './HttpPurchaseOcrGateway';

describe('HttpPurchaseOcrGateway', () => {
  it('uploads the receipt as multipart without setting Content-Type', async () => {
    const fetchAuthenticated = vi.fn<typeof globalThis.fetch>(async () =>
      new Response(JSON.stringify({ id: 'purchase-1' }), { status: 201 }),
    );
    const gateway = new HttpPurchaseOcrGateway(
      'http://localhost:3000/api',
      fetchAuthenticated,
    );
    const file = new File(['receipt'], 'receipt.jpg', { type: 'image/jpeg' });

    await gateway.createDraft({ file, householdId: 'household-1', locale: 'es-AR' });

    const init = fetchAuthenticated.mock.calls[0][1];
    expect(init?.body).toBeInstanceOf(FormData);
    expect((init?.body as FormData).get('file')).toBe(file);
    expect(init?.headers).toEqual(expect.objectContaining({ 'Idempotency-Key': expect.any(String) }));
    expect(new Headers(init?.headers).has('Content-Type')).toBe(false);
  });

  it.each([400, 401, 403, 413, 422, 502, 503])('reports OCR status %s', async (status) => {
    const gateway = new HttpPurchaseOcrGateway('http://localhost:3000/api', async () =>
      new Response(null, { status }),
    );

    await expect(
      gateway.createDraft({
        file: new File(['receipt'], 'receipt.jpg'),
        householdId: 'household-1',
      }),
    ).rejects.toMatchObject({ status });
  });
});
