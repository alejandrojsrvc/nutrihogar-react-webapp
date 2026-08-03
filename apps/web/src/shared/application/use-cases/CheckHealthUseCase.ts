import type { HealthGateway, HealthStatus } from '../ports/HealthGateway';

export class CheckHealthUseCase {
  constructor(private readonly healthGateway: HealthGateway) {}

  execute(): Promise<HealthStatus> {
    return this.healthGateway.check();
  }
}
