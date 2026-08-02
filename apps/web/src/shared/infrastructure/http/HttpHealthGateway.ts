import {
  ApiClientError,
  normalizeApiError,
  type ApiClient,
} from '@nutrihogar/api-client';

import type {
  HealthGateway,
  HealthStatus,
} from '../../application/ports/HealthGateway';

export class HttpHealthGateway implements HealthGateway {
  constructor(private readonly apiClient: ApiClient) {}

  async check(): Promise<HealthStatus> {
    try {
      const result = await (
        this.apiClient as unknown as {
          GET(path: string): Promise<{
            data?: HealthStatus;
            error?: unknown;
            response?: Response;
          }>;
        }
      ).GET('/api/health');

      if (result.error !== undefined) {
        throw normalizeApiError(result.error, result.response);
      }

      if (!result.data) {
        throw new ApiClientError(
          'unknown',
          'La API no devolvio datos para el estado de salud.',
        );
      }

      return result.data;
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}
