import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  confirmPreparedBatchInventoryUseCase,
  loadPreparedBatchInventoryPreviewUseCase,
} from '../../../../app/composition/dependencies';
import type { PreparedBatchInventoryDecision } from '../../domain/PreparedBatchInventory';

export const preparedBatchInventoryQueryKeys = {
  all: ['prepared-batch-inventory'] as const,
  preview: (batchId: string) => [...preparedBatchInventoryQueryKeys.all, batchId] as const,
};

export function usePreparedBatchInventoryPreview(batchId: string | undefined) {
  return useQuery({
    enabled: Boolean(batchId),
    queryKey: batchId ? preparedBatchInventoryQueryKeys.preview(batchId) : preparedBatchInventoryQueryKeys.all,
    queryFn: () => loadPreparedBatchInventoryPreviewUseCase.execute(batchId as string),
    retry: false,
  });
}

export function useConfirmPreparedBatchInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ batchId, decisions }: { batchId: string; decisions: PreparedBatchInventoryDecision[] }) =>
      confirmPreparedBatchInventoryUseCase.execute(batchId, decisions),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: preparedBatchInventoryQueryKeys.preview(variables.batchId) });
      void queryClient.invalidateQueries({ queryKey: ['prepared-batches'] });
      void queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
