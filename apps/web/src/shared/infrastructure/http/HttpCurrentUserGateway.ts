import {
  ApiClientError,
  normalizeApiError,
  type ApiClient,
} from '@nutrihogar/api-client';

import type {
  CurrentUser,
  CurrentUserGateway,
} from '../../../modules/auth/application/ports/CurrentUserGateway';

export class HttpCurrentUserGateway implements CurrentUserGateway {
  constructor(private readonly apiClient: ApiClient) {}

  async getCurrentUser(): Promise<CurrentUser> {
    try {
      const result = await this.apiClient.GET('/api/users/me');

      if (result.error !== undefined) {
        throw normalizeApiError(result.error, result.response);
      }

      if (!result.data) {
        throw new ApiClientError(
          'unknown',
          'La API no devolvio los datos del usuario autenticado.',
        );
      }

      return {
        avatarUrl: toNullableText(result.data.avatarUrl),
        displayName: toNullableText(result.data.displayName),
        email: result.data.email,
        id: result.data.id,
        locale: result.data.locale,
        timezone: result.data.timezone,
      };
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}

function toNullableText(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}
