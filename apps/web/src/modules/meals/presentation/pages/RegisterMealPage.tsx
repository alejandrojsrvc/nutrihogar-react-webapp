import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router';

import { calculateNutritionPreview, roundNutritionSummary } from '@nutrihogar/nutrition-engine';
import { mealFormSchema, type MealFormValues } from '@nutrihogar/schemas';
import type { NutritionSummary } from '@nutrihogar/domain';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { FoodSelector } from '../../../food-catalog/presentation/components/FoodSelector';
import type { FoodSelection } from '../../../food-catalog/application/ports/FoodCatalogGateway';
import type { MealDraftItem } from '../../application/ports/MealGateway';
import { useRegisterMeal } from '../hooks/useMeals';

const mealTypeLabels = { BREAKFAST: 'Desayuno', LUNCH: 'Almuerzo', SNACK: 'Merienda', DINNER: 'Cena', EXTRA: 'Extra' };

export function RegisterMealPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const params = new URLSearchParams(location.search);
  const [showSelector, setShowSelector] = useState(false);
  const [items, setItems] = useState<MealDraftItem[]>([]);
  const registerMeal = useRegisterMeal();
  const form = useForm<MealFormValues>({
    defaultValues: {
      consumedAt: params.get('date') ? new Date(`${params.get('date')}T12:00:00`) : new Date(),
      items: [],
      mealType: (params.get('mealType') as MealFormValues['mealType']) || 'LUNCH',
      notes: '',
      profileId: params.get('profileId') || '',
    },
    resolver: zodResolver(mealFormSchema),
  });
  const selectedProfileId = useWatch({ control: form.control, name: 'profileId' });
  const summary = roundNutritionSummary(calculateNutritionPreview(items.map(toPreviewItem)));

  function addItem(selection: FoodSelection) {
    const item = { ...selection, id: crypto.randomUUID() };
    const nextItems = [...items, item];
    setItems(nextItems);
    form.setValue('items', nextItems.map(toFormItem), { shouldValidate: true });
    setShowSelector(false);
  }

  function removeItem(itemId: string) {
    const nextItems = items.filter((item) => item.id !== itemId);
    setItems(nextItems);
    form.setValue('items', nextItems.map(toFormItem), { shouldValidate: true });
  }

  function updateItemQuantity(itemId: string, quantity: number) {
    if (!Number.isFinite(quantity) || quantity <= 0) return;
    const nextItems = items.map((item) =>
      item.id === itemId ? { ...item, quantity } : item,
    );
    setItems(nextItems);
    form.setValue('items', nextItems.map(toFormItem), { shouldValidate: true });
  }

  function submit(values: MealFormValues) {
    const householdId = households.activeHousehold?.id;
    if (!householdId) return;
    registerMeal.mutate({
      consumedAt: values.consumedAt,
      householdId,
      items: items.map((item) => ({ foodId: item.food.id, measurementMethod: item.measurementMethod, quantity: item.quantity, unit: item.unit })),
      mealType: values.mealType,
      notes: values.notes,
      profileId: values.profileId,
    }, { onSuccess: () => navigate('/app', { state: { mealSaved: true } }) });
  }

  if (profiles.isPending) return <p className="page-section" role="status">Cargando integrantes...</p>;
  if (!households.activeHousehold) return <p className="page-section" role="alert">Selecciona un hogar antes de registrar una comida.</p>;

  return (
    <section className="page-section meal-page" aria-labelledby="register-meal-title">
      <PageHeader eyebrow="Registro de comida" title="Registra lo que comiste" titleId="register-meal-title" />
      <form className="meal-form" onSubmit={form.handleSubmit(submit)}>
        <div className="form-field"><label htmlFor="meal-profile">Adulto</label><select id="meal-profile" {...form.register('profileId')}><option value="">Selecciona un adulto</option>{profiles.profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}</select>{form.formState.errors.profileId ? <p className="form-field__error">{form.formState.errors.profileId.message}</p> : null}</div>
        <div className="form-field"><label htmlFor="meal-type">Tipo de comida</label><select id="meal-type" {...form.register('mealType')}>{Object.entries(mealTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <div className="form-field"><label htmlFor="meal-date">Fecha y hora</label><input id="meal-date" type="datetime-local" {...form.register('consumedAt', { valueAsDate: true })} /></div>
        <div className="form-field"><label htmlFor="meal-notes">Nota (opcional)</label><textarea id="meal-notes" {...form.register('notes')} /></div>
        <div className="meal-items"><div className="meal-items__heading"><h2>Alimentos</h2><button className="button button--secondary" onClick={() => setShowSelector(true)} type="button">Agregar alimento</button></div>{items.length === 0 ? <p className="empty-state">Agrega los alimentos de esta comida.</p> : items.map((item) => <article className="meal-item" key={item.id}><div><strong>{item.food.name}</strong><span>{item.quantity} {item.unit === 'SERVING' ? 'porción(es)' : item.unit.toLowerCase()}</span><small>{formatItemPreview(item)}</small></div><label>Cantidad<input aria-label={`Cantidad de ${item.food.name}`} min="0.1" onChange={(event) => updateItemQuantity(item.id, Number(event.target.value))} step="0.1" type="number" value={item.quantity} /></label><button className="button button--secondary" onClick={() => removeItem(item.id)} type="button">Eliminar</button></article>)}</div>
        <NutritionPreview summary={summary} />
        {form.formState.errors.items ? <p className="form-field__error" role="alert">{form.formState.errors.items.message}</p> : null}
        {registerMeal.isError ? <p role="alert">No se pudo registrar la comida. Inténtalo nuevamente.</p> : null}
        <div className="meal-form__actions"><Link className="button button--secondary" to="/app">Cancelar</Link><button className="button button--primary" disabled={registerMeal.isPending || !selectedProfileId} type="submit">{registerMeal.isPending ? 'Guardando...' : 'Registrar comida'}</button></div>
      </form>
      {showSelector ? <FoodSelector onClose={() => setShowSelector(false)} onSelect={addItem} /> : null}
    </section>
  );
}

function NutritionPreview({ summary }: { summary: NutritionSummary }) {
  return <section className="nutrition-preview" aria-labelledby="nutrition-preview-title"><p className="eyebrow">Previsualización</p><h2 id="nutrition-preview-title">Estimación de esta comida</h2><p className="supporting-text">El backend confirmará los valores al guardar.</p><dl className="nutrition-value-list"><div><dt>Calorías</dt><dd>{summary.calories} kcal</dd></div><div><dt>Proteína</dt><dd>{summary.proteinGrams} g</dd></div><div><dt>Carbohidratos</dt><dd>{summary.carbohydrateGrams} g</dd></div><div><dt>Grasas</dt><dd>{summary.fatGrams} g</dd></div><div><dt>Fibra</dt><dd>{summary.fiberGrams} g</dd></div></dl></section>;
}

function toFormItem(item: MealDraftItem) { return { foodId: item.food.id, foodName: item.food.name, measurementMethod: item.measurementMethod, quantity: item.quantity, servingId: item.servingId, unit: item.unit }; }

function toPreviewItem(item: MealDraftItem) {
  const food = item.food;
  return { nutrition: { calories: food.energyKcal ?? getNutrient(food, ['ENERGY_KCAL', 'CALORIES']) ?? 0, proteinGrams: food.proteinGrams ?? getNutrient(food, ['PROTEIN']) ?? 0, carbohydrateGrams: food.carbohydrateGrams ?? getNutrient(food, ['CARBOHYDRATE', 'CARBS']) ?? 0, fatGrams: food.fatGrams ?? getNutrient(food, ['FAT']) ?? 0, fiberGrams: getNutrient(food, ['FIBER']) ?? 0 }, quantity: item.quantity, referenceQuantity: food.referenceQuantity, referenceUnit: food.referenceUnit, servingEquivalent: item.servingEquivalent, unit: item.unit } as const;
}

function formatItemPreview(item: MealDraftItem): string {
  const summary = roundNutritionSummary(
    calculateNutritionPreview([toPreviewItem(item)]),
  );
  return `${summary.calories} kcal · ${summary.proteinGrams} g de proteína`;
}

function getNutrient(
  food: MealDraftItem['food'],
  codes: string[],
): number | null {
  if (!('nutrients' in food)) return null;
  const nutrient = food.nutrients.find((item) =>
    codes.includes(item.nutrientDefinition.code),
  );
  return nutrient?.amount ?? null;
}
