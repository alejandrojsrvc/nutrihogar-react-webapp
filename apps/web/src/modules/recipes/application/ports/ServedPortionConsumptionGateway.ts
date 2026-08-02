export type RemainderDisposition =
  | 'SAVED'
  | 'DISCARDED'
  | 'SHARED'
  | 'CONSUMED_LATER';

export interface ConfirmServedPortionConsumptionInput {
  remainderWeight?: number;
  remainderDisposition?: RemainderDisposition;
  mealType: string;
  consumedAt: Date;
}

export interface ConfirmedServedPortionConsumption {
  portionId: string;
  adultProfileId: string;
  servedWeight: number;
  consumedWeight: number;
  remainderWeight: number | null;
  remainderDisposition: RemainderDisposition | null;
  mealId: string | null;
  nutrients: Record<string, number>;
}

export interface ServedPortionConsumptionGateway {
  confirm(
    portionId: string,
    input: ConfirmServedPortionConsumptionInput,
  ): Promise<ConfirmedServedPortionConsumption>;
}
