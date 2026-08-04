import { Link, useNavigate, useParams } from 'react-router';
import type { MealFormValues } from '@nutrihogar/schemas';
import { Utensils } from 'lucide-react';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import type { FoodSummary } from '../../../food-catalog/application/ports/FoodCatalogGateway';
import type {
  MealDetails,
  MealDraftItem,
} from '../../application/ports/MealGateway';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { MealForm } from '../components/MealForm';
import { useMealDetails, useUpdateMeal } from '../hooks/useMeals';
import '../meals.css';

export function EditMealPage() {
  const { mealId } = useParams();
  const navigate = useNavigate();
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const detail = useMealDetails(mealId);
  const updateMeal = useUpdateMeal();

  if (
    households.isPending ||
    detail.isPending ||
    (Boolean(households.activeHousehold) && profiles.isPending)
  )
    return (
      <section className="page-section meal-page-state" role="status">
        <PageHeader
          icon={<Utensils size={25} />}
          title="Editar comida"
        />
        <p>Cargando comida...</p>
      </section>
    );
  if (
    households.isError ||
    !households.activeHousehold ||
    detail.isError ||
    !detail.data ||
    profiles.isError
  )
    return (
      <section className="page-section meal-page-state" role="alert">
        <h1>No pudimos abrir la edición</h1>
        <p>La comida se conserva sin cambios.</p>
        <button
          className="button button--secondary"
          onClick={() => {
            void detail.refetch();
            void households.refetch();
            void profiles.refetch();
          }}
          type="button"
        >
          Reintentar
        </button>
      </section>
    );
  if (detail.data.status !== 'CONFIRMED')
    return (
      <MealEditUnavailable
        mealId={detail.data.id}
        reason="Las comidas canceladas se conservan como historial y no pueden modificarse."
      />
    );

  const meal = detail.data;
  if (meal.items.some((item) => item.foodId === null)) {
    return (
      <MealEditUnavailable
        mealId={meal.id}
        reason="Uno o más alimentos existen solo como una captura histórica. La edición está desactivada para no descartarlos ni sustituir sus valores confirmados."
      />
    );
  }
  const initialValues = toFormValues(meal);
  const initialItems = meal.items.map(toDraftItem);

  function submit(values: MealFormValues, items: MealDraftItem[]) {
    if (!mealId) return;
    updateMeal.mutate(
      {
        mealId,
        input: {
          consumedAt: values.consumedAt,
          items: items.map((item) => ({
            foodId: item.food.id,
            measurementMethod: item.measurementMethod,
            quantity: item.quantity,
            servingId: item.servingId,
            unit: item.unit,
          })),
          mealType: values.mealType,
          notes: values.notes,
        },
      },
      {
        onSuccess: () =>
          navigate(`/app/comidas/${mealId}`, { state: { mealUpdated: true } }),
      },
    );
  }

  return (
    <section
      className="page-section meal-page"
      aria-labelledby="edit-meal-title"
    >
      <BackButton fallback={`/app/comidas/${meal.id}`} />
      <PageHeader
        description="Ajusta los datos y revisa los alimentos antes de guardar."
        icon={<Utensils size={25} />}
        title="Editar comida"
        titleId="edit-meal-title"
      />
      <MealForm
        cancelTo={`/app/comidas/${meal.id}`}
        key={meal.id}
        initialItems={initialItems}
        initialValues={initialValues}
        isSubmitting={updateMeal.isPending}
        onSubmit={submit}
        profiles={profiles.profiles.filter(
          (profile) =>
            profile.isActive !== false || profile.id === meal.adultProfileId,
        )}
        readOnlyProfile
        submitLabel="Guardar cambios"
        errorMessage={
          updateMeal.isError
            ? 'No se pudieron guardar los cambios. Inténtalo nuevamente.'
            : undefined
        }
      />
    </section>
  );
}

function toFormValues(meal: MealDetails): MealFormValues {
  return {
    consumedAt: new Date(meal.consumedAt),
    items: [],
    mealType: meal.mealType as MealFormValues['mealType'],
    notes: meal.notes ?? '',
    profileId: meal.adultProfileId ?? '',
  };
}

function toDraftItem(item: MealDetails['items'][number]): MealDraftItem {
  const food = {
    brand: item.brand,
    carbohydrateGrams: item.totals.carbohydrateGrams ?? null,
    category: {
      displayOrder: 0,
      id: 'snapshot',
      name: 'Alimento',
      code: 'SNAPSHOT',
    },
    energyKcal: item.totals.calories ?? null,
    fatGrams: item.totals.fatGrams ?? null,
    foodType: 'CUSTOM',
    householdId: null,
    id: item.foodId ?? '',
    name: item.foodName,
    preparationState: item.preparationState ?? 'NOT_APPLICABLE',
    proteinGrams: item.totals.proteinGrams ?? null,
    referenceQuantity: item.baseQuantity ?? item.quantity,
    referenceUnit: (item.baseUnit ||
      item.unit ||
      'GRAM') as FoodSummary['referenceUnit'],
  } as FoodSummary;
  return {
    food,
    id: item.id,
    measurementMethod:
      item.measurementMethod as MealDraftItem['measurementMethod'],
    quantity: item.quantity,
    servingId: item.foodServingId ?? undefined,
    unit: item.unit as MealDraftItem['unit'],
  };
}

function MealEditUnavailable({
  mealId,
  reason,
}: {
  mealId: string;
  reason: string;
}) {
  return (
    <section
      className="page-section meal-page-state"
      aria-labelledby="meal-edit-unavailable-title"
    >
      <BackButton fallback={`/app/comidas/${mealId}`} />
      <PageHeader
        icon={<Utensils size={25} />}
        title="Edición no disponible"
        titleId="meal-edit-unavailable-title"
      />
      <p className="meal-disabled-reason" role="status">
        {reason}
      </p>
      <Link className="button button--primary" to={`/app/comidas/${mealId}`}>
        Volver al detalle
      </Link>
    </section>
  );
}
