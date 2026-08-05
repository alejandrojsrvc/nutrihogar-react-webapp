import { describe, expect, it } from 'vitest';

import { HttpNutritionLabelDraftGateway } from './HttpNutritionLabelDraftGateway';

const draft = {
  brand: 'Pan del hogar',
  confidence: 0.9,
  createdAt: '2026-08-05T16:30:00.903Z',
  createdById: 'user-1',
  documentHash: 'hash',
  extractedData: {
    allergens: { contains: ['TRIGO'], may_contain: [] },
    brand: null,
    confidence: 0.9,
    ingredients: ['Harina de trigo'],
    net_content: { unit: 'g', value: 650 },
    nutrition_declarations: [
      {
        basis: { type: 'PER_SERVING', unit: 'g', value: 55 },
        nutrients: { energy_kcal: 140, protein_g: 4.8 },
      },
    ],
    product_name: 'Pan Multisemilla',
    requires_review: true,
    schema_version: 'nutrition-label.v1',
    serving_size: { description: '2 rebanadas', unit: 'g', value: 55 },
    servings_per_container: null,
    warnings: ['Revisa los alérgenos.'],
  },
  expiresAt: null,
  id: 'draft-1',
  missingFields: [],
  name: 'Pan del hogar',
  packageQuantity: '650',
  packageUnit: 'GRAM',
  rawText: null,
  status: 'PENDING_REVIEW',
  updatedAt: '2026-08-05T16:30:00.903Z',
  warnings: ['Revisa los alérgenos.'],
  householdId: 'household-1',
};

const food = {
  aliases: [],
  brand: 'Pan del hogar',
  category: {
    code: 'BAKERY',
    displayOrder: 1,
    id: 'category-1',
    name: 'Panificados',
  },
  foodType: 'CUSTOM',
  householdId: 'household-1',
  id: 'food-1',
  isGlobal: false,
  name: 'Pan Multisemilla',
  nutrients: [],
  preparationState: 'RAW',
  referenceQuantity: 55,
  referenceUnit: 'GRAM',
  servings: [],
  source: 'NUTRITION_LABEL_OCR',
};

describe('HttpNutritionLabelDraftGateway', () => {
  it('uploads multipart data and does not issue a follow-up GET', async () => {
    const requests: Request[] = [];
    const gateway = new HttpNutritionLabelDraftGateway(
      'http://localhost:3000/api',
      async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        return jsonResponse(draft, 201);
      },
    );

    const file = new File(['label'], 'label.jpg', { type: 'image/jpeg' });
    await expect(
      gateway.createDraft({
        brand: 'Pan del hogar',
        file,
        householdId: 'household-1',
        name: 'Pan del hogar',
        packageQuantity: '650',
        packageUnit: 'GRAM',
      }),
    ).resolves.toMatchObject({
      extractedData: {
        nutrition_declarations: [
          { nutrients: { energy_kcal: 140, protein_g: 4.8 } },
        ],
      },
      id: 'draft-1',
    });

    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe(
      'http://localhost:3000/api/households/household-1/foods/nutrition-label-drafts',
    );
    expect(requests[0]?.headers.has('Content-Type')).toBe(false);
    const formData = await requests[0]?.formData();
    expect(formData?.get('file')).toBe(file);
    expect(formData?.get('packageUnit')).toBe('GRAM');
  });

  it('reopens a draft and confirms it with the review payload', async () => {
    const requests: Request[] = [];
    const gateway = new HttpNutritionLabelDraftGateway(
      'http://localhost:3000/api',
      async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        return request.method === 'GET'
          ? jsonResponse(draft)
          : jsonResponse({
              food,
              inventory: {
                currentQuantity: '650',
                expiresAt: null,
                id: 'inventory-1',
                location: null,
                minimumQuantity: null,
                status: 'ACTIVE',
                unit: 'GRAM',
              },
            });
      },
    );

    await gateway.getDraft('household-1', 'draft-1');
    const confirmation = await gateway.confirmDraft('household-1', 'draft-1', {
      basisQuantity: '55',
      basisUnit: 'GRAM',
      brand: 'Pan del hogar',
      categoryId: 'category-1',
      description: '',
      name: 'Pan Multisemilla',
      nutrients: [{ amount: '4.8', code: 'PROTEIN' }],
      packageQuantity: '650',
      packageUnit: 'GRAM',
      preparationState: 'RAW',
      serving: {
        equivalentGrams: '55',
        name: '2 rebanadas',
        quantity: '1',
        unit: 'porción',
      },
    });

    expect(confirmation.food.id).toBe('food-1');
    expect(confirmation.inventory.currentQuantity).toBe(650);
    expect(requests.map((request) => `${request.method} ${request.url}`)).toEqual([
      'GET http://localhost:3000/api/households/household-1/foods/nutrition-label-drafts/draft-1',
      'POST http://localhost:3000/api/households/household-1/foods/nutrition-label-drafts/draft-1/confirm',
    ]);
    expect(await requests[1]?.clone().json()).toMatchObject({
      nutrients: [{ amount: '4.8', code: 'PROTEIN' }],
      serving: { equivalentGrams: '55' },
    });
  });

  it.each([400, 403, 409, 413, 422, 502])(
    'reports nutrition label status %s',
    async (status) => {
      const gateway = new HttpNutritionLabelDraftGateway(
        'http://localhost:3000/api',
        async () => new Response(null, { status }),
      );

      await expect(
        gateway.getDraft('household-1', 'draft-1'),
      ).rejects.toMatchObject({ status });
    },
  );
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });
}
