import {
  createApiClient,
  type ApiClient,
} from '@nutrihogar/api-client';

import { CheckHealthUseCase } from '../../shared/application/use-cases/CheckHealthUseCase';
import { HttpHealthGateway } from '../../shared/infrastructure/http/HttpHealthGateway';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient: ApiClient = createApiClient({
  baseUrl: apiBaseUrl,
});

const healthGateway = new HttpHealthGateway(apiClient);

export const checkHealthUseCase = new CheckHealthUseCase(healthGateway);
