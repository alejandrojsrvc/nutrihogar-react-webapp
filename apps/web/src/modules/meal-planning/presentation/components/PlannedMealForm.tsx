import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import {
  plannedMealFormSchema,
  type PlannedMealFormValues,
} from '@nutrihogar/schemas';
import type { PlannedMeal, WeeklyPlan } from '../../domain/MealPlanning';
import { weekDates } from '../../domain/week';
import { RecipePicker } from './RecipePicker';

const labels = {
  BREAKFAST: 'Desayuno',
  LUNCH: 'Comida',
  DINNER: 'Cena',
  SNACK: 'Colación',
};
type PlannedMealFormInput = z.input<typeof plannedMealFormSchema>;
export function PlannedMealForm({
  plan,
  meal,
  householdId,
  initialDate,
  initialType,
  saving,
  error,
  onSubmit,
  onCancel,
}: {
  plan: WeeklyPlan;
  meal?: PlannedMeal;
  householdId: string;
  initialDate: string;
  initialType: PlannedMealFormValues['type'];
  saving: boolean;
  error?: string;
  onSubmit: (value: PlannedMealFormValues) => void;
  onCancel: () => void;
}) {
  const dates = weekDates(plan.weekStart);
  const form = useForm<PlannedMealFormInput, unknown, PlannedMealFormValues>({
    resolver: zodResolver(plannedMealFormSchema),
    defaultValues: {
      date: meal?.date ?? initialDate,
      type: meal?.type === 'EXTRA' ? 'SNACK' : (meal?.type ?? initialType),
      source:
        meal?.source === 'UNPLANNED' || meal?.source === 'EMPTY'
          ? 'FREE_MEAL'
          : (meal?.source ?? 'RECIPE'),
      recipeId: meal?.recipeId ?? undefined,
      previousMealId: meal?.previousMealId ?? undefined,
      nameSnapshot: meal?.name ?? '',
      notes: meal?.notes ?? '',
      position:
        meal?.position ??
        Math.max(
          -1,
          ...plan.meals
            .filter(
              (item) => item.date === initialDate && item.type === initialType,
            )
            .map((item) => item.position),
        ) + 1,
    },
  });
  const source = useWatch({ control: form.control, name: 'source' });
  const recipeId = useWatch({ control: form.control, name: 'recipeId' });
  useEffect(() => {
    if (source !== 'RECIPE') form.setValue('recipeId', undefined);
    if (source !== 'PREVIOUS_MEAL') form.setValue('previousMealId', undefined);
    if (source === 'RECIPE' || source === 'PREVIOUS_MEAL')
      form.setValue('nameSnapshot', '');
  }, [source, form]);
  const errors = form.formState.errors;
  const previousMeals = plan.meals.filter(
    (item) => item.id !== meal?.id && item.source !== 'EMPTY',
  );
  return (
    <form className="meal-planning-form" onSubmit={form.handleSubmit(onSubmit)}>
      <fieldset className="meal-planning-form__group">
        <legend>Cuándo</legend>
        <div className="meal-planning-form__field-grid">
          <div className="form-field">
            <label htmlFor="planned-date">Fecha</label>
            <select
              aria-invalid={Boolean(errors.date)}
              id="planned-date"
              {...form.register('date')}
            >
              {dates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
            {errors.date ? (
              <span className="form-field__error">{errors.date.message}</span>
            ) : null}
          </div>
          <div className="form-field">
            <label htmlFor="planned-type">Momento</label>
            <select id="planned-type" {...form.register('type')}>
              {Object.entries(labels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>
      <fieldset className="meal-planning-form__group">
        <legend>Qué van a comer</legend>
        <div className="form-field">
          <label htmlFor="planned-source">Origen</label>
          <select id="planned-source" {...form.register('source')}>
            <option value="RECIPE">Receta</option>
            <option value="PREVIOUS_MEAL">Comida anterior</option>
            <option value="FREE_MEAL">Comida libre</option>
            <option value="RESTAURANT">Restaurante</option>
            <option value="DELIVERY">Delivery</option>
          </select>
        </div>
        {source === 'RECIPE' ? (
          <RecipePicker
            householdId={householdId}
            value={recipeId}
            onChange={(id) =>
              form.setValue('recipeId', id, { shouldValidate: true })
            }
            error={errors.recipeId?.message}
          />
        ) : null}
        {source === 'PREVIOUS_MEAL' ? (
          <div className="form-field">
            <label htmlFor="previous-meal">Comida anterior</label>
            <select
              aria-invalid={Boolean(errors.previousMealId)}
              id="previous-meal"
              {...form.register('previousMealId')}
            >
              <option value="">Selecciona una comida</option>
              {previousMeals.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.date} · {item.name ?? item.source}
                </option>
              ))}
            </select>
            {errors.previousMealId ? (
              <span className="form-field__error">
                {errors.previousMealId.message}
              </span>
            ) : null}
          </div>
        ) : null}
        {['FREE_MEAL', 'RESTAURANT', 'DELIVERY'].includes(source) ? (
          <div className="form-field">
            <label htmlFor="meal-name">Descripción</label>
            <input
              aria-invalid={Boolean(errors.nameSnapshot)}
              id="meal-name"
              {...form.register('nameSnapshot')}
              placeholder="Ej. Sopa de verduras"
            />
            {errors.nameSnapshot ? (
              <span className="form-field__error">
                {errors.nameSnapshot.message}
              </span>
            ) : null}
          </div>
        ) : null}
      </fieldset>
      <fieldset className="meal-planning-form__group">
        <legend>Detalles</legend>
        <div className="form-field">
          <label htmlFor="meal-notes">Notas opcionales</label>
          <textarea id="meal-notes" {...form.register('notes')} />
        </div>
        <div className="form-field meal-planning-form__position">
          <label htmlFor="meal-position">Orden en este momento del día</label>
          <input
            id="meal-position"
            type="number"
            min="0"
            {...form.register('position')}
          />
        </div>
      </fieldset>
      {error ? (
        <p role="alert" className="auth-error">
          {error}
        </p>
      ) : null}
      <div className="form-actions meal-planning-form__actions">
        <button
          className="button button--secondary"
          disabled={saving}
          onClick={onCancel}
          type="button"
        >
          Cancelar
        </button>
        <button
          className="button button--primary"
          disabled={saving}
          type="submit"
        >
          {saving ? 'Guardando...' : 'Guardar comida'}
        </button>
      </div>
    </form>
  );
}
