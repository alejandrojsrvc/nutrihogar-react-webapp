import {
  ApiClientError,
  normalizeApiError,
  type ApiClient,
} from '@nutrihogar/api-client';

import type {
  CreateHouseholdInput,
  Household,
  HouseholdGateway,
} from '../../../modules/households/application/ports/HouseholdGateway';

export class HttpHouseholdGateway implements HouseholdGateway {
  constructor(private readonly apiClient: ApiClient) {}

  async list(): Promise<Household[]> {
    try {
      const result = await this.apiClient.GET('/api/households');

      if (result.error !== undefined) {
        throw normalizeApiError(result.error, result.response);
      }

      if (!result.data) {
        throw new ApiClientError(
          'unknown',
          'La API no devolvio los hogares del usuario.',
        );
      }

      return result.data.map(toHousehold);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  async create(input: CreateHouseholdInput): Promise<Household> {
    try {
      const result = await this.apiClient.POST('/api/households', {
        body: input,
      });

      if (result.error !== undefined) {
        throw normalizeApiError(result.error, result.response);
      }

      if (!result.data) {
        throw new ApiClientError(
          'unknown',
          'La API no devolvio el hogar creado.',
        );
      }

      return toHousehold(result.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}

function toHousehold(value: {
  id: string;
  name: string;
  timezone: string;
  currency: string;
}): Household {
  return {
    currency: value.currency,
    id: value.id,
    name: value.name,
    timezone: value.timezone,
  };
}
