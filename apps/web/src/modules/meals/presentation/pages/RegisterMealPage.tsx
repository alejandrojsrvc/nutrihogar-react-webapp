import { useLocation, useNavigate } from 'react-router';
import type { MealFormValues } from '@nutrihogar/schemas';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import type { MealDraftItem } from '../../application/ports/MealGateway';
import { useRegisterMeal } from '../hooks/useMeals';
import { MealForm } from '../components/MealForm';
import { useLinkConsumption } from '../../../meal-planning/presentation/hooks/useMealPlanning';
import { useActiveProfile } from '../../../../shared/presentation/providers/ActiveProfileContext';
import '../meals.css';

const mealTypes = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER', 'EXTRA'] as const;

export function RegisterMealPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const { activeProfileId } = useActiveProfile();
  const registerMeal = useRegisterMeal();
  const linkConsumption = useLinkConsumption();
  const params = new URLSearchParams(location.search);
  const activeProfiles = profiles.profiles.filter(
    (profile) => profile.isActive !== false,
  );
  const mealType = mealTypes.includes(
    params.get('mealType') as (typeof mealTypes)[number],
  )
    ? (params.get('mealType') as MealFormValues['mealType'])
    : 'LUNCH';
  const initialValues: MealFormValues = {
    consumedAt: params.get('date')
      ? new Date(`${params.get('date')}T12:00:00`)
      : new Date(),
    items: [],
    mealType,
    notes: '',
    profileId:
      params.get('profileId') ||
      activeProfileId ||
      (activeProfiles.length === 1 ? (activeProfiles[0]?.id ?? '') : ''),
  };

  function submit(values: MealFormValues, items: MealDraftItem[]) {
    const householdId = households.activeHousehold?.id;
    if (!householdId) return;
    registerMeal.mutate(
      {
        consumedAt: values.consumedAt,
        householdId,
        items: items.map((item) => ({
          foodId: item.food.id,
          measurementMethod: item.measurementMethod,
          quantity: item.quantity,
          servingId: item.servingId,
          unit: item.unit,
        })),
        mealType: values.mealType,
        notes: values.notes,
        profileId: values.profileId,
      },
      {
        onSuccess: (meal) => {
          const plannedMealId = params.get('plannedMealId');
          if (plannedMealId)
            linkConsumption.mutate(
              { consumedMealId: meal.id, plannedMealId },
              {
                onSuccess: () =>
                  navigate(
                    `/app/resumen/${values.consumedAt.toISOString().slice(0, 10)}`,
                    { state: { mealSaved: true } },
                  ),
              },
            );
          else
            navigate(
              `/app/resumen/${values.consumedAt.toISOString().slice(0, 10)}`,
              { state: { mealSaved: true } },
            );
        },
      },
    );
  }

  if (profiles.isPending)
    return (
      <p className="page-section" role="status">
        Cargando integrantes...
      </p>
    );
  if (!households.activeHousehold)
    return (
      <p className="page-section" role="alert">
        Selecciona un hogar antes de registrar una comida.
      </p>
    );
  if (profiles.isError)
    return (
      <p className="page-section" role="alert">
        No se pudieron cargar los integrantes.
      </p>
    );

  return (
    <section
      className="page-section meal-page"
      aria-labelledby="register-meal-title"
    >
      <BackButton fallback="/app" />
      {params.get('plannedMealId') ? (
        <p className="supporting-text">
          Al registrar, esta comida se vinculará al plan semanal.
        </p>
      ) : null}
      <MealForm
        consumerLayout
        initialValues={initialValues}
        isSubmitting={registerMeal.isPending || linkConsumption.isPending}
        onSubmit={submit}
        profiles={activeProfiles}
        submitLabel="Registrar comida"
        errorMessage={
          registerMeal.isError || linkConsumption.isError
            ? 'No se pudo registrar o vincular la comida. Inténtalo nuevamente.'
            : undefined
        }
      />
    </section>
  );
}
