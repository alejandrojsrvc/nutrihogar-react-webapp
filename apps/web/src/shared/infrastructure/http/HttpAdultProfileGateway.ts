import {
  ApiClientError,
  normalizeApiError,
  type ApiClient,
} from '@nutrihogar/api-client';

import type {
  AdultProfile,
  AdultProfileGateway,
  CreateAdultProfileInput,
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
            dietaryRestrictions: [],
          },
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
}

function toAdultProfile(value: {
  id: string;
  householdId: string;
  userId: string;
  name: string;
  birthDate: string;
  age: number;
  biologicalSex: AdultProfile['biologicalSex'];
  heightCm: number;
  activityLevel: AdultProfile['activityLevel'];
  primaryGoal: AdultProfile['primaryGoal'];
  hasKitchenScale: boolean;
  dietaryRestrictions: Array<{
    id: string;
    name: string;
    type: AdultProfile['dietaryRestrictions'][number]['type'];
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
      type: restriction.type,
    })),
    hasKitchenScale: value.hasKitchenScale,
    heightCm: value.heightCm,
    householdId: value.householdId,
    id: value.id,
    name: value.name,
    primaryGoal: value.primaryGoal,
    userId: value.userId,
  };
}
