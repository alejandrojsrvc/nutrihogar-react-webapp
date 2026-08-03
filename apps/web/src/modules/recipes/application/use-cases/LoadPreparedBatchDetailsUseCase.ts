import type { PreparedBatchGateway } from '../ports/PreparedBatchGateway';
export class LoadPreparedBatchDetailsUseCase {
  constructor(private readonly gateway: PreparedBatchGateway) {}
  execute(id: string) {
    return this.gateway.getDetails(id);
  }
}
