import { normalizeApiError, type ApiClient } from '@nutrihogar/api-client';

import type {
  ConfirmServedPortionConsumptionInput,
  ConfirmedServedPortionConsumption,
  ServedPortionConsumptionGateway,
} from '../../application/ports/ServedPortionConsumptionGateway';

type Result = { data?: unknown; error?: unknown; response?: Response };

interface Client {
  POST(
    path: string,
    options: { params: { path: { portionId: string } }; body: unknown },
  ): Promise<Result>;
}

export class HttpServedPortionConsumptionGateway
  implements ServedPortionConsumptionGateway
{
  constructor(private readonly apiClient: ApiClient) {}

  async confirm(
    portionId: string,
    input: ConfirmServedPortionConsumptionInput,
  ): Promise<ConfirmedServedPortionConsumption> {
    try {
      const result = await (this.apiClient as unknown as Client).POST(
        `/api/served-portions/${portionId}/confirm-consumption`,
        {
          params: { path: { portionId } },
          body: {
            consumedAt: input.consumedAt.toISOString(),
            mealType: input.mealType,
            remainderDisposition: input.remainderDisposition,
            remainderWeight: input.remainderWeight,
          },
        },
      );

      if (result.error !== undefined) {
        throw normalizeApiError(result.error, result.response);
      }

      return mapConfirmedConsumption(result.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
}

function mapConfirmedConsumption(value: unknown): ConfirmedServedPortionConsumption {
  const source = record(value);
  return {
    adultProfileId: String(source.adultProfileId ?? ''),
    consumedWeight: Number(source.consumedWeight ?? 0),
    mealId: nullableString(source.mealId),
    nutrients: numbers(source.nutrients),
    portionId: String(source.portionId ?? ''),
    remainderDisposition: source.remainderDisposition == null
      ? null
      : String(source.remainderDisposition) as ConfirmedServedPortionConsumption['remainderDisposition'],
    remainderWeight: source.remainderWeight == null ? null : Number(source.remainderWeight),
    servedWeight: Number(source.servedWeight ?? 0),
  };
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function numbers(value: unknown): Record<string, number> {
  return Object.fromEntries(
    Object.entries(record(value)).map(([key, amount]) => [key, Number(amount)]),
  );
}

function nullableString(value: unknown): string | null {
  return value == null ? null : String(value);
}
