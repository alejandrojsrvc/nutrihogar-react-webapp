import { useMutation, useQueryClient } from '@tanstack/react-query';

import { confirmServedPortionConsumptionUseCase } from '../../../../app/composition/dependencies';
import type { ConfirmServedPortionConsumptionInput } from '../../application/ports/ServedPortionConsumptionGateway';
import { preparedBatchQueryKeys } from './usePreparedBatches';

export function useConfirmServedPortionConsumption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      portionId,
      input,
    }: {
      portionId: string;
      input: ConfirmServedPortionConsumptionInput;
      batchId?: string;
    }) => confirmServedPortionConsumptionUseCase.execute(portionId, input),
    onSuccess: (_, variables) => {
      if (variables.batchId) {
        void queryClient.invalidateQueries({
          queryKey: preparedBatchQueryKeys.operationalDetails(variables.batchId),
        });
      }
    },
  });
}
