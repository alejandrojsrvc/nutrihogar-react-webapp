import type {
  CreatePreparedFoodLeftoverInput,
  PreparedFoodLeftoverGateway,
  PreparedFoodLeftoverStatus,
} from '../ports/PreparedFoodLeftoverGateway';

export class CreatePreparedFoodLeftoverUseCase {
  constructor(private readonly gateway: PreparedFoodLeftoverGateway) {}

  execute(batchId: string, input: CreatePreparedFoodLeftoverInput) {
    return this.gateway.create(batchId, input);
  }
}

export class ListPreparedFoodLeftoversUseCase {
  constructor(private readonly gateway: PreparedFoodLeftoverGateway) {}

  execute(householdId: string) {
    return this.gateway.list(householdId);
  }
}

export class GetPreparedFoodLeftoverUseCase {
  constructor(private readonly gateway: PreparedFoodLeftoverGateway) {}

  execute(leftoverId: string) {
    return this.gateway.getById(leftoverId);
  }
}

export class UpdatePreparedFoodLeftoverStatusUseCase {
  constructor(private readonly gateway: PreparedFoodLeftoverGateway) {}

  execute(leftoverId: string, status: PreparedFoodLeftoverStatus) {
    return this.gateway.updateStatus(leftoverId, status);
  }
}
