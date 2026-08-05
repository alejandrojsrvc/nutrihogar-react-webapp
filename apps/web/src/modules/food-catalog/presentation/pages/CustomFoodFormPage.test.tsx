import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  createTestAuthGateway,
  renderRoute,
} from '../../../../test/renderRoute';

const category = {
  code: 'MEAT',
  displayOrder: 1,
  id: 'category-meat',
  name: 'Carnes',
};

const nutrients = [
  {
    code: 'ENERGY_KCAL',
    displayOrder: 1,
    group: 'ENERGY',
    id: 'nutrient-energy',
    isRequired: true,
    name: 'Energia',
    unit: 'kcal',
  },
  {
    code: 'PROTEIN',
    displayOrder: 2,
    group: 'MACROS',
    id: 'nutrient-protein',
    isRequired: true,
    name: 'Proteina',
    unit: 'g',
  },
  {
    code: 'CARBOHYDRATE',
    displayOrder: 3,
    group: 'MACROS',
    id: 'nutrient-carbohydrate',
    isRequired: true,
    name: 'Carbohidratos',
    unit: 'g',
  },
  {
    code: 'FAT',
    displayOrder: 4,
    group: 'MACROS',
    id: 'nutrient-fat',
    isRequired: true,
    name: 'Grasas',
    unit: 'g',
  },
  {
    code: 'FIBER',
    displayOrder: 5,
    group: 'CARBOHYDRATES',
    id: 'nutrient-fiber',
    isRequired: false,
    name: 'Fibra',
    unit: 'g',
  },
];

describe('CustomFoodFormPage', () => {
  it('validates non-negative nutrients and creates a custom food', async () => {
    const user = userEvent.setup();
    let createdRequest: Request | undefined;
    mockFormRequests((request) => {
      if (request.method === 'POST') {
        createdRequest = request;
        return jsonResponse(
          {
            ...foodDetail,
            id: 'food-custom-1',
            name: 'Pan casero',
            foodType: 'CUSTOM',
            householdId: 'household-1',
            isGlobal: false,
          },
          201,
        );
      }

      return jsonResponse({});
    });

    renderForm();

    await user.type(await screen.findByLabelText(/Nombre/), 'Pan casero');
    await user.selectOptions(
      screen.getByLabelText(/Categoría/),
      'category-meat',
    );
    await user.clear(screen.getByLabelText('Energia cantidad'));
    await user.type(screen.getByLabelText('Energia cantidad'), '-1');
    await user.click(screen.getByRole('button', { name: 'Crear alimento' }));

    expect(
      await screen.findByText('Ingresa un numero mayor o igual que cero.'),
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Energia cantidad'));
    await user.type(screen.getByLabelText('Energia cantidad'), '250');
    await user.type(screen.getByLabelText('Proteina cantidad'), '8');
    await user.type(screen.getByLabelText('Carbohidratos cantidad'), '40');
    await user.type(screen.getByLabelText('Grasas cantidad'), '4');
    await user.click(screen.getByRole('button', { name: 'Crear alimento' }));

    await waitFor(() => expect(createdRequest).toBeDefined());
    expect(createdRequest?.url).toContain('/api/households/household-1/foods');
    expect(await createdRequest?.clone().json()).toMatchObject({
      name: 'Pan casero',
      nutrients: [
        { amount: 250, nutrientDefinitionId: 'nutrient-energy' },
        { amount: 8, nutrientDefinitionId: 'nutrient-protein' },
        { amount: 40, nutrientDefinitionId: 'nutrient-carbohydrate' },
        { amount: 4, nutrientDefinitionId: 'nutrient-fat' },
      ],
    });
  });

  it('adds an optional micronutrient and a serving', async () => {
    const user = userEvent.setup();
    mockFormRequests(() => jsonResponse({}));
    renderForm();

    await screen.findByLabelText(/Nombre/);
    await user.selectOptions(
      screen.getByLabelText('Micronutriente opcional'),
      'nutrient-fiber',
    );
    await user.click(
      screen.getByRole('button', { name: 'Agregar micronutriente' }),
    );
    expect(screen.getByLabelText('Fibra cantidad')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Agregar porción' }));
    expect(screen.getByPlaceholderText('Ej. 1 rebanada')).toBeInTheDocument();
  });

  it('reads a nutrition label, keeps it pending review and confirms it manually', async () => {
    const user = userEvent.setup();
    const requests: Request[] = [];
    mockFormRequests(async (request) => {
      requests.push(request);
      if (
        request.url.endsWith(
          '/api/households/household-1/foods/nutrition-label-drafts',
        )
      ) {
        return jsonResponse(nutritionLabelDraft, 201);
      }
      if (request.url.includes('/nutrition-label-drafts/draft-1/confirm')) {
        return jsonResponse({
          food: { ...foodDetail, id: 'food-from-label' },
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
      }
      return jsonResponse({});
    });

    renderForm();
    await user.click(
      await screen.findByRole('button', { name: 'Elegir foto o PDF' }),
    );
    await user.upload(
      screen.getByLabelText('Archivo de etiqueta nutricional'),
      new File(['label'], 'label.jpg', { type: 'image/jpeg' }),
    );

    expect(await screen.findByText('Revisión pendiente')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pan Multisemilla')).toBeInTheDocument();
    expect(screen.getByLabelText('Cantidad del envase')).toHaveValue(650);
    expect(screen.queryByLabelText('Descripción')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Ubicación')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Vencimiento')).not.toBeInTheDocument();
    expect(
      requests.filter((request) =>
        request.url.includes('/nutrition-label-drafts/draft-1'),
      ),
    ).toHaveLength(0);

    await user.selectOptions(
      screen.getByLabelText('Categoría'),
      'category-meat',
    );
    await user.click(
      screen.getByRole('button', { name: 'Guardar alimento' }),
    );

    await waitFor(() => {
      expect(
        requests.some((request) =>
          request.url.endsWith('/nutrition-label-drafts/draft-1/confirm'),
        ),
      ).toBe(true);
    });
    expect(
      await requests
        .find((request) =>
          request.url.endsWith('/nutrition-label-drafts/draft-1/confirm'),
        )
        ?.clone()
        .json(),
    ).toMatchObject({
      basisQuantity: '55',
      nutrients: expect.arrayContaining([
        { amount: '4.8', code: 'PROTEIN' },
      ]),
      packageQuantity: '650',
    });
  });

  it('rejects a file that is not an image or PDF', async () => {
    const user = userEvent.setup();
    const drafts: Request[] = [];
    mockFormRequests((request) => {
      if (request.url.endsWith('/nutrition-label-drafts')) {
        drafts.push(request);
        return jsonResponse(nutritionLabelDraft, 201);
      }
      return jsonResponse({});
    });

    renderForm();
    await user.upload(
      screen.getByLabelText('Archivo de etiqueta nutricional'),
      new File(['text'], 'etiqueta.txt', { type: 'text/plain' }),
    );

    expect(
      await screen.findByText('Elegí una foto o un PDF de la etiqueta del envase.'),
    ).toBeInTheDocument();
    expect(drafts).toHaveLength(0);
  });

  it('accepts a label dropped on the reader', async () => {
    const drafts: Request[] = [];
    mockFormRequests((request) => {
      if (request.url.endsWith('/nutrition-label-drafts')) {
        drafts.push(request);
        return jsonResponse(nutritionLabelDraft, 201);
      }
      return jsonResponse({});
    });

    renderForm();
    const reader = screen
      .getByLabelText('Archivo de etiqueta nutricional')
      .closest('.nutrition-label-reader') as HTMLElement;
    fireEvent.drop(reader, {
      dataTransfer: { files: [new File(['label'], 'label.pdf', { type: 'application/pdf' })] },
    });

    await waitFor(() => expect(drafts).toHaveLength(1));
    expect(await screen.findByText('Revisión pendiente')).toBeInTheDocument();
  });

  it('shows the required nutrient badge and disables saving when the label is missing one', async () => {
    const user = userEvent.setup();
    mockFormRequests((request) => {
      if (request.url.endsWith('/nutrition-label-drafts')) {
        return jsonResponse(
          {
            ...nutritionLabelDraft,
            extractedData: {
              ...nutritionLabelDraft.extractedData,
              nutrition_declarations: [
                {
                  basis: { type: 'PER_SERVING', unit: 'g', value: 55 },
                  nutrients: {
                    carbohydrates_g: 23,
                    energy_kcal: 140,
                    total_fat_g: 3.2,
                  },
                },
              ],
            },
          },
          201,
        );
      }
      return jsonResponse({});
    });

    renderForm();
    await user.upload(
      screen.getByLabelText('Archivo de etiqueta nutricional'),
      new File(['label'], 'label.jpg', { type: 'image/jpeg' }),
    );

    await screen.findByText('Revisión pendiente');
    expect(screen.getByText('Obligatorio')).toBeInTheDocument();
    expect(
      screen.getByText('Completá los nutrientes obligatorios antes de confirmar.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Guardar alimento' }),
    ).toBeDisabled();
  });

  it('sends the edited food as targetFoodId when reading a label during edit', async () => {
    const user = userEvent.setup();
    let confirmedRequest: Request | undefined;
    mockFormRequests(async (request) => {
      if (request.url.endsWith('/api/foods/food-custom-1')) {
        return jsonResponse(foodDetail);
      }
      if (request.url.endsWith('/nutrition-label-drafts')) {
        return jsonResponse(nutritionLabelDraft, 201);
      }
      if (request.url.endsWith('/nutrition-label-drafts/draft-1/confirm')) {
        confirmedRequest = request;
        return jsonResponse({ food: foodDetail, inventory: {} });
      }
      return jsonResponse({});
    });

    renderRoute(
      '/app/alimentos/food-custom-1/editar',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Elegir foto o PDF' }),
    );
    await user.upload(
      screen.getByLabelText('Archivo de etiqueta nutricional'),
      new File(['label'], 'label.jpg', { type: 'image/jpeg' }),
    );
    await screen.findByText('Revisión pendiente');
    await user.selectOptions(
      screen.getByLabelText('Categoría'),
      'category-meat',
    );
    await user.click(
      screen.getByRole('button', { name: 'Actualizar alimento' }),
    );

    await waitFor(() => expect(confirmedRequest).toBeDefined());
    expect(await confirmedRequest?.clone().json()).toMatchObject({
      targetFoodId: 'food-custom-1',
    });
  });

  it('loads a custom food for editing and sends a patch', async () => {
    const user = userEvent.setup();
    let updatedRequest: Request | undefined;
    mockFormRequests((request) => {
      if (request.url.endsWith('/api/foods/food-custom-1')) {
        if (request.method === 'PATCH') {
          updatedRequest = request;
          return jsonResponse(foodDetail);
        }

        return jsonResponse({
          ...foodDetail,
          nutrients: nutrients
            .filter((nutrient) => nutrient.isRequired)
            .map((nutrient, index) => ({
              amount: [250, 8, 40, 4][index],
              id: `nutrient-row-${index}`,
              nutrientDefinition: nutrient,
            })),
        });
      }

      return jsonResponse({});
    });

    renderRoute(
      '/app/alimentos/food-custom-1/editar',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    const nameInput = await screen.findByLabelText(/Nombre/);
    expect(nameInput).toHaveValue('Pan casero');
    await user.clear(nameInput);
    await user.type(nameInput, 'Pan integral');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(updatedRequest).toBeDefined());
    const body = await updatedRequest?.clone().json();
    expect(body).toMatchObject({ name: 'Pan integral' });
    expect(body.nutrients).toEqual(
      expect.arrayContaining([
        { amount: 250, nutrientDefinitionId: 'nutrient-energy' },
      ]),
    );
  });
});

function renderForm() {
  renderRoute(
    '/app/alimentos/nuevo',
    createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
  );
}

function mockFormRequests(
  response: (request: Request) => Response | Promise<Response>,
) {
  vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
    const request = new Request(input, init);

    if (request.url.endsWith('/api/households')) {
      return jsonResponse([
        {
          currency: 'ARS',
          id: 'household-1',
          name: 'Hogar Sojo',
          timezone: 'America/Argentina/Buenos_Aires',
        },
      ]);
    }

    if (request.url.endsWith('/api/food-categories')) {
      return jsonResponse([category]);
    }

    if (request.url.endsWith('/api/nutrients')) {
      return jsonResponse(nutrients);
    }

    return response(request);
  });
}

const foodDetail = {
  ...{
    brand: null,
    carbohydrateGrams: 40,
    category,
    energyKcal: 250,
    fatGrams: 4,
    foodType: 'CUSTOM',
    householdId: 'household-1',
    id: 'food-custom-1',
    name: 'Pan casero',
    preparationState: 'RAW',
    proteinGrams: 8,
    referenceQuantity: 100,
    referenceUnit: 'GRAM',
  },
  aliases: [],
  confidenceLevel: 'USER_PROVIDED',
  description: null,
  isGlobal: false,
  nutrients: [],
  servings: [],
  source: 'USER',
  sourceReference: null,
};

const nutritionLabelDraft = {
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
        nutrients: {
          carbohydrates_g: 23,
          energy_kcal: 140,
          protein_g: 4.8,
          total_fat_g: 3.2,
        },
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
  name: 'Pan Multisemilla',
  packageQuantity: '650',
  packageUnit: 'GRAM',
  rawText: null,
  status: 'PENDING_REVIEW',
  updatedAt: '2026-08-05T16:30:00.903Z',
  warnings: ['Revisa los alérgenos.'],
  householdId: 'household-1',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });
}
