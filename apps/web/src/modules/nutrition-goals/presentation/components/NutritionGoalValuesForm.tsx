import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';

import { nutritionGoalValuesSchema, type NutritionGoalValues } from '@nutrihogar/schemas';
import { useConfirmNutritionGoalSuggestion } from '../hooks/useNutritionGoals';
import type { NutritionGoalSuggestion } from '../../application/ports/NutritionGoalGateway';

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
  const form = useForm<NutritionGoalValues>({
    defaultValues: values,
    resolver: zodResolver(nutritionGoalValuesSchema),
  });

  if (readOnly) {
    return <NutritionValuesList values={values} />;
  }

  return (
    <form
      className="nutrition-goal-form"
      onSubmit={form.handleSubmit((nextValues) => {
        if (!suggestion || !profileId) return;
        confirm.mutate(
          { profileId, suggestionId: suggestion.id, values: nextValues },
          { onSuccess: () => navigate(`/app/perfiles/${profileId}/meta`) },
        );
      })}
    >
      {suggestion ? (
        <dl className="nutrition-calculation">
          <div><dt>Metabolismo basal</dt><dd>{suggestion.calculation.bmr} kcal</dd></div>
          <div><dt>Gasto estimado</dt><dd>{suggestion.calculation.tdee} kcal</dd></div>
          {suggestion.calculation.deficit != null ? <div><dt>Déficit propuesto</dt><dd>{suggestion.calculation.deficit} kcal</dd></div> : null}
        </dl>
      ) : null}
      <p className="supporting-text">Los valores son una estimación y no sustituyen la orientación de un profesional.</p>
      <NutritionValueInput name="dailyCalories" label="Calorías diarias" unit="kcal" register={form.register} error={form.formState.errors.dailyCalories?.message} />
      <NutritionValueInput name="proteinGrams" label="Proteína" unit="g" register={form.register} error={form.formState.errors.proteinGrams?.message} />
      <NutritionValueInput name="carbohydrateGrams" label="Carbohidratos" unit="g" register={form.register} error={form.formState.errors.carbohydrateGrams?.message} />
      <NutritionValueInput name="fatGrams" label="Grasas" unit="g" register={form.register} error={form.formState.errors.fatGrams?.message} />
      <NutritionValueInput name="fiberGrams" label="Fibra" unit="g" register={form.register} error={form.formState.errors.fiberGrams?.message} />
      <button className="button button--primary" disabled={confirm.isPending} type="submit">{confirm.isPending ? 'Guardando...' : 'Confirmar meta'}</button>
      {confirm.isError ? <p role="alert">No se pudo confirmar la meta.</p> : null}
    </form>
  );
}

function NutritionValueInput({ name, label, unit, register, error }: { name: keyof NutritionGoalValues; label: string; unit: string; register: ReturnType<typeof useForm<NutritionGoalValues>>['register']; error?: string }) {
  return (
    <div className="form-field">
      <label htmlFor={`goal-${name}`}>{label} ({unit})</label>
      <input id={`goal-${name}`} inputMode="decimal" min="0.1" step="0.1" type="number" {...register(name)} aria-invalid={error ? 'true' : 'false'} />
      {error ? <p className="form-field__error">{error}</p> : null}
    </div>
  );
}

function NutritionValuesList({ values }: { values: NutritionGoalValues }) {
  return (
    <dl className="nutrition-value-list">
      <div><dt>Calorías</dt><dd>{values.dailyCalories} kcal</dd></div>
      <div><dt>Proteína</dt><dd>{values.proteinGrams} g</dd></div>
      <div><dt>Carbohidratos</dt><dd>{values.carbohydrateGrams} g</dd></div>
      <div><dt>Grasas</dt><dd>{values.fatGrams} g</dd></div>
      <div><dt>Fibra</dt><dd>{values.fiberGrams} g</dd></div>
    </dl>
  );
}
