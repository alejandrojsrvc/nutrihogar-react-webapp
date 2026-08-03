import { useMutation } from '@tanstack/react-query';

import { confirmServedPortionConsumptionUseCase } from '../../../../app/composition/dependencies';
import type { ConfirmServedPortionConsumptionInput } from '../../application/ports/ServedPortionConsumptionGateway';

export function useConfirmServedPortionConsumption() {
  return useMutation({
    mutationFn: ({
      portionId,
      input,
    }: {
      portionId: string;
      input: ConfirmServedPortionConsumptionInput;
    }) => confirmServedPortionConsumptionUseCase.execute(portionId, input),
  });
}
