import { zodResolver } from '@hookform/resolvers/zod';
import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from 'react';
import {
  useFieldArray,
  useForm,
  type SubmitHandler,
} from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router';

import type {
  FoodDetail,
  NutrientDefinition,
} from '../../application/ports/FoodCatalogGateway';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import {
  useCreateCustomFood,
  useFoodCategories,
  useFoodDetail,
  useFoodNutrients,
  useUpdateCustomFood,
} from '../hooks/useFoodCatalog';
import {
  customFoodFormSchema,
  getDefaultCustomFoodFormValues,
  type CustomFoodFormValues,
} from '../schemas/customFoodSchemas';
import {
  preparationStateLabels,
} from '../utils/foodLabels';

const confidenceOptions = [
  ['USER_PROVIDED', 'Proporcionada por mi'],
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
  const [nutrientToAdd, setNutrientToAdd] = useState('');
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
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
  const isSaving = createFood.isPending || updateFood.isPending;
  const mutationError = createFood.error ?? updateFood.error;
  const isEditable = Boolean(
    currentFood &&
      currentFood.foodType === 'CUSTOM' &&
      !currentFood.isGlobal &&
      currentFood.householdId === activeHousehold?.id,
  );
  const nutrientDefinitions = useMemo(() => nutrients.data ?? [], [nutrients.data]);
  const nutrientDefinitionById = useMemo(
    () => new Map(nutrientDefinitions.map((nutrient) => [nutrient.id, nutrient])),
    [nutrientDefinitions],
  );
  const activeNutrientIds = useMemo(
    () => new Set(nutrientFields.fields.map((field) => field.nutrientDefinitionId)),
    [nutrientFields.fields],
  );
  const optionalNutrients = nutrientDefinitions.filter(
    (nutrient) => !nutrient.isRequired && !activeNutrientIds.has(nutrient.id),
  );

  useEffect(() => {
    if (!categories.data || !nutrients.data) {
      return;
    }

    if (isEditing && !currentFood) {
      return;
    }

    reset(toFormValues(currentFood, nutrients.data));
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
        action={<Link className="button button--secondary" to="/app">Ir a mis hogares</Link>}
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
            Volver al catalogo
          </Link>
        }
      />
    );
  }

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
      // El error de la mutacion se muestra debajo del formulario.
    }
  };

  return (
    <section className="page-section food-form-page" aria-labelledby="custom-food-title">
      <BackButton fallback="/app/alimentos" label="Volver al catálogo" />
      <Link className="auth-link food-back-link" to="/app/alimentos">
        Volver al catalogo
      </Link>
      <p className="eyebrow">Alimentos del hogar</p>
      <h1 id="custom-food-title">
        {isEditing ? 'Edita tu alimento' : 'Registra un alimento'}
      </h1>
      <p className="lead">
        Guarda los valores del envase o de tu receta para encontrarlos junto al catalogo.
      </p>

      <form className="custom-food-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset className="food-form-section">
          <legend>Datos generales</legend>
          <div className="food-form-grid">
            <FormField error={errors.name?.message} label="Nombre" required>
              <input id="custom-food-name" {...register('name')} type="text" />
            </FormField>
            <FormField error={errors.brand?.message} label="Marca">
              <input id="custom-food-brand" {...register('brand')} type="text" />
            </FormField>
            <FormField error={errors.categoryId?.message} label="Categoria" required>
              <select id="custom-food-category" {...register('categoryId')}>
                <option value="">Selecciona una categoria</option>
                {categories.data?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              error={errors.preparationState?.message}
              label="Estado de preparacion"
              required
            >
              <select id="custom-food-preparation" {...register('preparationState')}>
                {Object.entries(preparationStateLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
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
            <FormField error={errors.referenceUnit?.message} label="Unidad de referencia" required>
              <select id="custom-food-reference-unit" {...register('referenceUnit')}>
                {referenceUnitOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField error={errors.source?.message} label="Fuente">
              <input
                id="custom-food-source"
                {...register('source')}
                placeholder="Ej. etiqueta del envase"
                type="text"
              />
            </FormField>
            <FormField
              error={errors.confidenceLevel?.message}
              label="Nivel de confianza"
              required
            >
              <select id="custom-food-confidence" {...register('confidenceLevel')}>
                {confidenceOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </fieldset>

        <fieldset className="food-form-section">
          <legend>Nutrientes por referencia</legend>
          <p className="food-form-help">
            Los valores deben ser mayores o iguales que cero. Los cuatro nutrientes
            principales son obligatorios.
          </p>
          <div className="custom-food-nutrient-list">
            {nutrientFields.fields.map((field, index) => {
              const definition = nutrientDefinitionById.get(field.nutrientDefinitionId);
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
                      aria-invalid={errors.nutrients?.[index]?.amount ? 'true' : 'false'}
                      id={`custom-food-nutrient-${index}`}
                      inputMode="decimal"
                      min="0"
                      step="any"
                      type="number"
                      {...register(`nutrients.${index}.amount`)}
                    />
                    {errors.nutrients?.[index]?.amount?.message ? (
                      <p className="form-field__error">
                        {errors.nutrients[index]?.amount?.message}
                      </p>
                    ) : null}
                  </div>
                  {!definition.isRequired ? (
                    <button
                      className="button button--text"
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
                <label htmlFor="custom-food-add-nutrient">Micronutriente opcional</label>
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
                Agregar micronutriente
              </button>
            </div>
          ) : null}
        </fieldset>

        <fieldset className="food-form-section">
          <legend>Porciones</legend>
          <p className="food-form-help">
            Agrega equivalencias utiles para seleccionar este alimento mas adelante.
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
                  className="button button--text"
                  onClick={() => servingFields.remove(index)}
                  type="button"
                >
                  Quitar porcion
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
            Agregar porcion
          </button>
        </fieldset>

        <div className="food-form-actions">
          <Link className="button button--secondary" to="/app/alimentos">
            Cancelar
          </Link>
          <button className="button button--primary" disabled={isSaving} type="submit">
            {isSaving
              ? isEditing
                ? 'Guardando cambios...'
                : 'Creando alimento...'
              : isEditing
                ? 'Guardar cambios'
                : 'Crear alimento'}
          </button>
        </div>
      </form>
      {mutationError ? (
        <p className="auth-error" role="alert">
          {getErrorMessage(
            mutationError,
            'No se pudo guardar el alimento. Intentalo nuevamente.',
          )}
        </p>
      ) : null}
    </section>
  );
}

function FormField({
  children,
  error,
  label,
  required = false,
}: {
  children: ReactElement<{ id?: string }>;
  error?: string;
  label: string;
  required?: boolean;
}) {
  const child = Children.only(children);
  const inputId = isValidElement(child) ? child.props.id : undefined;

  return (
    <div className="form-field">
      <label htmlFor={inputId}>
        {label}
        {required ? ' *' : ''}
      </label>
      {children}
      {error ? <p className="form-field__error">{error}</p> : null}
    </div>
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
    <section className="page-section" aria-labelledby="custom-food-status-title">
      <p className="eyebrow">Alimentos del hogar</p>
      <h1 id="custom-food-status-title">Alimento personalizado</h1>
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
