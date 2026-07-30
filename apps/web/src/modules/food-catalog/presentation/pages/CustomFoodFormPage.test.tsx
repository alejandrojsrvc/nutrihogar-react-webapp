import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { createTestAuthGateway, renderRoute } from '../../../../test/renderRoute';

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
        return jsonResponse({
          ...foodDetail,
          id: 'food-custom-1',
          name: 'Pan casero',
          foodType: 'CUSTOM',
          householdId: 'household-1',
          isGlobal: false,
        }, 201);
      }

      return jsonResponse({});
    });

    renderForm();

    await user.type(await screen.findByLabelText(/Nombre/), 'Pan casero');
    await user.selectOptions(screen.getByLabelText(/Categoria/), 'category-meat');
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
    await user.click(screen.getByRole('button', { name: 'Agregar micronutriente' }));
    expect(screen.getByLabelText('Fibra cantidad')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Agregar porcion' }));
    expect(screen.getByPlaceholderText('Ej. 1 rebanada')).toBeInTheDocument();
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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });
}
