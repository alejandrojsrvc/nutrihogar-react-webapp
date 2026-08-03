import type { PreparedBatchGateway } from '../ports/PreparedBatchGateway';
export class FinalizePreparedBatchUseCase {
  constructor(private readonly gateway: PreparedBatchGateway) {}
  execute(id: string, weight: number) {
    if (!Number.isFinite(weight) || weight <= 0)
      throw new Error('El peso cocido debe ser mayor que cero.');
    return this.gateway.finalize(id, weight);
  }
}
