import { useForm, type UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router';
import { Save } from 'lucide-react';

import {
  nutritionGoalValuesSchema,
  type NutritionGoalValues,
} from '@nutrihogar/schemas';
import { useConfirmNutritionGoalSuggestion } from '../hooks/useNutritionGoals';
import type { NutritionGoalSuggestion } from '../../application/ports/NutritionGoalGateway';

type NutritionGoalFormInput = z.input<typeof nutritionGoalValuesSchema>;

export function NutritionGoalValuesForm({
  values,
  suggestion,
  profileId,
  readOnly = false,
}: {
  values: NutritionGoalValues;
  suggestion?: NutritionGoalSuggestion;
  profileId?: string;
  readOnly?: boolean;
}) {
  const navigate = useNavigate();
  const confirm = useConfirmNutritionGoalSuggestion();
  const form = useForm<NutritionGoalFormInput, unknown, NutritionGoalValues>({
    defaultValues: values,
    resolver: zodResolver(nutritionGoalValuesSchema),
  });

  if (readOnly) {
    return <NutritionValuesList values={values} />;
  }

  return (
    <form
      className="nutrition-goal-form"
      noValidate
      onSubmit={form.handleSubmit((nextValues) => {
        if (!suggestion || !profileId) return;
        confirm.mutate(
          { profileId, suggestionId: suggestion.id, values: nextValues },
          { onSuccess: () => navigate(`/app/perfiles/${profileId}/meta`) },
        );
      })}
    >
      {suggestion ? (
        <section
          className="nutrition-calculation-section"
          aria-labelledby="nutrition-calculation-title"
        >
          <h2 id="nutrition-calculation-title">Cómo se estimó</h2>
          <dl className="nutrition-calculation">
            <div>
              <dt>Metabolismo basal</dt>
              <dd>{formatValue(suggestion.calculation.bmr)} kcal</dd>
            </div>
            <div>
              <dt>Gasto estimado</dt>
              <dd>{formatValue(suggestion.calculation.tdee)} kcal</dd>
            </div>
            {suggestion.calculation.deficit != null ? (
              <div>
                <dt>Ajuste propuesto</dt>
                <dd>{formatValue(suggestion.calculation.deficit)} kcal</dd>
              </div>
            ) : null}
          </dl>
        </section>
      ) : null}
      <fieldset className="nutrition-goal-fields">
        <legend>Referencia diaria</legend>
        <p className="supporting-text">
          Ajusta los valores si lo necesitas. La propuesta solo se guarda al
          confirmar.
        </p>
        <div className="nutrition-goal-field-grid">
          <NutritionValueInput
            name="dailyCalories"
            label="Calorías diarias"
            unit="kcal"
            register={form.register}
            error={form.formState.errors.dailyCalories?.message}
          />
          <NutritionValueInput
            name="proteinGrams"
            label="Proteína"
            unit="g"
            register={form.register}
            error={form.formState.errors.proteinGrams?.message}
          />
          <NutritionValueInput
            name="carbohydrateGrams"
            label="Carbohidratos"
            unit="g"
            register={form.register}
            error={form.formState.errors.carbohydrateGrams?.message}
          />
          <NutritionValueInput
            name="fatGrams"
            label="Grasas"
            unit="g"
            register={form.register}
            error={form.formState.errors.fatGrams?.message}
          />
          <NutritionValueInput
            name="fiberGrams"
            label="Fibra"
            unit="g"
            register={form.register}
            error={form.formState.errors.fiberGrams?.message}
          />
        </div>
      </fieldset>
      {confirm.isError ? (
        <p className="nutrition-goal-error" role="alert">
          No se pudo confirmar la meta. Tus ajustes siguen en el formulario.
        </p>
      ) : null}
      <div className="nutrition-goal-actions">
        <button
          className="button button--primary"
          disabled={confirm.isPending}
          type="submit"
        >
          {!confirm.isPending ? <Save aria-hidden="true" size={18} /> : null}
          {confirm.isPending ? 'Guardando...' : 'Confirmar meta'}
        </button>
      </div>
    </form>
  );
}

function NutritionValueInput({
  name,
  label,
  unit,
  register,
  error,
}: {
  name: keyof NutritionGoalValues;
  label: string;
  unit: string;
  register: UseFormRegister<NutritionGoalFormInput>;
  error?: string;
}) {
  return (
    <div className="form-field">
      <label htmlFor={`goal-${name}`}>
        {label} ({unit})
      </label>
      <input
        aria-describedby={error ? `goal-${name}-error` : undefined}
        aria-invalid={error ? 'true' : 'false'}
        id={`goal-${name}`}
        inputMode="decimal"
        min="0.1"
        step="0.1"
        type="number"
        {...register(name)}
      />
      {error ? (
        <p className="form-field__error" id={`goal-${name}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function NutritionValuesList({ values }: { values: NutritionGoalValues }) {
  return (
    <dl className="nutrition-value-list nutrition-goal-values">
      <div>
        <dt>Calorías</dt>
        <dd>{formatValue(values.dailyCalories)} kcal</dd>
      </div>
      <div>
        <dt>Proteína</dt>
        <dd>{formatValue(values.proteinGrams)} g</dd>
      </div>
      <div>
        <dt>Carbohidratos</dt>
        <dd>{formatValue(values.carbohydrateGrams)} g</dd>
      </div>
      <div>
        <dt>Grasas</dt>
        <dd>{formatValue(values.fatGrams)} g</dd>
      </div>
      <div>
        <dt>Fibra</dt>
        <dd>{formatValue(values.fiberGrams)} g</dd>
      </div>
    </dl>
  );
}

function formatValue(value: number) {
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(
    value,
  );
}
