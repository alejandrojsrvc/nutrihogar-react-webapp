import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router';

import {
  ErrorState,
  LoadingState,
} from '../../../../shared/presentation/components/AsyncState';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import '../onboarding.css';
import {
  createHouseholdFormSchema,
  getDefaultTimezone,
  type CreateHouseholdFormValues,
} from '../../../households/presentation/schemas/householdSchemas';

export function OnboardingPage() {
  const navigate = useNavigate();
  const onboarding = useOnboardingStatus();
  const {
    createHousehold,
    createHouseholdError,
    isCreatingHousehold,
    selectActiveHousehold,
  } = onboarding.households;
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<CreateHouseholdFormValues>({
    defaultValues: {
      currency: 'ARS',
      name: '',
      timezone: getDefaultTimezone(),
    },
    resolver: zodResolver(createHouseholdFormSchema),
  });

  useEffect(() => {
    if (onboarding.isLoading || onboarding.isError) {
      return;
    }

    if (onboarding.step === 'complete-profile') {
      navigate('/app/perfil/editar', { replace: true });
    }

    if (onboarding.step === 'ready') {
      navigate('/app', { replace: true });
    }
  }, [navigate, onboarding.isError, onboarding.isLoading, onboarding.step]);

  const onSubmit: SubmitHandler<CreateHouseholdFormValues> = async (values) => {
    try {
      await createHousehold({
        currency: values.currency,
        name: values.name.trim(),
        timezone: values.timezone.trim(),
      });
      navigate('/app/perfil/editar', { replace: true });
    } catch {
      // El error de la mutación se muestra debajo del formulario.
    }
  };

  if (onboarding.isLoading) {
    return (
      <section className="page-section onboarding-page">
        <LoadingState message="Consultando los hogares asociados a tu cuenta..." />
      </section>
    );
  }

  if (onboarding.isError) {
    return (
      <section
        className="page-section onboarding-page"
        aria-labelledby="onboarding-error-title"
      >
        <ErrorState
          action={
            <button
              className="button button--secondary"
              onClick={() => {
                void onboarding.households.refetch();
                void onboarding.profiles.refetch();
              }}
              type="button"
            >
              Reintentar
            </button>
          }
          message={getErrorMessage(
            onboarding.error,
            'No se pudo conectar con la API de NutriHogar.',
          )}
        />
      </section>
    );
  }

  if (onboarding.step === 'select-household') {
    return (
      <section
        className="page-section onboarding-page"
        aria-labelledby="household-select-title"
      >
        <OnboardingProgress currentStep={1} />
        <div className="household-list" role="list">
          {onboarding.households.households.map((household) => (
            <button
              className="household-list__item"
              key={household.id}
              onClick={() => selectActiveHousehold(household)}
              type="button"
            >
              <span>
                <strong>{household.name}</strong>
                <small>{household.timezone}</small>
              </span>
              <small>{household.currency}</small>
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (onboarding.step !== 'create-household') {
    return (
      <section className="page-section onboarding-page">
        <LoadingState message="Recuperando tu progreso..." />
      </section>
    );
  }

  return (
    <section
      className="page-section onboarding-page"
      aria-labelledby="onboarding-title"
    >
      <OnboardingProgress currentStep={1} />
      <form
        className="auth-form onboarding-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <fieldset className="onboarding-form__fields">
          <legend>Datos del hogar</legend>
          <div className="form-field">
            <label htmlFor="household-name">Nombre del hogar</label>
            <input
              autoComplete="organization"
              id="household-name"
              type="text"
              {...register('name')}
              aria-describedby={
                errors.name ? 'household-name-error' : undefined
              }
              aria-invalid={errors.name ? 'true' : 'false'}
            />
            {errors.name ? (
              <p className="form-field__error" id="household-name-error">
                {errors.name.message}
              </p>
            ) : null}
          </div>
          <div className="form-field">
            <label htmlFor="household-timezone">Zona horaria</label>
            <input
              id="household-timezone"
              type="text"
              {...register('timezone')}
              aria-describedby={
                errors.timezone ? 'household-timezone-error' : undefined
              }
              aria-invalid={errors.timezone ? 'true' : 'false'}
            />
            {errors.timezone ? (
              <p className="form-field__error" id="household-timezone-error">
                {errors.timezone.message}
              </p>
            ) : null}
          </div>
          <div className="form-field">
            <label htmlFor="household-currency">Moneda</label>
            <select
              id="household-currency"
              {...register('currency')}
              aria-describedby={
                errors.currency ? 'household-currency-error' : undefined
              }
              aria-invalid={errors.currency ? 'true' : 'false'}
            >
              <option value="ARS">Peso argentino (ARS)</option>
              <option value="USD">Dólar estadounidense (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
            {errors.currency ? (
              <p className="form-field__error" id="household-currency-error">
                {errors.currency.message}
              </p>
            ) : null}
          </div>
        </fieldset>
        <button
          className="button button--primary auth-form__submit"
          disabled={isCreatingHousehold}
          type="submit"
        >
          {isCreatingHousehold ? 'Creando hogar...' : 'Crear hogar'}
        </button>
      </form>
      {createHouseholdError ? (
        <p className="auth-error" role="alert">
          {getErrorMessage(
            createHouseholdError,
            'No se pudo crear el hogar. Inténtalo nuevamente.',
          )}
        </p>
      ) : null}
    </section>
  );
}

function OnboardingProgress({ currentStep }: { currentStep: 1 | 2 }) {
  return (
    <ol className="onboarding-progress" aria-label="Progreso de configuración">
      <li
        aria-current={currentStep === 1 ? 'step' : undefined}
        className={currentStep === 1 ? 'is-current' : 'is-complete'}
      >
        <span>1</span>
        <small>Hogar</small>
      </li>
      <li
        aria-current={currentStep === 2 ? 'step' : undefined}
        className={currentStep === 2 ? 'is-current' : undefined}
      >
        <span>2</span>
        <small>Perfil</small>
      </li>
    </ol>
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error
    ? error.message.replace('respondio', 'respondió')
    : fallback;
}
