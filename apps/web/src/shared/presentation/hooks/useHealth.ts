import { useQuery } from '@tanstack/react-query';

import { checkHealthUseCase } from '../../../app/composition/dependencies';

export const healthQueryKeys = {
  all: ['health'] as const,
};

export function useHealth() {
  return useQuery({
    queryKey: healthQueryKeys.all,
    queryFn: () => checkHealthUseCase.execute(),
    retry: false,
  });
}
