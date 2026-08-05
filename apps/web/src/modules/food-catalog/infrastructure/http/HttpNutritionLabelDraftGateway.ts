import { ApiClientError } from '@nutrihogar/api-client';

import type {
  NutritionLabelConfirmation,
  NutritionLabelConfirmInput,
  NutritionLabelDraft,
  NutritionLabelDraftGateway,
  NutritionLabelUploadInput,
} from '../../application/ports/NutritionLabelDraftGateway';
import { toFoodDetail } from '../../../../shared/infrastructure/http/HttpFoodCatalogGateway';
import { toInventoryItem } from '../../../inventory/infrastructure/mappers/InventoryApiMapper';

export type AuthenticatedFetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export class HttpNutritionLabelDraftGateway
  implements NutritionLabelDraftGateway
{
  constructor(
    private readonly baseUrl: string,
    private readonly fetchAuthenticated: AuthenticatedFetch,
  ) {}

  async createDraft({
    householdId,
    file,
    name,
    brand,
    packageQuantity,
    packageUnit,
  }: NutritionLabelUploadInput): Promise<NutritionLabelDraft> {
    const formData = new FormData();
    formData.append('file', file);
    appendFormValue(formData, 'name', name);
    appendFormValue(formData, 'brand', brand);
    appendFormValue(formData, 'packageQuantity', packageQuantity);
    appendFormValue(formData, 'packageUnit', packageUnit);

    const response = await this.fetchAuthenticated(
      `${this.baseUrl}/households/${householdId}/foods/nutrition-label-drafts`,
      { body: formData, method: 'POST' },
    );

    return parseResponse(response, toNutritionLabelDraft);
  }

  async getDraft(
    householdId: string,
    draftId: string,
  ): Promise<NutritionLabelDraft> {
    const response = await this.fetchAuthenticated(
      `${this.baseUrl}/households/${householdId}/foods/nutrition-label-drafts/${draftId}`,
      { method: 'GET' },
    );

    return parseResponse(response, toNutritionLabelDraft);
  }

  async confirmDraft(
    householdId: string,
    draftId: string,
    input: NutritionLabelConfirmInput,
  ): Promise<NutritionLabelConfirmation> {
    const response = await this.fetchAuthenticated(
      `${this.baseUrl}/households/${householdId}/foods/nutrition-label-drafts/${draftId}/confirm`,
      {
        body: JSON.stringify(input),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      },
    );

    const result = await parseResponse(response, toConfirmation);
    return result;
  }
}

function appendFormValue(formData: FormData, key: string, value?: string) {
  if (value?.trim()) {
    formData.append(key, value.trim());
  }
}

async function parseResponse<T>(
  response: Response,
  mapper: (value: unknown) => T,
): Promise<T> {
  let body: unknown;
  try {
    body = response.status === 204 ? undefined : await response.json();
  } catch {
    body = undefined;
  }

  if (!response.ok) {
    throw new ApiClientError(
      'http',
      getNutritionLabelErrorMessage(response.status),
      response.status,
      body,
    );
  }

  try {
    return mapper(body);
  } catch (error) {
    throw new ApiClientError(
      'unknown',
      'La API devolvio una respuesta invalida para la etiqueta nutricional.',
      undefined,
      error,
    );
  }
}

function toNutritionLabelDraft(value: unknown): NutritionLabelDraft {
  const source = record(value);
  const extracted = record(source.extractedData);
  const allergens = recordOrNull(extracted.allergens);

  return {
    brand: nullableString(source.brand),
    confirmedAt: nullableString(source.confirmedAt),
    confirmedById: nullableString(source.confirmedById),
    confirmedFoodId: nullableString(source.confirmedFoodId),
    confidence: nullableNumber(source.confidence),
    createdAt: String(source.createdAt ?? ''),
    createdById: String(source.createdById ?? ''),
    documentHash: String(source.documentHash ?? ''),
    expiresAt: nullableString(source.expiresAt),
    extractedData: {
      allergens: allergens
        ? {
            contains: stringArray(allergens.contains),
            may_contain: stringArray(allergens.may_contain),
          }
        : null,
      brand: nullableString(extracted.brand),
      confidence: nullableNumber(extracted.confidence),
      ingredients: stringArray(extracted.ingredients),
      net_content: toNutritionLabelAmount(extracted.net_content),
      nutrition_declarations: array(extracted.nutrition_declarations).map(
        toNutritionLabelDeclaration,
      ),
      product_name: nullableString(extracted.product_name),
      requires_review: Boolean(extracted.requires_review),
      schema_version: nullableString(extracted.schema_version),
      serving_size: toNutritionLabelAmount(extracted.serving_size),
      servings_per_container: nullableValue(extracted.servings_per_container),
      warnings: stringArray(extracted.warnings),
    },
    id: String(source.id ?? ''),
    missingFields: stringArray(source.missingFields),
    name: nullableString(source.name),
    packageQuantity: nullableString(source.packageQuantity),
    packageUnit: toPackageUnit(source.packageUnit),
    rawText: nullableString(source.rawText),
    status: String(source.status ?? ''),
    updatedAt: String(source.updatedAt ?? ''),
    warnings: stringArray(source.warnings),
    householdId: String(source.householdId ?? ''),
  };
}

function toNutritionLabelAmount(value: unknown) {
  const source = recordOrNull(value);
  if (!source) return null;
  return {
    description: nullableString(source.description),
    unit: nullableString(source.unit),
    value: nullableValue(source.value),
  };
}

function toNutritionLabelDeclaration(value: unknown) {
  const source = record(value);
  const basis = record(source.basis);
  const nutrients = record(source.nutrients);
  return {
    basis: {
      type: nullableString(basis.type),
      unit: nullableString(basis.unit),
      value: nullableValue(basis.value),
    },
    nutrients: Object.fromEntries(
      Object.entries(nutrients).map(([key, nutrientValue]) => [
        key,
        nullableValue(nutrientValue),
      ]),
    ),
  };
}

function toConfirmation(value: unknown): NutritionLabelConfirmation {
  const source = record(value);
  if (!source.food || !source.inventory) {
    throw new Error('Faltan los recursos creados en la respuesta.');
  }
  return {
    food: toFoodDetail(source.food as never),
    inventory: toInventoryItem(source.inventory),
  };
}

function getNutritionLabelErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'La información de la etiqueta no es válida.';
    case 403:
      return 'No tienes permiso para usar esta etiqueta en el hogar activo.';
    case 409:
      return 'Este borrador ya fue confirmado o cambió. Vuelve a cargarlo.';
    case 413:
      return 'La imagen es demasiado grande.';
    case 422:
      return 'No pudimos reconocer una etiqueta nutricional válida.';
    case 502:
      return 'No se pudo procesar la etiqueta. Inténtalo nuevamente.';
    default:
      return 'No se pudo procesar la etiqueta nutricional.';
  }
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function recordOrNull(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null;
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function stringArray(value: unknown): string[] {
  return array(value).filter((item): item is string => typeof item === 'string');
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function nullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

function nullableValue(value: unknown): number | string | null {
  return typeof value === 'number' || typeof value === 'string' ? value : null;
}

function toPackageUnit(value: unknown) {
  return value === 'GRAM' || value === 'MILLILITER' ? value : null;
}
