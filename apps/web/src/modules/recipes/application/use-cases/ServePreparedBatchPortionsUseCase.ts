import type {
  ServePortionsInput,
  ServedPortionGateway,
} from '../ports/ServedPortionGateway';
export class ServePreparedBatchPortionsUseCase {
  constructor(private readonly gateway: ServedPortionGateway) {}
  execute(id: string, input: ServePortionsInput) {
    if (
      !input.portions.length ||
      input.portions.some(
        (portion) =>
          !Number.isFinite(portion.servedWeight) || portion.servedWeight <= 0,
      )
    )
      throw new Error('Agrega al menos una porción válida.');
    return this.gateway.serve(id, input);
  }
}
