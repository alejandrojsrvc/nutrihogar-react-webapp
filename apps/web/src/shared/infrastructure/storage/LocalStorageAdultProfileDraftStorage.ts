import type {
  AdultProfileDraft,
  AdultProfileDraftRestriction,
  AdultProfileDraftStorage,
  AdultProfileDraftValues,
} from '../../../modules/households/application/ports/AdultProfileDraftStorage';
import type { DietaryRestrictionType } from '../../../modules/households/application/ports/AdultProfileGateway';

const STORAGE_KEY_PREFIX = 'nutrihogar.adult-profile-draft.';
const RESTRICTION_TYPES: DietaryRestrictionType[] = [
  'ALLERGY',
  'INTOLERANCE',
  'PREFERENCE',
];

export class LocalStorageAdultProfileDraftStorage
  implements AdultProfileDraftStorage
{
  clear(key: string): void {
    try {
      globalThis.localStorage?.removeItem(toStorageKey(key));
    } catch {
      // El formulario sigue funcionando aunque el navegador bloquee storage.
    }
  }

  get(key: string): AdultProfileDraft | null {
    try {
      const rawValue = globalThis.localStorage?.getItem(toStorageKey(key));

      if (!rawValue) {
        return null;
      }

      const parsedValue: unknown = JSON.parse(rawValue);

      if (!isRecord(parsedValue) || !isRecord(parsedValue.values)) {
        return null;
      }

      return {
        currentStep: normalizeStep(parsedValue.currentStep),
        values: normalizeValues(parsedValue.values),
      };
    } catch {
      return null;
    }
  }

  save(key: string, draft: AdultProfileDraft): void {
    try {
      globalThis.localStorage?.setItem(
        toStorageKey(key),
        JSON.stringify(draft),
      );
    } catch {
      // El formulario sigue funcionando aunque el navegador bloquee storage.
    }
  }
}

function normalizeStep(value: unknown): number {
  return typeof value === 'number' && value >= 1 && value <= 5
    ? Math.floor(value)
    : 1;
}

function normalizeValues(value: Record<string, unknown>): AdultProfileDraftValues {
  return {
    activityLevel: readString(value.activityLevel),
    birthDate: readString(value.birthDate),
    biologicalSex: readString(value.biologicalSex),
    dietaryRestrictions: Array.isArray(value.dietaryRestrictions)
      ? value.dietaryRestrictions.flatMap((restriction) => {
          if (!isRecord(restriction)) {
            return [];
          }

          const type = restriction.type;

          if (
            typeof type !== 'string' ||
            !RESTRICTION_TYPES.includes(type as DietaryRestrictionType)
          ) {
            return [];
          }

          const normalizedRestriction: AdultProfileDraftRestriction = {
            name: readString(restriction.name),
            notes: readString(restriction.notes),
            severity: readString(restriction.severity),
            type: type as DietaryRestrictionType,
          };

          return [normalizedRestriction];
        })
      : [],
    hasKitchenScale: value.hasKitchenScale === true,
    heightCm: readString(value.heightCm),
    weightKg: readString(value.weightKg),
    name: readString(value.name),
    primaryGoal: readString(value.primaryGoal),
  };
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toStorageKey(key: string): string {
  return `${STORAGE_KEY_PREFIX}${encodeURIComponent(key)}`;
}
