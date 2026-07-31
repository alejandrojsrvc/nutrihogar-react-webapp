import type { PreparedBatchGateway } from '../ports/PreparedBatchGateway';
export class LoadPreparedBatchUseCase { constructor(private readonly gateway: PreparedBatchGateway) {} execute(id: string) { return this.gateway.getById(id); } }
