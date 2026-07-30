import type { ActiveHouseholdGateway } from '../../../modules/households/application/ports/ActiveHouseholdGateway';

const ACTIVE_HOUSEHOLD_KEY = 'nutrihogar.active-household-id';

export class LocalStorageActiveHouseholdGateway
  implements ActiveHouseholdGateway
{
  get(): string | null {
    try {
      return globalThis.localStorage?.getItem(ACTIVE_HOUSEHOLD_KEY) ?? null;
    } catch {
      return null;
    }
  }

  set(householdId: string): void {
    try {
      globalThis.localStorage?.setItem(ACTIVE_HOUSEHOLD_KEY, householdId);
    } catch {
      // La selección sigue funcionando en memoria si el navegador bloquea storage.
    }
  }

  clear(): void {
    try {
      globalThis.localStorage?.removeItem(ACTIVE_HOUSEHOLD_KEY);
    } catch {
      // No hay nada más que hacer si el navegador bloquea storage.
    }
  }
}
