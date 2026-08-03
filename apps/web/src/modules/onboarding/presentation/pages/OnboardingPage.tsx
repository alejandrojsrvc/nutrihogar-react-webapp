import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import '../../../households/presentation/households.css';
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
      // El error de la mutacion se muestra debajo del formulario.
    }
  };

  if (onboarding.isLoading) {
    return (
      <section
        className="page-section"
        aria-labelledby="onboarding-loading-title"
      >
        <p className="eyebrow">Primeros pasos</p>
        <h1 id="onboarding-loading-title">Estamos preparando tu hogar</h1>
        <p className="lead" role="status">
          Consultando los hogares asociados a tu cuenta...
        </p>
      </section>
    );
  }

  if (onboarding.isError) {
    return (
      <section
        className="page-section"
        aria-labelledby="onboarding-error-title"
      >
        <p className="eyebrow">Primeros pasos</p>
        <h1 id="onboarding-error-title">No pudimos cargar tus hogares</h1>
        <p className="lead" role="alert">
          {getErrorMessage(
            onboarding.error,
            'No se pudo conectar con la API de NutriHogar.',
          )}
        </p>
      </section>
    );
  }

  if (onboarding.step === 'select-household') {
    return (
      <section
        className="page-section"
        aria-labelledby="household-select-title"
      >
        <p className="eyebrow">Primeros pasos</p>
        <h1 id="household-select-title">Elige un hogar para continuar</h1>
        <p className="lead">
          Selecciona el espacio familiar donde quieres configurar tu perfil.
        </p>
        <div className="household-list" role="list">
          {onboarding.households.households.map((household) => (
            <button
              className="household-list__item"
              key={household.id}
              onClick={() => selectActiveHousehold(household)}
              type="button"
            >
              <span>{household.name}</span>
              <small>{household.currency}</small>
            </button>
          ))}
        </div>
      </section>
    );
  }

  if (onboarding.step !== 'create-household') {
    return (
      <section
        className="page-section"
        aria-labelledby="onboarding-continue-title"
      >
        <p className="eyebrow">Primeros pasos</p>
        <h1 id="onboarding-continue-title">Estamos preparando tu espacio</h1>
        <p className="lead" role="status">
          Recuperando tu progreso...
        </p>
      </section>
    );
  }

  return (
    <section className="page-section" aria-labelledby="onboarding-title">
      <p className="eyebrow">Primeros pasos</p>
      <h1 id="onboarding-title">Crea tu hogar</h1>
      <p className="lead">
        Empieza con un espacio compartido para organizar la alimentacion y el
        bienestar de tu familia.
      </p>
      <form
        className="auth-form household-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="form-field">
          <label htmlFor="household-name">Nombre del hogar</label>
          <input
            autoComplete="organization"
            id="household-name"
            type="text"
            {...register('name')}
            aria-invalid={errors.name ? 'true' : 'false'}
          />
          {errors.name ? (
            <p className="form-field__error">{errors.name.message}</p>
          ) : null}
        </div>
        <div className="form-field">
          <label htmlFor="household-timezone">Zona horaria</label>
          <input
            id="household-timezone"
            type="text"
            {...register('timezone')}
            aria-invalid={errors.timezone ? 'true' : 'false'}
          />
          {errors.timezone ? (
            <p className="form-field__error">{errors.timezone.message}</p>
          ) : null}
        </div>
        <div className="form-field">
          <label htmlFor="household-currency">Moneda</label>
          <select
            id="household-currency"
            {...register('currency')}
            aria-invalid={errors.currency ? 'true' : 'false'}
          >
            <option value="ARS">Peso argentino (ARS)</option>
            <option value="USD">Dolar estadounidense (USD)</option>
            <option value="EUR">Euro (EUR)</option>
          </select>
          {errors.currency ? (
            <p className="form-field__error">{errors.currency.message}</p>
          ) : null}
        </div>
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
            'No se pudo crear el hogar. Intentalo nuevamente.',
          )}
        </p>
      ) : null}
    </section>
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
