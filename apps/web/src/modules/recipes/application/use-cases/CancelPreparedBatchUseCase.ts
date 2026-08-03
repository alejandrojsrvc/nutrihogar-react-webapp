import type { PreparedBatchGateway } from '../ports/PreparedBatchGateway';
export class CancelPreparedBatchUseCase {
  constructor(private readonly gateway: PreparedBatchGateway) {}
  execute(id: string) {
    return this.gateway.cancel(id);
  }
}
