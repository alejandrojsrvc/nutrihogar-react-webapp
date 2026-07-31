import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import { calculateNutritionPreview, roundNutritionSummary } from '@nutrihogar/nutrition-engine';
import { mealFormSchema, type MealFormValues } from '@nutrihogar/schemas';
import type { NutritionSummary } from '@nutrihogar/domain';
import { FoodSelector } from '../../../food-catalog/presentation/components/FoodSelector';
import type { FoodSelection } from '../../../food-catalog/application/ports/FoodCatalogGateway';
import type { MealDraftItem } from '../../application/ports/MealGateway';

const mealTypeLabels = { BREAKFAST: 'Desayuno', LUNCH: 'Almuerzo', SNACK: 'Merienda', DINNER: 'Cena', EXTRA: 'Extra' };

export function MealForm({
  initialItems = [],
  initialValues,
  isSubmitting,
  onSubmit,
  profiles,
  submitLabel,
  errorMessage,
}: {
  initialItems?: MealDraftItem[];
  initialValues: MealFormValues;
  isSubmitting?: boolean;
  onSubmit: (values: MealFormValues, items: MealDraftItem[]) => void;
  profiles: Array<{ id: string; name: string }>;
  submitLabel: string;
  errorMessage?: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [showSelector, setShowSelector] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const form = useForm<MealFormValues>({ defaultValues: { ...initialValues, items: initialItems.map(toFormItem) }, resolver: zodResolver(mealFormSchema) });
  const selectedProfileId = useWatch({ control: form.control, name: 'profileId' });
  const summary = roundNutritionSummary(calculateNutritionPreview(items.map(toPreviewItem)));

  function syncItems(nextItems: MealDraftItem[]) {
    setItems(nextItems);
    form.setValue('items', nextItems.map(toFormItem), { shouldValidate: true });
  }

  function selectItem(selection: FoodSelection) {
    const item = { ...selection, id: editingItemId ?? crypto.randomUUID() };
    syncItems(editingItemId ? items.map((current) => current.id === editingItemId ? item : current) : [...items, item]);
    setEditingItemId(null);
    setShowSelector(false);
  }

  function removeItem(itemId: string) {
    syncItems(items.filter((item) => item.id !== itemId));
  }

  function updateItemQuantity(itemId: string, quantity: number) {
    if (!Number.isFinite(quantity) || quantity <= 0) return;
    syncItems(items.map((item) => item.id === itemId ? { ...item, quantity } : item));
  }

  return (
    <>
      <form className="meal-form" onSubmit={form.handleSubmit((values) => onSubmit(values, items))}>
        <div className="form-field"><label htmlFor="meal-profile">Adulto</label><select id="meal-profile" {...form.register('profileId')}><option value="">Selecciona un adulto</option><MealProfileOptions profiles={profiles} /></select>{form.formState.errors.profileId ? <p className="form-field__error">{form.formState.errors.profileId.message}</p> : null}</div>
        <div className="form-field"><label htmlFor="meal-type">Tipo de comida</label><select id="meal-type" {...form.register('mealType')}>{Object.entries(mealTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <div className="form-field"><label htmlFor="meal-date">Fecha y hora</label><input id="meal-date" type="datetime-local" {...form.register('consumedAt', { valueAsDate: true })} /></div>
        <div className="form-field"><label htmlFor="meal-notes">Nota (opcional)</label><textarea id="meal-notes" {...form.register('notes')} /></div>
        <div className="meal-items">
          <div className="meal-items__heading"><h2>Alimentos</h2><button className="button button--secondary" onClick={() => { setEditingItemId(null); setShowSelector(true); }} type="button">Agregar alimento</button></div>
          {items.length === 0 ? <p className="empty-state">Agrega los alimentos de esta comida.</p> : items.map((item) => <article className="meal-item" key={item.id}><div><strong>{item.food.name}</strong><span>{item.quantity} {item.unit === 'SERVING' ? 'porción(es)' : item.unit.toLowerCase()}</span><small>{formatItemPreview(item)}</small></div><label>Cantidad<input aria-label={`Cantidad de ${item.food.name}`} min="0.1" onChange={(event) => updateItemQuantity(item.id, Number(event.target.value))} step="0.1" type="number" value={item.quantity} /></label><div><button className="button button--secondary" onClick={() => { setEditingItemId(item.id); setShowSelector(true); }} type="button">Cambiar alimento</button><button className="button button--secondary" onClick={() => removeItem(item.id)} type="button">Eliminar</button></div></article>)}
        </div>
        <NutritionPreview summary={summary} />
        {form.formState.errors.items ? <p className="form-field__error" role="alert">{form.formState.errors.items.message}</p> : null}
        {errorMessage ? <p role="alert">{errorMessage}</p> : null}
        <div className="meal-form__actions"><Link className="button button--secondary" to="/app">Cancelar</Link><button className="button button--primary" disabled={Boolean(isSubmitting) || !selectedProfileId || items.length === 0} type="submit">{isSubmitting ? 'Guardando...' : submitLabel}</button></div>
      </form>
      {showSelector ? <FoodSelector onClose={() => { setEditingItemId(null); setShowSelector(false); }} onSelect={selectItem} /> : null}
    </>
  );
}

export function MealProfileOptions({ profiles }: { profiles: Array<{ id: string; name: string }> }) {
  return <>{profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}</>;
}

function NutritionPreview({ summary }: { summary: NutritionSummary }) {
  return <section className="nutrition-preview" aria-labelledby="nutrition-preview-title"><p className="eyebrow">Previsualización</p><h2 id="nutrition-preview-title">Estimación de esta comida</h2><p className="supporting-text">El backend confirmará los valores al guardar.</p><dl className="nutrition-value-list"><div><dt>Calorías</dt><dd>{summary.calories} kcal</dd></div><div><dt>Proteína</dt><dd>{summary.proteinGrams} g</dd></div><div><dt>Carbohidratos</dt><dd>{summary.carbohydrateGrams} g</dd></div><div><dt>Grasas</dt><dd>{summary.fatGrams} g</dd></div><div><dt>Fibra</dt><dd>{summary.fiberGrams} g</dd></div></dl></section>;
}

function toFormItem(item: MealDraftItem) { return { foodId: item.food.id, foodName: item.food.name, measurementMethod: item.measurementMethod, quantity: item.quantity, servingId: item.servingId, unit: item.unit }; }
function toPreviewItem(item: MealDraftItem) { const food = item.food; return { nutrition: { calories: food.energyKcal ?? getNutrient(food, ['ENERGY_KCAL', 'CALORIES']) ?? 0, proteinGrams: food.proteinGrams ?? getNutrient(food, ['PROTEIN']) ?? 0, carbohydrateGrams: food.carbohydrateGrams ?? getNutrient(food, ['CARBOHYDRATE', 'CARBS']) ?? 0, fatGrams: food.fatGrams ?? getNutrient(food, ['FAT']) ?? 0, fiberGrams: getNutrient(food, ['FIBER']) ?? 0 }, quantity: item.quantity, referenceQuantity: food.referenceQuantity, referenceUnit: food.referenceUnit, servingEquivalent: item.servingEquivalent, unit: item.unit } as const; }
function formatItemPreview(item: MealDraftItem): string { const summary = roundNutritionSummary(calculateNutritionPreview([toPreviewItem(item)])); return `${summary.calories} kcal · ${summary.proteinGrams} g de proteína`; }
function getNutrient(food: MealDraftItem['food'], codes: string[]): number | null { if (!('nutrients' in food)) return null; return food.nutrients.find((item) => codes.includes(item.nutrientDefinition.code))?.amount ?? null; }
