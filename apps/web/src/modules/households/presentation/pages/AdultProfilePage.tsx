import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import {
  useFieldArray,
  useForm,
  useWatch,
  type FieldErrors,
  type FieldPath,
  type FieldArrayWithId,
  type SubmitErrorHandler,
  type SubmitHandler,
  type UseFieldArrayAppend,
  type UseFieldArrayRemove,
  type UseFormRegister,
} from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router';
import {
  ErrorState,
  LoadingState,
} from '../../../../shared/presentation/components/AsyncState';

import { adultProfileDraftStorage } from '../../../../app/composition/dependencies';
import type {
  ActivityLevel,
  AdultProfile,
  BiologicalSex,
  DietaryRestrictionInput,
  PrimaryGoal,
} from '../../application/ports/AdultProfileGateway';
import type { AdultProfileDraftValues } from '../../application/ports/AdultProfileDraftStorage';
import { useAuth } from '../../../auth/presentation/providers/useAuth';
import { useAdultProfiles } from '../hooks/useAdultProfiles';
import { useHouseholds } from '../hooks/useHouseholds';
import '../households.css';
import {
  adultProfileFormSchema,
  getTodayDateInputValue,
  type AdultProfileFormValues,
} from '../schemas/adultProfileSchemas';

const PROFILE_STEPS = [
  'Información básica',
  'Datos corporales',
  'Actividad y objetivo',
  'Restricciones',
  'Balanza de cocina',
] as const;

const STEP_FIELDS: Record<number, FieldPath<AdultProfileFormValues>[]> = {
  1: ['name', 'birthDate'],
  2: ['biologicalSex', 'weightKg', 'heightCm'],
  3: ['activityLevel', 'primaryGoal'],
  4: ['dietaryRestrictions'],
  5: ['hasKitchenScale'],
};

export function AdultProfilePage() {
  const navigate = useNavigate();
  const { currentUser, isCurrentUserLoading } = useAuth();
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const currentProfile = profiles.profiles.find(
    (profile) => profile.userId === currentUser?.id,
  );
  const draftKey =
    currentUser && households.activeHousehold
      ? getAdultProfileDraftKey(currentUser.id, households.activeHousehold.id)
      : null;
  const [currentStep, setCurrentStep] = useState(1);
  const [restoredDraftKey, setRestoredDraftKey] = useState<string | null>(null);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    trigger,
  } = useForm<AdultProfileFormValues>({
    defaultValues: getDefaultFormValues(),
    resolver: zodResolver(adultProfileFormSchema),
  });
  const watchedValues = useWatch({ control }) as AdultProfileFormValues;
  const { append, fields, remove } = useFieldArray({
    control,
    keyName: 'formId',
    name: 'dietaryRestrictions',
  });

  useEffect(() => {
    if (
      !draftKey ||
      households.isPending ||
      profiles.isPending ||
      profiles.isError ||
      isCurrentUserLoading ||
      restoredDraftKey === draftKey
    ) {
      return;
    }

    if (currentProfile) {
      reset(getDefaultFormValues(currentProfile));
      adultProfileDraftStorage.clear(draftKey);
    } else {
      const draft = adultProfileDraftStorage.get(draftKey);

      if (draft) {
        reset({
          ...getDefaultFormValues(),
          ...draft.values,
          dietaryRestrictions: draft.values.dietaryRestrictions,
        } as AdultProfileFormValues);
        queueMicrotask(() => setCurrentStep(draft.currentStep));
      }
    }

    queueMicrotask(() => setRestoredDraftKey(draftKey));
  }, [
    currentProfile,
    draftKey,
    households.isPending,
    isCurrentUserLoading,
    profiles.isError,
    profiles.isPending,
    reset,
    restoredDraftKey,
  ]);

  useEffect(() => {
    if (!draftKey || currentProfile || restoredDraftKey !== draftKey) {
      return;
    }

    adultProfileDraftStorage.save(draftKey, {
      currentStep,
      values: toAdultProfileDraftValues(watchedValues),
    });
  }, [currentProfile, currentStep, draftKey, restoredDraftKey, watchedValues]);

  if (households.isPending) {
    return <ProfileStatus message="Cargando tu hogar..." />;
  }

  if (isCurrentUserLoading) {
    return <ProfileStatus message="Cargando tu usuario..." />;
  }

  if (!currentUser) {
    return (
      <ProfileStatus
        isError
        message="No se pudo identificar tu usuario. Recarga la página e inténtalo nuevamente."
      />
    );
  }

  if (households.isError) {
    return <ProfileStatus message="No se pudo cargar tu hogar." isError />;
  }

  if (households.households.length === 0) {
    return <Navigate replace to="/onboarding" />;
  }

  if (!households.activeHousehold) {
    return (
      <section className="page-section" aria-labelledby="profile-select-title">
        <Link className="button button--primary" to="/app">
          Ir a mis hogares
        </Link>
      </section>
    );
  }

  if (profiles.isPending) {
    return <ProfileStatus message="Cargando los perfiles del hogar..." />;
  }

  if (profiles.isError) {
    return (
      <ProfileStatus message="No se pudieron cargar los perfiles." isError />
    );
  }

  const isEditing = Boolean(currentProfile);
  const isSaving =
    profiles.isCreatingAdultProfile || profiles.isUpdatingAdultProfile;
  const profileError =
    profiles.createAdultProfileError ?? profiles.updateAdultProfileError;

  const onSubmit: SubmitHandler<AdultProfileFormValues> = async (values) => {
    const input = toAdultProfileInput(values);

    try {
      if (currentProfile) {
        await profiles.updateAdultProfile(currentProfile.id, input);
      } else {
        await profiles.createAdultProfile(input);
      }

      if (draftKey) {
        adultProfileDraftStorage.clear(draftKey);
      }

      navigate('/app', {
        replace: true,
        state: { profileSaved: true },
      });
    } catch {
      // El error de la mutación se muestra debajo del formulario.
    }
  };

  const onInvalid: SubmitErrorHandler<AdultProfileFormValues> = (
    formErrors,
  ) => {
    setCurrentStep(getFirstErrorStep(formErrors));
  };

  async function handleNextStep() {
    if (await trigger(STEP_FIELDS[currentStep])) {
      setCurrentStep((step) => Math.min(step + 1, PROFILE_STEPS.length));
    }
  }

  return (
    <section
      className="page-section profile-wizard"
      aria-labelledby="profile-title"
    >
      <ProfileStepIndicator currentStep={currentStep} />
      <form
        className="auth-form profile-form"
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        noValidate
      >
        <p className="profile-step-heading">
          Paso {currentStep} de {PROFILE_STEPS.length}:{' '}
          <strong>{PROFILE_STEPS[currentStep - 1]}</strong>
        </p>
        {Object.keys(errors).length > 0 ? (
          <p className="profile-error-summary" role="alert">
            Revisa los campos indicados antes de continuar.
          </p>
        ) : null}

        {currentStep === 1 ? (
          <BasicInformationStep errors={errors} register={register} />
        ) : null}
        {currentStep === 2 ? (
          <BodyInformationStep errors={errors} register={register} />
        ) : null}
        {currentStep === 3 ? (
          <ActivityGoalStep errors={errors} register={register} />
        ) : null}
        {currentStep === 4 ? (
          <RestrictionsStep
            append={append}
            errors={errors}
            fields={fields}
            register={register}
            remove={remove}
          />
        ) : null}
        {currentStep === 5 ? (
          <ScaleStep errors={errors} register={register} />
        ) : null}

        <div className="profile-step-actions">
          {currentStep > 1 ? (
            <button
              className="button button--secondary"
              onClick={() => setCurrentStep((step) => step - 1)}
              type="button"
            >
              Anterior
            </button>
          ) : null}
          {currentStep < PROFILE_STEPS.length ? (
            <button
              className="button button--primary"
              onClick={() => void handleNextStep()}
              type="button"
            >
              Continuar
            </button>
          ) : (
            <button
              className="button button--primary"
              disabled={isSaving}
              type="submit"
            >
              {isSaving
                ? isEditing
                  ? 'Guardando cambios...'
                  : 'Guardando perfil...'
                : isEditing
                  ? 'Guardar cambios'
                  : 'Guardar perfil'}
            </button>
          )}
        </div>
      </form>
      {profileError ? (
        <p className="auth-error" role="alert">
          {getErrorMessage(
            profileError,
            'No se pudo guardar el perfil. Inténtalo nuevamente.',
          )}
        </p>
      ) : null}
    </section>
  );
}

function BasicInformationStep({
  errors,
  register,
}: {
  errors: FieldErrors<AdultProfileFormValues>;
  register: UseFormRegister<AdultProfileFormValues>;
}) {
  return (
    <fieldset className="profile-step-fields">
      <legend className="visually-hidden">Información básica</legend>
      <div className="form-field">
        <label htmlFor="profile-name">Nombre</label>
        <input
          autoComplete="name"
          id="profile-name"
          type="text"
          {...register('name')}
          aria-describedby={errors.name ? 'profile-name-error' : undefined}
          aria-invalid={errors.name ? 'true' : 'false'}
        />
        {getFieldError(errors, 'name', 'profile-name-error')}
      </div>
      <div className="form-field">
        <label htmlFor="profile-birth-date">Fecha de nacimiento</label>
        <input
          id="profile-birth-date"
          max={getTodayDateInputValue()}
          type="date"
          {...register('birthDate')}
          aria-describedby={
            errors.birthDate ? 'profile-birth-date-error' : undefined
          }
          aria-invalid={errors.birthDate ? 'true' : 'false'}
        />
        {getFieldError(errors, 'birthDate', 'profile-birth-date-error')}
      </div>
    </fieldset>
  );
}

function BodyInformationStep({
  errors,
  register,
}: {
  errors: FieldErrors<AdultProfileFormValues>;
  register: UseFormRegister<AdultProfileFormValues>;
}) {
  return (
    <fieldset className="profile-step-fields">
      <legend className="visually-hidden">Datos corporales</legend>
      <div className="form-field">
        <label htmlFor="profile-sex">Sexo biológico</label>
        <select
          id="profile-sex"
          {...register('biologicalSex')}
          aria-describedby={
            errors.biologicalSex ? 'profile-sex-error' : undefined
          }
          aria-invalid={errors.biologicalSex ? 'true' : 'false'}
        >
          <option value="">Selecciona una opción</option>
          <option value="FEMALE">Femenino</option>
          <option value="MALE">Masculino</option>
        </select>
        {getFieldError(errors, 'biologicalSex', 'profile-sex-error')}
      </div>
      <div className="form-field">
        <label htmlFor="profile-height">Altura en centímetros</label>
        <input
          id="profile-height"
          inputMode="decimal"
          min="0.01"
          type="number"
          {...register('heightCm')}
          aria-describedby={
            errors.heightCm ? 'profile-height-error' : undefined
          }
          aria-invalid={errors.heightCm ? 'true' : 'false'}
        />
        {getFieldError(errors, 'heightCm', 'profile-height-error')}
      </div>
      <div className="form-field">
        <label htmlFor="profile-weight">Peso en kilogramos</label>
        <input
          id="profile-weight"
          inputMode="decimal"
          min="0.01"
          type="number"
          {...register('weightKg')}
          aria-describedby={
            errors.weightKg ? 'profile-weight-error' : undefined
          }
          aria-invalid={errors.weightKg ? 'true' : 'false'}
        />
        {getFieldError(errors, 'weightKg', 'profile-weight-error')}
      </div>
    </fieldset>
  );
}

function ActivityGoalStep({
  errors,
  register,
}: {
  errors: FieldErrors<AdultProfileFormValues>;
  register: UseFormRegister<AdultProfileFormValues>;
}) {
  return (
    <fieldset className="profile-step-fields">
      <legend className="visually-hidden">Actividad y objetivo</legend>
      <div className="form-field">
        <label htmlFor="profile-activity">Nivel de actividad</label>
        <select
          id="profile-activity"
          {...register('activityLevel')}
          aria-describedby={
            errors.activityLevel ? 'profile-activity-error' : undefined
          }
          aria-invalid={errors.activityLevel ? 'true' : 'false'}
        >
          <option value="">Selecciona una opción</option>
          <option value="SEDENTARY">Sedentario</option>
          <option value="LIGHT">Ligero</option>
          <option value="MODERATE">Moderado</option>
          <option value="HIGH">Alto</option>
          <option value="VERY_HIGH">Muy alto</option>
        </select>
        {getFieldError(errors, 'activityLevel', 'profile-activity-error')}
      </div>
      <div className="form-field">
        <label htmlFor="profile-goal">Objetivo principal</label>
        <select
          id="profile-goal"
          {...register('primaryGoal')}
          aria-describedby={
            errors.primaryGoal ? 'profile-goal-error' : undefined
          }
          aria-invalid={errors.primaryGoal ? 'true' : 'false'}
        >
          <option value="">Selecciona una opción</option>
          <option value="FAT_LOSS">Perder grasa</option>
          <option value="MAINTENANCE">Mantenerme</option>
          <option value="MUSCLE_GAIN">Ganar masa muscular</option>
        </select>
        {getFieldError(errors, 'primaryGoal', 'profile-goal-error')}
      </div>
    </fieldset>
  );
}

function RestrictionsStep({
  append,
  errors,
  fields,
  register,
  remove,
}: {
  append: UseFieldArrayAppend<AdultProfileFormValues, 'dietaryRestrictions'>;
  errors: FieldErrors<AdultProfileFormValues>;
  fields: FieldArrayWithId<
    AdultProfileFormValues,
    'dietaryRestrictions',
    'formId'
  >[];
  register: UseFormRegister<AdultProfileFormValues>;
  remove: UseFieldArrayRemove;
}) {
  const restrictionErrors = getNestedErrors(errors, 'dietaryRestrictions');

  return (
    <fieldset className="profile-step-fields">
      <legend className="visually-hidden">Restricciones alimentarias</legend>
      <p className="supporting-text">
        Agrega alergias, intolerancias o preferencias que debamos considerar.
      </p>
      {fields.length === 0 ? (
        <p className="empty-copy">Todavía no has agregado restricciones.</p>
      ) : null}
      {fields.map((field, index) => (
        <fieldset className="restriction-form" key={field.formId}>
          <legend>Restricción {index + 1}</legend>
          <div className="form-field">
            <label htmlFor={`restriction-type-${index}`}>Tipo</label>
            <select
              id={`restriction-type-${index}`}
              {...register(`dietaryRestrictions.${index}.type`)}
              aria-describedby={
                hasNestedFieldError(restrictionErrors, index, 'type')
                  ? `restriction-type-${index}-error`
                  : undefined
              }
              aria-invalid={
                hasNestedFieldError(restrictionErrors, index, 'type')
                  ? 'true'
                  : 'false'
              }
            >
              <option value="ALLERGY">Alergia</option>
              <option value="INTOLERANCE">Intolerancia</option>
              <option value="PREFERENCE">Preferencia</option>
            </select>
            {getNestedFieldError(
              restrictionErrors,
              index,
              'type',
              `restriction-type-${index}-error`,
            )}
          </div>
          <div className="form-field">
            <label htmlFor={`restriction-name-${index}`}>Nombre</label>
            <input
              id={`restriction-name-${index}`}
              type="text"
              {...register(`dietaryRestrictions.${index}.name`)}
              aria-describedby={
                hasNestedFieldError(restrictionErrors, index, 'name')
                  ? `restriction-name-${index}-error`
                  : undefined
              }
              aria-invalid={
                hasNestedFieldError(restrictionErrors, index, 'name')
                  ? 'true'
                  : 'false'
              }
            />
            {getNestedFieldError(
              restrictionErrors,
              index,
              'name',
              `restriction-name-${index}-error`,
            )}
          </div>
          <div className="form-field">
            <label htmlFor={`restriction-severity-${index}`}>
              Severidad (opcional)
            </label>
            <input
              id={`restriction-severity-${index}`}
              type="text"
              {...register(`dietaryRestrictions.${index}.severity`)}
              aria-describedby={
                hasNestedFieldError(restrictionErrors, index, 'severity')
                  ? `restriction-severity-${index}-error`
                  : undefined
              }
              aria-invalid={
                hasNestedFieldError(restrictionErrors, index, 'severity')
                  ? 'true'
                  : 'false'
              }
            />
            {getNestedFieldError(
              restrictionErrors,
              index,
              'severity',
              `restriction-severity-${index}-error`,
            )}
          </div>
          <div className="form-field">
            <label htmlFor={`restriction-notes-${index}`}>
              Notas (opcional)
            </label>
            <textarea
              id={`restriction-notes-${index}`}
              {...register(`dietaryRestrictions.${index}.notes`)}
              aria-describedby={
                hasNestedFieldError(restrictionErrors, index, 'notes')
                  ? `restriction-notes-${index}-error`
                  : undefined
              }
              aria-invalid={
                hasNestedFieldError(restrictionErrors, index, 'notes')
                  ? 'true'
                  : 'false'
              }
            />
            {getNestedFieldError(
              restrictionErrors,
              index,
              'notes',
              `restriction-notes-${index}-error`,
            )}
          </div>
          <button
            className="button button--secondary"
            onClick={() => remove(index)}
            type="button"
          >
            Quitar restricción
          </button>
        </fieldset>
      ))}
      <button
        className="button button--secondary"
        onClick={() =>
          append({ name: '', notes: '', severity: '', type: 'ALLERGY' })
        }
        type="button"
      >
        Agregar restricción
      </button>
    </fieldset>
  );
}

function ScaleStep({
  errors,
  register,
}: {
  errors: FieldErrors<AdultProfileFormValues>;
  register: UseFormRegister<AdultProfileFormValues>;
}) {
  return (
    <fieldset className="profile-step-fields">
      <legend className="visually-hidden">Balanza de cocina</legend>
      <p className="lead profile-step-copy">
        Saber si tienes una balanza nos ayuda a adaptar las recomendaciones.
      </p>
      <label className="checkbox-field">
        <input type="checkbox" {...register('hasKitchenScale')} />
        <span>Tengo una balanza de cocina</span>
      </label>
      {getFieldError(errors, 'hasKitchenScale')}
    </fieldset>
  );
}

function ProfileStepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <ol className="profile-steps" aria-label="Progreso del perfil">
      {PROFILE_STEPS.map((step, index) => (
        <li
          className={
            index + 1 === currentStep
              ? 'is-current'
              : index + 1 < currentStep
                ? 'is-complete'
                : undefined
          }
          key={step}
          aria-current={index + 1 === currentStep ? 'step' : undefined}
        >
          <span>{index + 1}</span>
          <small>{step}</small>
        </li>
      ))}
    </ol>
  );
}

function getDefaultFormValues(profile?: AdultProfile): AdultProfileFormValues {
  return {
    activityLevel: profile?.activityLevel ?? ('' as never),
    birthDate: profile?.birthDate ?? '',
    biologicalSex: profile?.biologicalSex ?? ('' as never),
    dietaryRestrictions:
      profile?.dietaryRestrictions.map((restriction) => ({
        name: restriction.name,
        notes: restriction.notes ?? '',
        severity: restriction.severity ?? '',
        type: restriction.type,
      })) ?? [],
    hasKitchenScale: profile?.hasKitchenScale ?? false,
    heightCm: profile ? String(profile.heightCm) : '',
    weightKg: profile?.weightKg == null ? '' : String(profile.weightKg),
    name: profile?.name ?? '',
    primaryGoal: profile?.primaryGoal ?? ('' as never),
  };
}

function getAdultProfileDraftKey(userId: string, householdId: string): string {
  return `${userId}:${householdId}`;
}

function toAdultProfileDraftValues(
  values: AdultProfileFormValues,
): AdultProfileDraftValues {
  return {
    activityLevel: values.activityLevel,
    birthDate: values.birthDate,
    biologicalSex: values.biologicalSex,
    dietaryRestrictions: values.dietaryRestrictions.map((restriction) => ({
      name: restriction.name,
      notes: restriction.notes,
      severity: restriction.severity,
      type: restriction.type,
    })),
    hasKitchenScale: values.hasKitchenScale,
    heightCm: values.heightCm,
    weightKg: values.weightKg,
    name: values.name,
    primaryGoal: values.primaryGoal,
  };
}

function toAdultProfileInput(values: AdultProfileFormValues): {
  activityLevel: ActivityLevel;
  birthDate: string;
  biologicalSex: BiologicalSex;
  dietaryRestrictions: DietaryRestrictionInput[];
  hasKitchenScale: boolean;
  heightCm: number;
  weightKg: number | null;
  name: string;
  primaryGoal: PrimaryGoal;
} {
  return {
    activityLevel: values.activityLevel,
    birthDate: values.birthDate,
    biologicalSex: values.biologicalSex,
    dietaryRestrictions: values.dietaryRestrictions.map((restriction) => ({
      name: restriction.name.trim(),
      notes: restriction.notes.trim() || null,
      severity: restriction.severity.trim() || null,
      type: restriction.type,
    })),
    hasKitchenScale: values.hasKitchenScale,
    heightCm: Number(values.heightCm),
    weightKg: values.weightKg.trim() ? Number(values.weightKg) : null,
    name: values.name.trim(),
    primaryGoal: values.primaryGoal,
  };
}

function getFirstErrorStep(
  errors: FieldErrors<AdultProfileFormValues>,
): number {
  if (errors.name || errors.birthDate) return 1;
  if (errors.biologicalSex || errors.heightCm || errors.weightKg) return 2;
  if (errors.activityLevel || errors.primaryGoal) return 3;
  if (errors.dietaryRestrictions) return 4;
  return 5;
}

function getFieldError(
  errors: FieldErrors<AdultProfileFormValues>,
  field: string,
  id?: string,
) {
  const error = (errors as Record<string, unknown>)[field];

  if (!error || typeof error !== 'object' || !('message' in error)) {
    return null;
  }

  return (
    <p className="form-field__error" id={id}>
      {String(error.message)}
    </p>
  );
}

function getNestedErrors(
  errors: FieldErrors<AdultProfileFormValues>,
  field: string,
) {
  const nested = (errors as Record<string, unknown>)[field];
  return Array.isArray(nested) ? nested : [];
}

function getNestedFieldError(
  errors: unknown[],
  index: number,
  field: string,
  id?: string,
) {
  const error = errors[index];

  if (typeof error !== 'object' || error === null) {
    return null;
  }

  const fieldError = (error as Record<string, unknown>)[field];
  if (
    typeof fieldError !== 'object' ||
    fieldError === null ||
    !('message' in fieldError)
  ) {
    return null;
  }

  return (
    <p className="form-field__error" id={id}>
      {String(fieldError.message)}
    </p>
  );
}

function hasNestedFieldError(
  errors: unknown[],
  index: number,
  field: string,
): boolean {
  const error = errors[index];
  return Boolean(
    typeof error === 'object' &&
    error !== null &&
    (error as Record<string, unknown>)[field],
  );
}

function ProfileStatus({
  isError = false,
  message,
}: {
  isError?: boolean;
  message: string;
}) {
  return (
    <section className="page-section">
      {isError ? (
        <ErrorState message={message} />
      ) : (
        <LoadingState message={message} />
      )}
    </section>
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
