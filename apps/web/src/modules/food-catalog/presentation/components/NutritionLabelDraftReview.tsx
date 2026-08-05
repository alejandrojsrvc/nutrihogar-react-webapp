import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useFieldArray, useForm, type SubmitHandler } from 'react-hook-form';

import type {
  FoodCategory,
  NutrientDefinition,
} from '../../application/ports/FoodCatalogGateway';
import type {
  NutritionLabelConfirmInput,
  NutritionLabelDraft,
} from '../../application/ports/NutritionLabelDraftGateway';
import { useConfirmNutritionLabelDraft } from '../hooks/useFoodCatalog';
import {
  nutritionLabelReviewSchema,
  type NutritionLabelReviewValues,
} from '../schemas/nutritionLabelDraftSchemas';
import { preparationStateLabels } from '../utils/foodLabels';
import { ActionBar } from '../../../../shared/presentation/components/ActionBar';
import { Badge } from '../../../../shared/presentation/components/Badge';
import { FormField } from '../../../../shared/presentation/components/FormField';
import '../food-catalog.css';

const packageUnitOptions = [
  ['GRAM', 'Gramos (g)'],
  ['MILLILITER', 'Mililitros (ml)'],
] as const;

const nutrientCodeByExtractedKey: Record<string, string> = {
  carbohydrates_g: 'CARBOHYDRATE',
  energy_kcal: 'ENERGY_KCAL',
  fiber_g: 'FIBER',
  protein_g: 'PROTEIN',
  saturated_fat_g: 'SATURATED_FAT',
  sodium_mg: 'SODIUM',
  sugars_g: 'SUGARS',
  total_fat_g: 'FAT',
  trans_fat_g: 'TRANS_FAT',
};

export function NutritionLabelDraftReview({
  categories,
  draft,
  foodId,
  nutrients,
  onCancel,
  onConfirmed,
}: {
  categories: FoodCategory[];
  draft: NutritionLabelDraft;
  foodId?: string;
  nutrients: NutrientDefinition[];
  onCancel: () => void;
  onConfirmed: (foodId: string) => void;
}) {
  const confirm = useConfirmNutritionLabelDraft();
  const defaultValues = useMemo(
    () => toReviewValues(draft, nutrients),
    [draft, nutrients],
  );
  const {
    control,
    formState: { errors, isValid },
    handleSubmit,
    register,
    reset,
  } = useForm<NutritionLabelReviewValues>({
    defaultValues,
    mode: 'onChange',
    resolver: zodResolver(nutritionLabelReviewSchema),
  });
  const nutrientFields = useFieldArray({ control, name: 'nutrients' });
  const requiredNutrientCodes = nutrients
    .filter((nutrient) => nutrient.isRequired)
    .map((nutrient) => nutrient.code);
  const hasMissingRequiredNutrients = requiredNutrientCodes.some(
    (code) =>
      !nutrientFields.fields.some(
        (field) => field.code === code && field.amount.trim(),
      ),
  );
  const servingIsMilliliters =
    defaultValues.serving.equivalentMilliliters.trim().length > 0;
  const detectedName =
    draft.extractedData.product_name ?? draft.name ?? '';
  const detectedBrand = draft.extractedData.brand ?? draft.brand ?? '';
  const lowConfidence =
    draft.confidence !== null && draft.confidence < 0.6;
  const requiresReview = Boolean(draft.extractedData.requires_review);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit: SubmitHandler<NutritionLabelReviewValues> = async (values) => {
    const input: NutritionLabelConfirmInput = {
      basisQuantity: values.basisQuantity.trim(),
      basisUnit: values.basisUnit,
      brand: values.brand.trim(),
      categoryId: values.categoryId,
      description: values.description.trim(),
      expiresAt: values.expiresAt
        ? new Date(values.expiresAt).toISOString()
        : undefined,
      location: values.location.trim() || undefined,
      minimumQuantity: values.minimumQuantity.trim() || undefined,
      name: values.name.trim(),
      nutrients: values.nutrients
        .filter((nutrient) => nutrient.amount.trim())
        .map((nutrient) => ({
          amount: nutrient.amount.trim(),
          code: nutrient.code.trim(),
        })),
      packageQuantity: values.packageQuantity.trim(),
      packageUnit: values.packageUnit,
      preparationState: values.preparationState,
      serving: {
        equivalentGrams: values.serving.equivalentGrams.trim() || undefined,
        equivalentMilliliters:
          values.serving.equivalentMilliliters.trim() || undefined,
        name: values.serving.name.trim(),
        quantity: '1',
        unit: 'porción',
      },
      targetFoodId: foodId,
    };

    try {
      const result = await confirm.mutateAsync({
        draftId: draft.id,
        householdId: draft.householdId,
        input,
      });
      onConfirmed(result.food.id);
    } catch {
      // El error de confirmacion se muestra debajo del formulario.
    }
  };

  return (
    <section
      className="nutrition-label-review"
      aria-labelledby="nutrition-label-review-title"
    >
      <p className="nutrition-label-review__step">Paso 2 de 2 · Revisar etiqueta</p>
      <div className="nutrition-label-review__status" role="status">
        <strong id="nutrition-label-review-title">Revisión pendiente</strong>
        <span>Comprobá que los datos coincidan con el envase antes de guardar.</span>
      </div>

      {requiresReview || lowConfidence ? (
        <ReviewNotice
          items={[
            'Compará cada valor con la etiqueta antes de guardar.',
            ...(requiresReview
              ? ['La etiqueta no se pudo leer por completo.']
              : []),
          ]}
          title="Revisión con atención"
          tone="warning"
        />
      ) : null}
      {draft.warnings.length || draft.extractedData.warnings.length ? (
        <ReviewNotice
          items={uniqueStrings([
            ...draft.warnings,
            ...draft.extractedData.warnings,
          ])}
          title="Advertencias de la etiqueta"
          tone="warning"
        />
      ) : null}
      {draft.missingFields.length ? (
        <ReviewNotice
          items={draft.missingFields}
          title="Campos que necesitan revisión"
          tone="info"
        />
      ) : null}

      <form
        className="custom-food-form nutrition-label-review__form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <fieldset className="food-form-section food-form-section--general">
          <legend>Datos del alimento</legend>
          <div className="food-form-grid">
            <FormField
              error={errors.name?.message}
              help={detectedName ? 'Leído de la etiqueta.' : undefined}
              label="Producto"
              required
            >
              <input id="nutrition-label-name" {...register('name')} />
            </FormField>
            <FormField
              error={errors.brand?.message}
              help={detectedBrand ? 'Leído de la etiqueta.' : undefined}
              label="Marca"
            >
              <input id="nutrition-label-brand" {...register('brand')} />
            </FormField>
            <FormField
              error={errors.categoryId?.message}
              help="Elegí la categoría del alimento."
              label="Categoría"
              required
            >
              <select id="nutrition-label-category" {...register('categoryId')}>
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              error={errors.preparationState?.message}
              label="Preparación"
              required
            >
              <select
                id="nutrition-label-preparation"
                {...register('preparationState')}
              >
                {Object.entries(preparationStateLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </fieldset>

        <fieldset className="food-form-section">
          <legend>Envase</legend>
          <div className="food-form-grid">
            <FormField
              error={errors.packageQuantity?.message}
              label="Cantidad del envase"
              required
            >
              <input
                id="nutrition-label-package-quantity"
                inputMode="decimal"
                min="0"
                step="any"
                type="number"
                {...register('packageQuantity')}
              />
            </FormField>
            <FormField
              error={errors.packageUnit?.message}
              label="Unidad del envase"
              required
            >
              <select
                id="nutrition-label-package-unit"
                {...register('packageUnit')}
              >
                {packageUnitOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              error={errors.basisQuantity?.message}
              help="Los nutrientes corresponden a esta cantidad."
              label="Cantidad base"
              required
            >
              <input
                id="nutrition-label-basis-quantity"
                inputMode="decimal"
                min="0"
                step="any"
                type="number"
                {...register('basisQuantity')}
              />
            </FormField>
            <FormField
              error={errors.basisUnit?.message}
              label="Unidad de la base"
              required
            >
              <select id="nutrition-label-basis-unit" {...register('basisUnit')}>
                {packageUnitOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </fieldset>

        <fieldset className="food-form-section">
          <legend>Nutrientes</legend>
          <p className="food-form-help">
            Corregí los valores si no coinciden con la etiqueta. Los obligatorios
            figuran en rojo.
          </p>
          <div className="custom-food-nutrient-list">
            {nutrientFields.fields.map((field, index) => {
              const definition = nutrients.find(
                (item) => item.code === field.code,
              );
              const isMissingRequired =
                definition?.isRequired && !field.amount.trim();
              return (
                <div
                  className={`custom-food-nutrient-row${
                    isMissingRequired ? ' is-missing' : ''
                  }`}
                  key={field.id}
                >
                  <input
                    type="hidden"
                    {...register(`nutrients.${index}.code`)}
                  />
                  <div>
                    <strong>{definition?.name ?? field.code}</strong>
                    <small>{definition?.unit ?? 'Valor detectado'}</small>
                    {isMissingRequired ? (
                      <Badge
                        className="nutrition-label-review__required-badge"
                        tone="danger"
                      >
                        Obligatorio
                      </Badge>
                    ) : null}
                  </div>
                  <FormField
                    error={errors.nutrients?.[index]?.amount?.message}
                    label="Valor"
                  >
                    <input
                      inputMode="decimal"
                      min="0"
                      step="any"
                      type="number"
                      {...register(`nutrients.${index}.amount`)}
                    />
                  </FormField>
                </div>
              );
            })}
          </div>
          {typeof errors.nutrients?.message === 'string' ? (
            <p className="form-field__error" role="alert">
              {errors.nutrients.message}
            </p>
          ) : null}
          {hasMissingRequiredNutrients ? (
            <p className="form-field__error" role="alert">
              Completá los nutrientes obligatorios antes de confirmar.
            </p>
          ) : null}
        </fieldset>

        <fieldset className="food-form-section">
          <legend>Porción de referencia</legend>
          <p className="food-form-help">
            Es la porción declarada en la etiqueta (por ejemplo, 2 rebanadas).
          </p>
          <div className="food-form-grid">
            <FormField
              error={errors.serving?.name?.message}
              label="Descripción de la porción"
              required
            >
              <input
                id="nutrition-label-serving-name"
                {...register('serving.name')}
                placeholder="Ej. 2 rebanadas"
              />
            </FormField>
            {servingIsMilliliters ? (
              <FormField
                error={errors.serving?.equivalentMilliliters?.message}
                label="Tamaño de la porción (ml)"
              >
                <input
                  id="nutrition-label-serving-milliliters"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  type="number"
                  {...register('serving.equivalentMilliliters')}
                />
              </FormField>
            ) : (
              <FormField
                error={errors.serving?.equivalentGrams?.message}
                label="Tamaño de la porción (g)"
              >
                <input
                  id="nutrition-label-serving-grams"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  type="number"
                  {...register('serving.equivalentGrams')}
                />
              </FormField>
            )}
          </div>
          {errors.serving?.equivalentGrams?.message ||
          errors.serving?.equivalentMilliliters?.message ? (
            <p className="form-field__error" role="alert">
              {errors.serving.equivalentGrams?.message ??
                errors.serving.equivalentMilliliters?.message}
            </p>
          ) : null}
        </fieldset>

        <ReviewDetails draft={draft} />

        <p className="nutrition-label-review__inventory-note">
          Al guardar, este envase se agregará a tu inventario.
        </p>

        {confirm.error ? (
          <p className="food-form-error" role="alert">
            {confirm.error instanceof Error
              ? confirm.error.message
              : 'No se pudo guardar el alimento. Tus datos se conservaron; intentá de nuevo.'}
          </p>
        ) : null}
        <ActionBar
          primary={
            <button
              className="button button--primary"
              disabled={
                !isValid || hasMissingRequiredNutrients || confirm.isPending
              }
              type="submit"
            >
              <Save aria-hidden="true" size={18} />
              {confirm.isPending
                ? 'Guardando...'
                : foodId
                  ? 'Actualizar alimento'
                  : 'Guardar alimento'}
            </button>
          }
          secondary={
            <button
              className="button button--secondary"
              onClick={onCancel}
              type="button"
            >
              Volver al formulario manual
            </button>
          }
        />
      </form>
    </section>
  );
}

function ReviewDetails({ draft }: { draft: NutritionLabelDraft }) {
  const { allergens, ingredients } = draft.extractedData;
  return (
    <div className="nutrition-label-review__details">
      <details>
        <summary>Ingredientes y alérgenos detectados</summary>
        <div className="nutrition-label-review__detail-grid">
          <div>
            <h3>Ingredientes</h3>
            {ingredients.length ? (
              <ul>
                {ingredients.map((ingredient, index) => (
                  <li key={`${ingredient}-${index}`}>{ingredient}</li>
                ))}
              </ul>
            ) : (
              <p>No se detectaron ingredientes.</p>
            )}
          </div>
          <div>
            <h3>Alérgenos</h3>
            <p>
              <strong>Contiene:</strong>{' '}
              {allergens?.contains.length
                ? allergens.contains.join(', ')
                : 'No indicado'}
            </p>
            <p>
              <strong>Puede contener:</strong>{' '}
              {allergens?.may_contain.length
                ? allergens.may_contain.join(', ')
                : 'No indicado'}
            </p>
          </div>
        </div>
      </details>
      <p className="nutrition-label-review__confidence">
        {getConfidenceText(draft.confidence)}
        {requiresReviewText(draft.extractedData.requires_review)}
      </p>
    </div>
  );
}

function ReviewNotice({
  items,
  title,
  tone,
}: {
  items: string[];
  title: string;
  tone: 'info' | 'warning';
}) {
  return (
    <div
      className={`nutrition-label-review__notice nutrition-label-review__notice--${tone}`}
      role="alert"
    >
      <strong>{title}</strong>
      <ul>
        {items.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function getConfidenceText(confidence: number | null): string {
  if (confidence === null) {
    return 'Confianza de lectura: no disponible.';
  }

  const percentage = Math.round(confidence * 100);
  if (confidence >= 0.8) {
    return `Lectura de buena calidad (${percentage}%).`;
  }
  if (confidence >= 0.6) {
    return `Lectura aceptable (${percentage}%). Revisá los valores marcados.`;
  }
  return `Lectura con dudas (${percentage}%). Verificá cada valor contra la etiqueta.`;
}

function requiresReviewText(requiresReview: boolean): string {
  return requiresReview ? ' Requiere revisión antes de guardar.' : '';
}

function toReviewValues(
  draft: NutritionLabelDraft,
  definitions: NutrientDefinition[],
): NutritionLabelReviewValues {
  const declaration = draft.extractedData.nutrition_declarations[0];
  const basis = declaration?.basis;
  const netContent = draft.extractedData.net_content;
  const servingSize = draft.extractedData.serving_size;
  const extractedNutrients = Object.entries(declaration?.nutrients ?? {})
    .map(([key, value]) => ({
      amount: value === null ? '' : String(value),
      code: nutrientCodeByExtractedKey[key] ?? key.toUpperCase(),
    }))
    .filter((nutrient) => nutrient.amount);
  const nutrientValues = new Map(
    extractedNutrients.map((nutrient) => [nutrient.code, nutrient.amount]),
  );
  const nutrients = [
    ...extractedNutrients,
    ...definitions
      .filter(
        (definition) =>
          definition.isRequired && !nutrientValues.has(definition.code),
      )
      .map((definition) => ({ amount: '', code: definition.code })),
  ];
  const servingUnit = toPackageUnit(servingSize?.unit) ?? 'GRAM';
  const servingValue = valueText(servingSize?.value);

  return {
    basisQuantity: valueText(basis?.value ?? servingSize?.value),
    basisUnit: toPackageUnit(basis?.unit ?? servingSize?.unit) ?? 'GRAM',
    brand: nonEmpty(draft.extractedData.brand) ?? nonEmpty(draft.brand) ?? '',
    categoryId: '',
    description: '',
    expiresAt: '',
    location: '',
    minimumQuantity: '',
    name:
      nonEmpty(draft.extractedData.product_name) ?? nonEmpty(draft.name) ?? '',
    nutrients,
    packageQuantity:
      valueText(netContent?.value) || nonEmpty(draft.packageQuantity) || '',
    packageUnit: toPackageUnit(netContent?.unit) ?? draft.packageUnit ?? servingUnit,
    preparationState: 'RAW',
    serving: {
      equivalentGrams: servingUnit === 'GRAM' ? servingValue : '',
      equivalentMilliliters: servingUnit === 'MILLILITER' ? servingValue : '',
      name: servingSize?.description ?? 'Porción',
    },
  };
}

function nonEmpty(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized && normalized !== 'string' ? normalized : null;
}

function toPackageUnit(unit: string | null | undefined) {
  if (unit?.toLowerCase() === 'ml' || unit?.toLowerCase() === 'milliliter') {
    return 'MILLILITER' as const;
  }
  if (unit?.toLowerCase() === 'g' || unit?.toLowerCase() === 'gram') {
    return 'GRAM' as const;
  }
  return null;
}

function valueText(value: number | string | null | undefined): string {
  return value === null || value === undefined ? '' : String(value);
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}
