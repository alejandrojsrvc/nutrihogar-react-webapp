import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  createTestAuthGateway,
  renderRoute,
} from '../../../../test/renderRoute';

const profile = {
  activityLevel: 'MODERATE',
  age: 36,
  biologicalSex: 'MALE',
  birthDate: '1990-05-20',
  dietaryRestrictions: [
    {
      id: 'restriction-1',
      name: 'Mani',
      notes: 'Evitar trazas.',
      severity: 'Alta',
      type: 'ALLERGY',
    },
  ],
  hasKitchenScale: true,
  heightCm: 175.5,
  weightKg: 79,
  householdId: 'household-1',
  id: 'profile-1',
  isActive: true,
  name: 'Alejandro',
  primaryGoal: 'FAT_LOSS',
  updatedAt: '2026-07-30T17:00:00.000Z',
  createdAt: '2026-07-30T17:00:00.000Z',
  userId: 'user-1',
};

describe('AdultProfilePage', () => {
  it('shows profile data before exposing the edit form', async () => {
    vi.mocked(globalThis.fetch).mockImplementation(async (input, init) => {
      const request = new Request(input, init);
      if (request.url.endsWith('/api/households'))
        return jsonResponse([
          {
            currency: 'ARS',
            id: 'household-1',
            name: 'Hogar Sojo',
            timezone: 'America/Argentina/Buenos_Aires',
          },
        ]);
      if (request.url.includes('/adult-profiles'))
        return jsonResponse([profile]);
      return jsonResponse({ status: 'ok' });
    });

    renderRoute(
      '/app/perfil',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Tu perfil' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Peso actual')).toBeInTheDocument();
    expect(screen.getByText('79 kg')).toBeInTheDocument();
    expect(screen.queryByLabelText('Nombre')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Editar perfil' })).toHaveAttribute(
      'href',
      '/app/perfil/editar',
    );
  });

  it('creates a profile with dietary restrictions and redirects home', async () => {
    const user = userEvent.setup();
    let profileCreated = false;
    let createRequest: Request | undefined;

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

      if (request.url.includes('/adult-profiles')) {
        if (request.method === 'POST') {
          profileCreated = true;
          createRequest = request;
          return jsonResponse(profile, 201);
        }

        return jsonResponse(profileCreated ? [profile] : []);
      }

      return jsonResponse({ status: 'ok' });
    });

    renderRoute(
      '/app/perfil/editar',
      createTestAuthGateway({
        accessToken: 'test-token',
        userId: 'user-1',
      }),
    );

    await fillBasicInformation(user);
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.selectOptions(screen.getByLabelText('Sexo biologico'), 'MALE');
    await user.type(screen.getByLabelText('Altura en centimetros'), '175.5');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.selectOptions(
      screen.getByLabelText('Nivel de actividad'),
      'MODERATE',
    );
    await user.selectOptions(
      screen.getByLabelText('Objetivo principal'),
      'FAT_LOSS',
    );
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(
      screen.getByRole('button', { name: 'Agregar restriccion' }),
    );
    await user.type(screen.getByLabelText('Nombre'), 'Mani');
    await user.type(screen.getByLabelText('Severidad (opcional)'), 'Alta');
    await user.type(
      screen.getByLabelText('Notas (opcional)'),
      'Evitar trazas.',
    );
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByLabelText('Tengo una balanza de cocina'));
    await user.click(screen.getByRole('button', { name: 'Guardar perfil' }));

    expect(
      await screen.findByRole('heading', { name: 'Tu hogar empieza aqui' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Perfil guardado correctamente.'),
    ).toBeInTheDocument();
    await expect(createRequest?.json()).resolves.toMatchObject({
      dietaryRestrictions: [
        {
          name: 'Mani',
          notes: 'Evitar trazas.',
          severity: 'Alta',
          type: 'ALLERGY',
        },
      ],
    });
  });

  it('rejects a future birth date before advancing', async () => {
    const user = userEvent.setup();

    renderRoute(
      '/app/perfil/editar',
      createTestAuthGateway({
        accessToken: 'test-token',
        userId: 'user-1',
      }),
    );

    await user.type(await screen.findByLabelText('Nombre'), 'Alejandro');
    fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), {
      target: { value: getTomorrowDateInputValue() },
    });
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(
      await screen.findByText('La fecha de nacimiento no puede ser futura.'),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Sexo biologico')).not.toBeInTheDocument();
  });

  it('restores the profile draft and current step after a reload', async () => {
    const user = userEvent.setup();

    const firstRender = renderRoute(
      '/app/perfil/editar',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    await user.type(await screen.findByLabelText('Nombre'), 'Alejandro');
    await user.type(screen.getByLabelText('Fecha de nacimiento'), '1990-05-20');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(await screen.findByText(/Paso 2 de 5/)).toBeInTheDocument();
    firstRender.unmount();

    renderRoute(
      '/app/perfil/editar',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    expect(await screen.findByText(/Paso 2 de 5/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(await screen.findByDisplayValue('Alejandro')).toBeInTheDocument();
  });

  it('rejects a height less than or equal to zero before advancing', async () => {
    const user = userEvent.setup();

    renderRoute(
      '/app/perfil/editar',
      createTestAuthGateway({ accessToken: 'test-token', userId: 'user-1' }),
    );

    await fillBasicInformation(user);
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.selectOptions(screen.getByLabelText('Sexo biologico'), 'MALE');
    await user.type(screen.getByLabelText('Altura en centimetros'), '0');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(
      await screen.findByText('La altura debe ser un numero mayor que cero.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText('Nivel de actividad'),
    ).not.toBeInTheDocument();
  });

  it('loads and updates the existing profile', async () => {
    const user = userEvent.setup();
    let updateRequest: Request | undefined;

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

      if (request.url.includes('/adult-profiles')) {
        if (request.method === 'PATCH') {
          updateRequest = request;
          return jsonResponse({ ...profile, heightCm: 180 });
        }

        return jsonResponse([profile]);
      }

      return jsonResponse({ status: 'ok' });
    });

    renderRoute(
      '/app/perfil/editar',
      createTestAuthGateway({
        accessToken: 'test-token',
        userId: 'supabase-user-1',
      }),
    );

    expect(
      await screen.findByRole('heading', { name: 'Edita tu perfil' }),
    ).toBeInTheDocument();
    expect(await screen.findByDisplayValue('Alejandro')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.clear(screen.getByLabelText('Altura en centimetros'));
    await user.type(screen.getByLabelText('Altura en centimetros'), '180');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.clear(screen.getByLabelText('Nombre'));
    await user.type(screen.getByLabelText('Nombre'), 'Nuez');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(
      await screen.findByRole('heading', { name: 'Tu hogar empieza aqui' }),
    ).toBeInTheDocument();
    expect(updateRequest?.method).toBe('PATCH');
    await expect(updateRequest?.json()).resolves.toMatchObject({
      dietaryRestrictions: [expect.objectContaining({ name: 'Nuez' })],
      heightCm: 180,
    });
  });
});

async function fillBasicInformation(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText('Nombre'), 'Alejandro');
  await user.type(screen.getByLabelText('Fecha de nacimiento'), '1990-05-20');
}

function getTomorrowDateInputValue(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');

  return `${tomorrow.getFullYear()}-${month}-${day}`;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });
}
