import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { createTestAuthGateway, renderRoute } from '../../../../test/renderRoute';

describe('AdultProfilePage', () => {
  it('creates the authenticated adult profile from the configuration action', async () => {
    const user = userEvent.setup();
    let profiles: Array<Record<string, unknown>> = [];

    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);

      if (request.url.endsWith('/api/households')) {
        return new Response(
          JSON.stringify([
            {
              currency: 'ARS',
              id: 'household-1',
              name: 'Hogar Sojo',
              timezone: 'America/Argentina/Buenos_Aires',
            },
          ]),
          { headers: { 'Content-Type': 'application/json' }, status: 200 },
        );
      }

      if (request.url.includes('/adult-profiles')) {
        if (request.method === 'POST') {
          profiles = [
            {
              activityLevel: 'MODERATE',
              age: 36,
              biologicalSex: 'MALE',
              birthDate: '1990-05-20',
              dietaryRestrictions: [],
              hasKitchenScale: true,
              heightCm: 175.5,
              householdId: 'household-1',
              id: 'profile-1',
              isActive: true,
              name: 'Alejandro',
              primaryGoal: 'FAT_LOSS',
              updatedAt: '2026-07-30T17:00:00.000Z',
              createdAt: '2026-07-30T17:00:00.000Z',
              userId: 'user-1',
            },
          ];
          return new Response(JSON.stringify(profiles[0]), {
            headers: { 'Content-Type': 'application/json' },
            status: 201,
          });
        }

        return new Response(JSON.stringify(profiles), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
    });

    renderRoute(
      '/app/perfil',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    await user.type(await screen.findByLabelText('Nombre'), 'Alejandro');
    await user.type(
      screen.getByLabelText('Fecha de nacimiento'),
      '1990-05-20',
    );
    await user.selectOptions(screen.getByLabelText('Sexo biologico'), 'MALE');
    await user.type(screen.getByLabelText('Altura en centimetros'), '175.5');
    await user.selectOptions(
      screen.getByLabelText('Nivel de actividad'),
      'MODERATE',
    );
    await user.selectOptions(
      screen.getByLabelText('Objetivo principal'),
      'FAT_LOSS',
    );
    await user.click(screen.getByLabelText('Tengo una balanza de cocina'));
    await user.click(screen.getByRole('button', { name: 'Guardar perfil' }));

    expect(
      await screen.findByRole('heading', {
        name: 'Tu perfil ya esta configurado',
      }),
    ).toBeInTheDocument();
  });
});
