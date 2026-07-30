import { describe, expect, it, vi } from 'vitest';

import { createApiClient } from '@nutrihogar/api-client';

import { HttpAdultProfileGateway } from './HttpAdultProfileGateway';

const profile = {
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
};

describe('HttpAdultProfileGateway', () => {
  it('lists profiles for the selected household', async () => {
    let request: Request | undefined;
    const fetchImplementation: typeof globalThis.fetch = vi.fn(
      async (input, init) => {
        request = new Request(input, init);
        return new Response(JSON.stringify([profile]), {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        });
      },
    );
    const apiClient = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchImplementation,
      getAccessToken: () => 'test-token',
    });

    await expect(
      new HttpAdultProfileGateway(apiClient).list('household-1'),
    ).resolves.toMatchObject([
      {
        id: 'profile-1',
        name: 'Alejandro',
        userId: 'user-1',
      },
    ]);

    expect(request?.url).toBe(
      'http://localhost:3000/api/households/household-1/adult-profiles',
    );
    expect(request?.headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('creates a profile and sends an empty restrictions list', async () => {
    let request: Request | undefined;
    const fetchImplementation: typeof globalThis.fetch = vi.fn(
      async (input, init) => {
        request = new Request(input, init);
        return new Response(JSON.stringify(profile), {
          headers: { 'Content-Type': 'application/json' },
          status: 201,
        });
      },
    );
    const apiClient = createApiClient({
      baseUrl: 'http://localhost:3000',
      fetch: fetchImplementation,
    });

    await expect(
      new HttpAdultProfileGateway(apiClient).create('household-1', {
        activityLevel: 'MODERATE',
        birthDate: '1990-05-20',
        biologicalSex: 'MALE',
        hasKitchenScale: true,
        heightCm: 175.5,
        name: 'Alejandro',
        primaryGoal: 'FAT_LOSS',
      }),
    ).resolves.toMatchObject({ id: 'profile-1', name: 'Alejandro' });

    expect(request?.method).toBe('POST');
    await expect(request?.json()).resolves.toEqual({
      activityLevel: 'MODERATE',
      birthDate: '1990-05-20',
      biologicalSex: 'MALE',
      dietaryRestrictions: [],
      hasKitchenScale: true,
      heightCm: 175.5,
      name: 'Alejandro',
      primaryGoal: 'FAT_LOSS',
    });
  });
});
