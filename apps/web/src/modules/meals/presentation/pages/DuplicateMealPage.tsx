import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Repeat2 } from 'lucide-react';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { useActiveProfile } from '../../../../shared/presentation/providers/ActiveProfileContext';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { useDuplicateMeal, useMealDetails } from '../hooks/useMeals';
import '../meals.css';

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
  const { activeProfileId } = useActiveProfile();
  const [profileId, setProfileId] = useState('');
  const [mealType, setMealType] = useState('');
  const [consumedAt, setConsumedAt] = useState(() =>
    toDateTimeLocal(new Date()),
  );

  if (
    households.isPending ||
    detail.isPending ||
    (Boolean(households.activeHousehold) && profiles.isPending)
  )
    return (
      <section className="page-section meal-page-state" role="status">
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
      <section
        className="page-section meal-page-state"
        aria-labelledby="duplicate-meal-error-title"
        role="alert"
      >
        <p>La comida original se conserva sin cambios.</p>
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
  const meal = detail.data;
  const activeProfiles = profiles.profiles.filter(
    (profile) => profile.isActive !== false,
  );
  const contextualProfileId = activeProfiles.some(
    (profile) => profile.id === activeProfileId,
  )
    ? activeProfileId
    : '';
  const originalProfileId = activeProfiles.some(
    (profile) => profile.id === meal.adultProfileId,
  )
    ? (meal.adultProfileId ?? '')
    : '';
  const selectedProfileId =
    profileId ||
    contextualProfileId ||
    originalProfileId ||
    activeProfiles[0]?.id ||
    '';
  const selectedMealType = mealType || meal.mealType;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mealId || !selectedProfileId || !consumedAt) return;
    duplicateMeal.mutate(
      {
        mealId,
        input: {
          adultProfileId: selectedProfileId,
          consumedAt: new Date(consumedAt),
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
      <form className="meal-form meal-duplicate-form" onSubmit={submit}>
        <fieldset className="meal-form-section">
          <legend>Destino del registro</legend>
          <p className="supporting-text">La comida original no se modifica.</p>
          <div className="meal-form-grid">
            <div className="form-field">
              <label htmlFor="duplicate-profile">Integrante</label>
              <select
                disabled={activeProfiles.length === 0}
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
                value={consumedAt}
              />
            </div>
          </div>
        </fieldset>
        <section className="meal-items" aria-labelledby="duplicate-items-title">
          <h2 id="duplicate-items-title">Alimentos que se copiarán</h2>
          {meal.items.length === 0 ? (
            <p className="empty-copy">
              Esta comida no contiene alimentos para copiar.
            </p>
          ) : (
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
          )}
        </section>
        {duplicateMeal.isError ? (
          <p className="meal-form__error" role="alert">
            No se pudo repetir la comida. Puede que uno de sus alimentos ya no
            esté disponible.
          </p>
        ) : null}
        {!selectedProfileId ? (
          <p className="meal-disabled-reason" role="status">
            Activa un perfil adulto para elegir quién registrará esta comida.
          </p>
        ) : null}
        <div className="meal-form__actions meal-form__actions--sticky">
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
            {!duplicateMeal.isPending ? (
              <Repeat2 aria-hidden="true" size={18} />
            ) : null}
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
