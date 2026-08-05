import { zodResolver } from '@hookform/resolvers/zod';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useFieldArray, useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { Plus, Save } from 'lucide-react';

import type {
  FoodDetail,
  NutrientDefinition,
} from '../../application/ports/FoodCatalogGateway';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import {
  useCreateNutritionLabelDraft,
  useCreateCustomFood,
  useFoodCategories,
  useFoodDetail,
  useFoodNutrients,
  useNutritionLabelDraft,
  useUpdateCustomFood,
} from '../hooks/useFoodCatalog';
import { NutritionLabelDraftReview } from '../components/NutritionLabelDraftReview';
import { NutritionLabelReader } from '../components/NutritionLabelReader';
import type { NutritionLabelDraft } from '../../application/ports/NutritionLabelDraftGateway';
import '../food-catalog.css';
import {
  customFoodFormSchema,
  getDefaultCustomFoodFormValues,
  type CustomFoodFormValues,
} from '../schemas/customFoodSchemas';
import { preparationStateLabels } from '../utils/foodLabels';
import { FormField } from '../../../../shared/presentation/components/FormField';
import { ActionBar } from '../../../../shared/presentation/components/ActionBar';

const confidenceOptions = [
  ['USER_PROVIDED', 'Proporcionada por mí'],
  ['LOW', 'Baja'],
  ['MEDIUM', 'Media'],
  ['HIGH', 'Alta'],
  ['VERIFIED', 'Verificada'],
] as const;

const referenceUnitOptions = [
  ['GRAM', 'Gramos (g)'],
  ['MILLILITER', 'Mililitros (ml)'],
  ['UNIT', 'Unidad'],
] as const;

export function CustomFoodFormPage() {
  const { foodId } = useParams<{ foodId: string }>();
  const isEditing = Boolean(foodId);
  const navigate = useNavigate();
  const households = useHouseholds();
  const categories = useFoodCategories();
  const nutrients = useFoodNutrients();
  const foodDetail = useFoodDetail(foodId);
  const createFood = useCreateCustomFood();
  const updateFood = useUpdateCustomFood();
  const createNutritionLabelDraft = useCreateNutritionLabelDraft();
  const [searchParams, setSearchParams] = useSearchParams();
  const nutritionDraftId = searchParams.get('nutritionDraftId');
  const [uploadedNutritionDraft, setUploadedNutritionDraft] =
    useState<NutritionLabelDraft | null>(null);
  const [nutrientToAdd, setNutrientToAdd] = useState('');
  const hasInitializedForm = useRef(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
    getValues,
  } = useForm<CustomFoodFormValues>({
    defaultValues: getDefaultCustomFoodFormValues(),
    resolver: zodResolver(customFoodFormSchema),
  });
  const nutrientFields = useFieldArray({
    control,
    keyName: 'formId',
    name: 'nutrients',
  });
  const servingFields = useFieldArray({
    control,
    keyName: 'formId',
    name: 'servings',
  });
  const currentFood = foodDetail.data;
  const activeHousehold = households.activeHousehold;
  const nutritionDraftQuery = useNutritionLabelDraft(
    activeHousehold?.id,
    nutritionDraftId,
    uploadedNutritionDraft?.id !== nutritionDraftId,
  );
  const nutritionDraft =
    uploadedNutritionDraft?.id === nutritionDraftId
      ? uploadedNutritionDraft
      : nutritionDraftQuery.data;
  const isSaving = createFood.isPending || updateFood.isPending;
  const mutationError = createFood.error ?? updateFood.error;
  const isEditable = Boolean(
    currentFood &&
    currentFood.foodType === 'CUSTOM' &&
    !currentFood.isGlobal &&
    currentFood.householdId === activeHousehold?.id,
  );
  const nutrientDefinitions = useMemo(
    () => nutrients.data ?? [],
    [nutrients.data],
  );
  const nutrientDefinitionById = useMemo(
    () =>
      new Map(nutrientDefinitions.map((nutrient) => [nutrient.id, nutrient])),
    [nutrientDefinitions],
  );
  const activeNutrientIds = useMemo(
    () =>
      new Set(nutrientFields.fields.map((field) => field.nutrientDefinitionId)),
    [nutrientFields.fields],
  );
  const optionalNutrients = nutrientDefinitions.filter(
    (nutrient) => !nutrient.isRequired && !activeNutrientIds.has(nutrient.id),
  );

  useEffect(() => {
    if (hasInitializedForm.current || !categories.data || !nutrients.data) {
      return;
    }

    if (isEditing && !currentFood) {
      return;
    }

    reset(toFormValues(currentFood, nutrients.data));
    hasInitializedForm.current = true;
  }, [categories.data, currentFood, isEditing, nutrients.data, reset]);

  if (households.isPending || categories.isPending || nutrients.isPending) {
    return <CustomFoodStatus message="Cargando formulario de alimento..." />;
  }

  if (households.isError || categories.isError || nutrients.isError) {
    return (
      <CustomFoodStatus
        isError
        message="No se pudieron cargar los datos necesarios para el formulario."
      />
    );
  }

  if (!activeHousehold) {
    return (
      <CustomFoodStatus
        isError
        message="Primero configura o selecciona un hogar para registrar un alimento."
        action={
          <Link className="button button--secondary" to="/app">
            Ir a mis hogares
          </Link>
        }
      />
    );
  }

  if (isEditing && foodDetail.isPending) {
    return <CustomFoodStatus message="Cargando alimento..." />;
  }

  if (isEditing && (foodDetail.isError || !currentFood || !isEditable)) {
    return (
      <CustomFoodStatus
        isError
        message={
          foodDetail.isError
            ? 'No se pudo cargar el alimento.'
            : 'Este alimento no pertenece a tu hogar o no es personalizado.'
        }
        action={
          <Link className="button button--secondary" to="/app/alimentos">
            Volver al catálogo
          </Link>
        }
      />
    );
  }

  if (nutritionDraftId && nutritionDraftQuery.isPending && !nutritionDraft) {
    return <CustomFoodStatus message="Cargando borrador de etiqueta..." />;
  }

  if (nutritionDraftId && nutritionDraftQuery.isError && !nutritionDraft) {
    return (
      <CustomFoodStatus
        isError
        message={getErrorMessage(
          nutritionDraftQuery.error,
          'No se pudo cargar el borrador de etiqueta.',
        )}
        action={
          <button
            className="button button--secondary"
            onClick={() => {
              setUploadedNutritionDraft(null);
              setSearchParams({}, { replace: true });
            }}
            type="button"
          >
            Volver al formulario manual
          </button>
        }
      />
    );
  }

  if (nutritionDraft && nutritionDraft.status !== 'PENDING_REVIEW') {
    return (
      <CustomFoodStatus
        isError
        message="Este borrador ya no está pendiente de revisión."
        action={
          <button
            className="button button--secondary"
            onClick={() => {
              setUploadedNutritionDraft(null);
              setSearchParams({}, { replace: true });
            }}
            type="button"
          >
            Volver al formulario manual
          </button>
        }
      />
    );
  }

  if (nutritionDraft) {
    return (
      <NutritionLabelDraftReview
        categories={categories.data ?? []}
        draft={nutritionDraft}
        foodId={isEditing ? foodId : undefined}
        nutrients={nutrients.data ?? []}
        onCancel={() => {
          setUploadedNutritionDraft(null);
          setSearchParams({}, { replace: true });
        }}
        onConfirmed={(confirmedFoodId) =>
          navigate(`/app/alimentos/${confirmedFoodId}`, {
            replace: true,
            state: { foodSaved: true, inventoryAdded: true },
          })
        }
      />
    );
  }

  const handleNutritionLabelFile = async (file: File) => {
    if (!file || !activeHousehold) return;

    try {
      const draft = await createNutritionLabelDraft.mutateAsync({
        brand: getValues('brand').trim() || undefined,
        file,
        householdId: activeHousehold.id,
        name: getValues('name').trim() || undefined,
      });
      setUploadedNutritionDraft(draft);
      setSearchParams({ nutritionDraftId: draft.id }, { replace: true });
    } catch {
      // El error de lectura se muestra junto a la accion.
    }
  };

  const handleAddNutrient = () => {
    if (!nutrientToAdd || activeNutrientIds.has(nutrientToAdd)) {
      return;
    }

    nutrientFields.append({ amount: '', nutrientDefinitionId: nutrientToAdd });
    setNutrientToAdd('');
  };

  const onSubmit: SubmitHandler<CustomFoodFormValues> = async (values) => {
    const missingRequired = nutrientDefinitions.filter(
      (nutrient) =>
        nutrient.isRequired &&
        !values.nutrients.some(
          (value) => value.nutrientDefinitionId === nutrient.id,
        ),
    );

    if (missingRequired.length > 0) {
      setError('nutrients', {
        type: 'validate',
        message: `Agrega los nutrientes requeridos: ${missingRequired
          .map((nutrient) => nutrient.name)
          .join(', ')}.`,
      });
      return;
    }

    const input = toCustomFoodInput(values);

    try {
      const food = isEditing
        ? await updateFood.mutateAsync({ foodId: foodId as string, input })
        : await createFood.mutateAsync({
            householdId: activeHousehold.id,
            input,
          });

      navigate(`/app/alimentos/${food.id}`, {
        replace: true,
        state: { foodSaved: true },
      });
    } catch {
      // El error de la mutación se muestra debajo del formulario.
    }
  };

  return (
    <section
      className="page-section food-form-page"
      aria-labelledby="custom-food-title"
    >
      <NutritionLabelReader
        error={
          createNutritionLabelDraft.error
            ? getErrorMessage(
                createNutritionLabelDraft.error,
                'No se pudo leer la etiqueta.',
              )
            : null
        }
        isPending={createNutritionLabelDraft.isPending}
        onFile={handleNutritionLabelFile}
      />
      <form
        className="custom-food-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <fieldset className="food-form-section food-form-section--general">
          <legend>Datos generales</legend>
          <p className="food-form-help">
            Identifica el alimento y la cantidad usada como referencia.
          </p>
          <div className="food-form-grid">
            <FormField error={errors.name?.message} label="Nombre" required>
              <input id="custom-food-name" {...register('name')} type="text" />
            </FormField>
            <FormField error={errors.brand?.message} label="Marca">
              <input
                id="custom-food-brand"
                {...register('brand')}
                type="text"
              />
            </FormField>
            <FormField
              error={errors.categoryId?.message}
              label="Categoría"
              required
            >
              <select id="custom-food-category" {...register('categoryId')}>
                <option value="">Selecciona una categoría</option>
                {categories.data?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              error={errors.preparationState?.message}
              label="Estado de preparación"
              required
            >
              <select
                id="custom-food-preparation"
                {...register('preparationState')}
              >
                {Object.entries(preparationStateLabels).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </FormField>
            <FormField
              error={errors.referenceQuantity?.message}
              label="Cantidad de referencia"
              required
            >
              <input
                id="custom-food-reference-quantity"
                inputMode="decimal"
                {...register('referenceQuantity')}
                min="0"
                step="any"
                type="number"
              />
            </FormField>
            <FormField
              error={errors.referenceUnit?.message}
              label="Unidad de referencia"
              required
            >
              <select
                id="custom-food-reference-unit"
                {...register('referenceUnit')}
              >
                {referenceUnitOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <details className="food-form-optional">
            <summary>Detalles opcionales de la información</summary>
            <div className="food-form-grid">
              <FormField
                error={errors.source?.message}
                help="Por ejemplo, la etiqueta del envase o una ficha del fabricante."
                label="Fuente"
              >
                <input
                  id="custom-food-source"
                  {...register('source')}
                  placeholder="Ej. etiqueta del envase"
                  type="text"
                />
              </FormField>
              <FormField
                error={errors.confidenceLevel?.message}
                label="Confianza de los datos"
                required
              >
                <select
                  id="custom-food-confidence"
                  {...register('confidenceLevel')}
                >
                  {confidenceOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </details>
        </fieldset>

        <fieldset className="food-form-section">
          <legend>Nutrientes por referencia</legend>
          <p className="food-form-help">
            Los valores deben ser mayores o iguales que cero. Los cuatro
            nutrientes principales son obligatorios.
          </p>
          <div className="custom-food-nutrient-list">
            {nutrientFields.fields.map((field, index) => {
              const definition = nutrientDefinitionById.get(
                field.nutrientDefinitionId,
              );
              if (!definition) {
                return null;
              }

              return (
                <div className="custom-food-nutrient-row" key={field.formId}>
                  <input
                    type="hidden"
                    {...register(`nutrients.${index}.nutrientDefinitionId`)}
                  />
                  <div>
                    <strong>{definition.name}</strong>
                    <small>{definition.unit}</small>
                  </div>
                  <div className="form-field">
                    <label htmlFor={`custom-food-nutrient-${index}`}>
                      {definition.name} cantidad
                    </label>
                    <input
                      aria-describedby={
                        errors.nutrients?.[index]?.amount
                          ? `custom-food-nutrient-${index}-error`
                          : undefined
                      }
                      aria-invalid={
                        errors.nutrients?.[index]?.amount ? 'true' : 'false'
                      }
                      id={`custom-food-nutrient-${index}`}
                      inputMode="decimal"
                      min="0"
                      step="any"
                      type="number"
                      {...register(`nutrients.${index}.amount`)}
                    />
                    {errors.nutrients?.[index]?.amount?.message ? (
                      <p
                        className="form-field__error"
                        id={`custom-food-nutrient-${index}-error`}
                      >
                        {errors.nutrients[index]?.amount?.message}
                      </p>
                    ) : null}
                  </div>
                  {!definition.isRequired ? (
                    <button
                      className="button button--text food-row-remove"
                      onClick={() => nutrientFields.remove(index)}
                      type="button"
                    >
                      Quitar
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
          {typeof errors.nutrients?.message === 'string' ? (
            <p className="form-field__error" role="alert">
              {errors.nutrients.message}
            </p>
          ) : null}
          {optionalNutrients.length > 0 ? (
            <div className="food-form-add-row">
              <div className="form-field">
                <label htmlFor="custom-food-add-nutrient">
                  Micronutriente opcional
                </label>
                <select
                  id="custom-food-add-nutrient"
                  onChange={(event) => setNutrientToAdd(event.target.value)}
                  value={nutrientToAdd}
                >
                  <option value="">Selecciona un nutriente</option>
                  {optionalNutrients.map((nutrient) => (
                    <option key={nutrient.id} value={nutrient.id}>
                      {nutrient.name} ({nutrient.unit})
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="button button--secondary"
                disabled={!nutrientToAdd}
                onClick={handleAddNutrient}
                type="button"
              >
                <Plus aria-hidden="true" size={18} />
                Agregar micronutriente
              </button>
            </div>
          ) : null}
        </fieldset>

        <fieldset className="food-form-section">
          <legend>Porciones</legend>
          <p className="food-form-help">
            Agrega equivalencias útiles para seleccionar este alimento más
            adelante.
          </p>
          <div className="custom-food-serving-list">
            {servingFields.fields.map((field, index) => (
              <div className="custom-food-serving-row" key={field.formId}>
                <FormField
                  error={errors.servings?.[index]?.name?.message}
                  label="Nombre"
                  required
                >
                  <input
                    id={`custom-food-serving-name-${index}`}
                    {...register(`servings.${index}.name`)}
                    placeholder="Ej. 1 rebanada"
                    type="text"
                  />
                </FormField>
                <FormField
                  error={errors.servings?.[index]?.quantity?.message}
                  label="Cantidad"
                  required
                >
                  <input
                    id={`custom-food-serving-quantity-${index}`}
                    inputMode="decimal"
                    min="0"
                    step="any"
                    type="number"
                    {...register(`servings.${index}.quantity`)}
                  />
                </FormField>
                <FormField
                  error={errors.servings?.[index]?.unit?.message}
                  label="Unidad"
                  required
                >
                  <input
                    id={`custom-food-serving-unit-${index}`}
                    {...register(`servings.${index}.unit`)}
                    type="text"
                  />
                </FormField>
                <FormField
                  error={errors.servings?.[index]?.equivalentType?.message}
                  label="Equivalencia"
                  required
                >
                  <select
                    id={`custom-food-serving-equivalent-type-${index}`}
                    {...register(`servings.${index}.equivalentType`)}
                  >
                    <option value="GRAM">Gramos (g)</option>
                    <option value="MILLILITER">Mililitros (ml)</option>
                  </select>
                </FormField>
                <FormField
                  error={errors.servings?.[index]?.equivalentValue?.message}
                  label="Valor equivalente"
                  required
                >
                  <input
                    id={`custom-food-serving-equivalent-value-${index}`}
                    inputMode="decimal"
                    min="0"
                    step="any"
                    type="number"
                    {...register(`servings.${index}.equivalentValue`)}
                  />
                </FormField>
                <button
                  className="button button--text food-row-remove"
                  onClick={() => servingFields.remove(index)}
                  type="button"
                >
                  Quitar porción
                </button>
              </div>
            ))}
          </div>
          <button
            className="button button--secondary"
            onClick={() =>
              servingFields.append({
                equivalentType: 'GRAM',
                equivalentValue: '',
                name: '',
                quantity: '1',
                unit: 'unidad',
              })
            }
            type="button"
          >
            <Plus aria-hidden="true" size={18} />
            Agregar porción
          </button>
        </fieldset>

        {mutationError ? (
          <p className="food-form-error" role="alert">
            No se pudo guardar el alimento. Inténtalo nuevamente.
          </p>
        ) : null}
        <ActionBar
          primary={
            <button
              className="button button--primary"
              disabled={isSaving}
              type="submit"
            >
              {!isSaving ? <Save aria-hidden="true" size={18} /> : null}
              {isSaving
                ? isEditing
                  ? 'Guardando cambios...'
                  : 'Creando alimento...'
                : isEditing
                  ? 'Guardar cambios'
                  : 'Crear alimento'}
            </button>
          }
          secondary={
            <Link className="button button--secondary" to="/app/alimentos">
              Cancelar
            </Link>
          }
        />
      </form>
    </section>
  );
}

function toFormValues(
  food: FoodDetail | undefined,
  definitions: NutrientDefinition[],
): CustomFoodFormValues {
  if (!food) {
    return {
      ...getDefaultCustomFoodFormValues(),
      nutrients: definitions
        .filter((definition) => definition.isRequired)
        .map((definition) => ({
          amount: '',
          nutrientDefinitionId: definition.id,
        })),
    };
  }

  const nutrientValues = new Map(
    food.nutrients.map((nutrient) => [
      nutrient.nutrientDefinition.id,
      String(nutrient.amount),
    ]),
  );

  return {
    brand: food.brand ?? '',
    categoryId: food.category.id,
    confidenceLevel: food.confidenceLevel,
    name: food.name,
    nutrients: definitions
      .filter(
        (definition) =>
          definition.isRequired || nutrientValues.has(definition.id),
      )
      .map((definition) => ({
        amount: nutrientValues.get(definition.id) ?? '',
        nutrientDefinitionId: definition.id,
      })),
    preparationState: food.preparationState,
    referenceQuantity: String(food.referenceQuantity),
    referenceUnit: food.referenceUnit,
    servings: food.servings.map((serving) => ({
      equivalentType:
        serving.equivalentMilliliters !== null ? 'MILLILITER' : 'GRAM',
      equivalentValue: String(
        serving.equivalentMilliliters ?? serving.equivalentGrams ?? '',
      ),
      name: serving.name,
      quantity: String(serving.quantity),
      unit: serving.unit,
    })),
    source: food.source === 'USER' ? '' : food.source,
  };
}

function toCustomFoodInput(values: CustomFoodFormValues) {
  return {
    brand: values.brand.trim() || null,
    categoryId: values.categoryId,
    confidenceLevel: values.confidenceLevel,
    name: values.name.trim(),
    nutrients: values.nutrients.map((nutrient) => ({
      amount: Number(nutrient.amount),
      nutrientDefinitionId: nutrient.nutrientDefinitionId,
    })),
    preparationState: values.preparationState,
    referenceQuantity: Number(values.referenceQuantity),
    referenceUnit: values.referenceUnit,
    servings: values.servings.map((serving) => ({
      equivalentGrams:
        serving.equivalentType === 'GRAM'
          ? Number(serving.equivalentValue)
          : null,
      equivalentMilliliters:
        serving.equivalentType === 'MILLILITER'
          ? Number(serving.equivalentValue)
          : null,
      name: serving.name.trim(),
      quantity: Number(serving.quantity),
      unit: serving.unit.trim(),
    })),
    source: values.source.trim() || undefined,
  };
}

function CustomFoodStatus({
  action,
  isError = false,
  message,
}: {
  action?: React.ReactNode;
  isError?: boolean;
  message: string;
}) {
  return (
    <section className="page-section">
      <p className="lead" role={isError ? 'alert' : 'status'}>
        {message}
      </p>
      {action}
    </section>
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
