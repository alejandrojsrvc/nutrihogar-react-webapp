import { describe, expect, it } from 'vitest';

import type { ActiveHouseholdGateway } from '../ports/ActiveHouseholdGateway';
import type { Household } from '../ports/HouseholdGateway';
import { ResolveActiveHouseholdUseCase } from './ResolveActiveHouseholdUseCase';
import { SelectActiveHouseholdUseCase } from './SelectActiveHouseholdUseCase';

const households: Household[] = [
  {
    currency: 'ARS',
    id: 'household-1',
    name: 'Hogar Sojo',
    timezone: 'America/Argentina/Buenos_Aires',
  },
  {
    currency: 'USD',
    id: 'household-2',
    name: 'Hogar de trabajo',
    timezone: 'America/New_York',
  },
];

function createMemoryGateway(initialId: string | null = null) {
  let activeId = initialId;

  const gateway: ActiveHouseholdGateway = {
    clear: () => {
      activeId = null;
    },
    get: () => activeId,
    set: (householdId) => {
      activeId = householdId;
    },
  };

  return { gateway, getActiveId: () => activeId };
}

describe('household selection use cases', () => {
  it('selects the only household automatically', () => {
    const memory = createMemoryGateway();
    const useCase = new ResolveActiveHouseholdUseCase(memory.gateway);

    expect(useCase.execute([households[0]])).toEqual(households[0]);
    expect(memory.getActiveId()).toBe('household-1');
  });

  it('restores the stored household when it is still available', () => {
    const memory = createMemoryGateway('household-2');
    const useCase = new ResolveActiveHouseholdUseCase(memory.gateway);

    expect(useCase.execute(households)).toEqual(households[1]);
  });

  it('persists a manually selected household', () => {
    const memory = createMemoryGateway();
    const useCase = new SelectActiveHouseholdUseCase(memory.gateway);

    useCase.execute(households[1]);

    expect(memory.getActiveId()).toBe('household-2');
  });
});
