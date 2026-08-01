import type {
  ConfirmServedPortionConsumptionInput,
  ServedPortionConsumptionGateway,
} from '../ports/ServedPortionConsumptionGateway';

export class ConfirmServedPortionConsumptionUseCase {
  constructor(private readonly gateway: ServedPortionConsumptionGateway) {}

  execute(portionId: string, input: ConfirmServedPortionConsumptionInput) {
    return this.gateway.confirm(portionId, input);
  }
}
