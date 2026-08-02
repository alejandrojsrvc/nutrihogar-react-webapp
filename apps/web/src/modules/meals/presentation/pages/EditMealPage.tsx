import { useNavigate, useParams } from 'react-router';
import type { MealFormValues } from '@nutrihogar/schemas';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import type { FoodSummary } from '../../../food-catalog/application/ports/FoodCatalogGateway';
import type { MealDetails, MealDraftItem } from '../../application/ports/MealGateway';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { MealForm } from '../components/MealForm';
import { useMealDetails, useUpdateMeal } from '../hooks/useMeals';

export function EditMealPage() {
  const { mealId } = useParams();
  const navigate = useNavigate();
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const detail = useMealDetails(mealId);
  const updateMeal = useUpdateMeal();

  if (detail.isPending || profiles.isPending) return <p className="page-section" role="status">Cargando comida...</p>;
  if (detail.isError || !detail.data || profiles.isError) return <p className="page-section" role="alert">No se pudo cargar la comida para editar.</p>;
  if (detail.data.status !== 'CONFIRMED') return <p className="page-section" role="alert">Una comida cancelada no se puede editar.</p>;

  const meal = detail.data;
  const initialValues = toFormValues(meal);
  const initialItems = meal.items.filter((item) => item.foodId).map(toDraftItem);

  function submit(values: MealFormValues, items: MealDraftItem[]) {
    if (!mealId) return;
    updateMeal.mutate({ mealId, input: {
      consumedAt: values.consumedAt,
      items: items.map((item) => ({ foodId: item.food.id, measurementMethod: item.measurementMethod, quantity: item.quantity, servingId: item.servingId, unit: item.unit })),
      mealType: values.mealType,
      notes: values.notes,
    } }, { onSuccess: () => navigate(`/app/comidas/${mealId}`, { state: { mealUpdated: true } }) });
  }

  return <section className="page-section meal-page" aria-labelledby="edit-meal-title"><BackButton fallback={`/app/comidas/${meal.id}`} /><PageHeader eyebrow="Registro de comida" title="Edita la comida" titleId="edit-meal-title" /><MealForm cancelTo={`/app/comidas/${meal.id}`} key={meal.id} initialItems={initialItems} initialValues={initialValues} isSubmitting={updateMeal.isPending} onSubmit={submit} profiles={profiles.profiles.filter((profile) => profile.isActive !== false)} readOnlyProfile submitLabel="Guardar cambios" errorMessage={updateMeal.isError ? 'No se pudieron guardar los cambios. Inténtalo nuevamente.' : undefined} /></section>;
}

function toFormValues(meal: MealDetails): MealFormValues {
  return { consumedAt: new Date(meal.consumedAt), items: [], mealType: meal.mealType as MealFormValues['mealType'], notes: meal.notes ?? '', profileId: meal.adultProfileId ?? '' };
}

function toDraftItem(item: MealDetails['items'][number]): MealDraftItem {
  const food = { brand: item.brand, carbohydrateGrams: null, category: { displayOrder: 0, id: 'snapshot', name: 'Alimento', code: 'SNAPSHOT' }, energyKcal: item.totals.calories || null, fatGrams: item.totals.fatGrams || null, foodType: 'CUSTOM', householdId: null, id: item.foodId ?? '', name: item.foodName, preparationState: item.preparationState ?? 'NOT_APPLICABLE', proteinGrams: item.totals.proteinGrams || null, referenceQuantity: item.baseQuantity || item.quantity, referenceUnit: (item.baseUnit || item.unit || 'GRAM') as FoodSummary['referenceUnit'] } as FoodSummary;
  return { food, id: item.id, measurementMethod: item.measurementMethod as MealDraftItem['measurementMethod'], quantity: item.quantity, servingId: item.foodServingId ?? undefined, unit: item.unit as MealDraftItem['unit'] };
}
