import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { useDuplicateMeal, useMealDetails } from '../hooks/useMeals';

const mealTypeLabels: Record<string, string> = {
  BREAKFAST: 'Desayuno',
  DINNER: 'Cena',
  EXTRA: 'Extra',
  LUNCH: 'Almuerzo',
  SNACK: 'Merienda',
};

export function DuplicateMealPage() {
  const { mealId } = useParams();
  const navigate = useNavigate();
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const detail = useMealDetails(mealId);
  const duplicateMeal = useDuplicateMeal();
  const [profileId, setProfileId] = useState('');
  const [mealType, setMealType] = useState('');
  const [consumedAt, setConsumedAt] = useState('');

  if (detail.isPending || profiles.isPending)
    return (
      <p className="page-section" role="status">
        Cargando comida...
      </p>
    );
  if (detail.isError || !detail.data || profiles.isError)
    return (
      <p className="page-section" role="alert">
        No se pudo cargar la comida para repetir.
      </p>
    );
  const meal = detail.data;
  const activeProfiles = profiles.profiles.filter(
    (profile) => profile.isActive !== false,
  );
  const selectedProfileId =
    profileId || meal.adultProfileId || activeProfiles[0]?.id || '';
  const selectedMealType = mealType || meal.mealType;
  const selectedDateTime = consumedAt || toDateTimeLocal(new Date());

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mealId || !selectedProfileId || !selectedDateTime) return;
    duplicateMeal.mutate(
      {
        mealId,
        input: {
          adultProfileId: selectedProfileId,
          consumedAt: new Date(selectedDateTime),
          mealType: selectedMealType,
        },
      },
      {
        onSuccess: (newMeal) =>
          navigate(`/app/comidas/${newMeal.id}`, {
            state: { mealDuplicated: true },
          }),
      },
    );
  }

  return (
    <section
      className="page-section meal-page"
      aria-labelledby="duplicate-meal-title"
    >
      <BackButton fallback={`/app/comidas/${meal.id}`} />
      <PageHeader
        eyebrow="Registro de comida"
        title="Repetir comida"
        titleId="duplicate-meal-title"
        description="Revisa el destino. Los alimentos confirmados se copiarán sin modificar la comida original."
      />
      <form className="meal-form" onSubmit={submit}>
        <div className="form-field">
          <label htmlFor="duplicate-profile">Adulto</label>
          <select
            id="duplicate-profile"
            onChange={(event) => setProfileId(event.target.value)}
            value={selectedProfileId}
          >
            {activeProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="duplicate-type">Tipo de comida</label>
          <select
            id="duplicate-type"
            onChange={(event) => setMealType(event.target.value)}
            value={selectedMealType}
          >
            {Object.entries(mealTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="duplicate-date">Fecha y hora</label>
          <input
            id="duplicate-date"
            onChange={(event) => setConsumedAt(event.target.value)}
            type="datetime-local"
            value={selectedDateTime}
          />
        </div>
        <section className="meal-items" aria-labelledby="duplicate-items-title">
          <h2 id="duplicate-items-title">Alimentos que se copiarán</h2>
          <ul>
            {meal.items.map((item) => (
              <li key={item.id}>
                <strong>{item.foodName}</strong>
                <span>
                  {item.quantity} {item.unit.toLowerCase()}
                </span>
              </li>
            ))}
          </ul>
        </section>
        {duplicateMeal.isError ? (
          <p role="alert">
            No se pudo repetir la comida. Puede que uno de sus alimentos ya no
            esté disponible.
          </p>
        ) : null}
        <div className="meal-form__actions">
          <Link
            className="button button--secondary"
            to={`/app/comidas/${meal.id}`}
          >
            Cancelar
          </Link>
          <button
            className="button button--primary"
            disabled={duplicateMeal.isPending || !selectedProfileId}
            type="submit"
          >
            {duplicateMeal.isPending ? 'Repitiendo...' : 'Confirmar repetición'}
          </button>
        </div>
      </form>
    </section>
  );
}

function toDateTimeLocal(value: Date) {
  const pad = (number: number) => String(number).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}
