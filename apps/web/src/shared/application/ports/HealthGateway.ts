import type { components } from '@nutrihogar/api-client';

export type HealthStatus = components['schemas']['HealthResponseDto'];

export interface HealthGateway {
  check(): Promise<HealthStatus>;
}
