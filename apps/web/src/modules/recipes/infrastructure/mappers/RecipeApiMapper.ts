import type { Recipe } from '../../domain/Recipe';

export function toRecipe(value: unknown): Recipe {
  const source = asRecord(value);
  return {
    category: nullableString(source.category),
    createdAt: String(source.createdAt ?? ''),
    createdById: String(source.createdById ?? ''),
    defaultServings: Number(source.defaultServings ?? 0),
    description: nullableString(source.description),
    estimatedPreparationMinutes: source.estimatedPreparationMinutes == null ? null : Number(source.estimatedPreparationMinutes),
    householdId: String(source.householdId ?? ''),
    id: String(source.id ?? ''),
    ingredients: Array.isArray(source.ingredients) ? source.ingredients.map((ingredient, index) => { const item = asRecord(ingredient); return { foodId: String(item.foodId ?? ''), id: String(item.id ?? `ingredient-${index}`), position: Number(item.position ?? index + 1), quantity: Number(item.quantity ?? 0), servingId: nullableString(item.servingId), unit: String(item.unit ?? '') }; }) : [],
    instructions: Array.isArray(source.instructions) ? source.instructions.map((instruction, index) => { const item = asRecord(instruction); return { description: String(item.description ?? ''), id: String(item.id ?? `instruction-${index}`), position: Number(item.position ?? index + 1) }; }) : [],
    name: String(source.name ?? ''),
    status: String(source.status ?? 'ACTIVE'),
    tags: Array.isArray(source.tags) ? source.tags.map(String) : [],
    updatedAt: String(source.updatedAt ?? ''),
  };
}

function nullableString(value: unknown) { return value == null ? null : String(value); }
function asRecord(value: unknown): Record<string, unknown> { return value && typeof value === 'object' ? value as Record<string, unknown> : {}; }
