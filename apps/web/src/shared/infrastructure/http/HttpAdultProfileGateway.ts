import {
  ApiClientError,
  normalizeApiError,
  type ApiClient,
  type components,
} from '@nutrihogar/api-client';

import type {
  AdultProfile,
  AdultProfileGateway,
  CreateAdultProfileInput,
  UpdateAdultProfileInput,
} from '../../../modules/households/application/ports/AdultProfileGateway';

export class HttpAdultProfileGateway implements AdultProfileGateway {
  constructor(private readonly apiClient: ApiClient) {}

  async list(householdId: string): Promise<AdultProfile[]> {
    try {
      const result = await this.apiClient.GET(
        '/api/households/{householdId}/adult-profiles',
        { params: { path: { householdId } } },
      );

      if (result.error !== undefined) {
        throw normalizeApiError(result.error, result.response);
      }

      if (!result.data) {
        throw new ApiClientError(
          'unknown',
          'La API no devolvio los perfiles del hogar.',
        );
      }

      return result.data.map(toAdultProfile);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async create(
    householdId: string,
    input: CreateAdultProfileInput,
  ): Promise<AdultProfile> {
    try {
      const result = await this.apiClient.POST(
        '/api/households/{householdId}/adult-profiles',
        {
          body: {
            ...input,
            dietaryRestrictions: input.dietaryRestrictions ?? [],
          } as unknown as components['schemas']['CreateAdultProfileRequestDto'],
          params: { path: { householdId } },
        },
      );

      if (result.error !== undefined) {
        throw normalizeApiError(result.error, result.response);
      }

      if (!result.data) {
        throw new ApiClientError(
          'unknown',
          'La API no devolvio el perfil creado.',
        );
      }

      return toAdultProfile(result.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async update(
    profileId: string,
    input: UpdateAdultProfileInput,
  ): Promise<AdultProfile> {
    try {
      const result = await this.apiClient.PATCH(
        '/api/adult-profiles/{profileId}',
        {
          body: input as unknown as components['schemas']['UpdateAdultProfileRequestDto'],
          params: { path: { profileId } },
        },
      );

      if (result.error !== undefined) {
        throw normalizeApiError(result.error, result.response);
      }

      if (!result.data) {
        throw new ApiClientError(
          'unknown',
          'La API no devolvio el perfil actualizado.',
        );
      }

      return toAdultProfile(result.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}

function toAdultProfile(value: {
  id: string;
  householdId: string;
  userId: string;
  name: string;
  birthDate: string;
  age: number;
  biologicalSex: AdultProfile['biologicalSex'];
  weightKg: unknown;
  heightCm: number;
  activityLevel: AdultProfile['activityLevel'];
  primaryGoal: AdultProfile['primaryGoal'];
  hasKitchenScale: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  dietaryRestrictions: Array<{
    id: string;
    name: string;
    type: AdultProfile['dietaryRestrictions'][number]['type'];
    severity: unknown;
    notes: unknown;
  }>;
}): AdultProfile {
  return {
    activityLevel: value.activityLevel,
    age: value.age,
    biologicalSex: value.biologicalSex,
    birthDate: value.birthDate,
    dietaryRestrictions: value.dietaryRestrictions.map((restriction) => ({
      id: restriction.id,
      name: restriction.name,
      notes: toNullableText(restriction.notes),
      severity: toNullableText(restriction.severity),
      type: restriction.type,
    })),
    hasKitchenScale: value.hasKitchenScale,
    heightCm: value.heightCm,
    weightKg: typeof value.weightKg === 'number' ? value.weightKg : null,
    householdId: value.householdId,
    id: value.id,
    name: value.name,
    primaryGoal: value.primaryGoal,
    userId: value.userId,
    isActive: value.isActive,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

function toNullableText(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}
