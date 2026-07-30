import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import {
  createHouseholdFormSchema,
  getDefaultTimezone,
  type CreateHouseholdFormValues,
} from '../../../households/presentation/schemas/householdSchemas';

export function OnboardingPage() {
  const navigate = useNavigate();
  const {
    createHousehold,
    createHouseholdError,
    households,
    isCreatingHousehold,
    isError,
    isPending,
    error: householdsError,
  } = useHouseholds();
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
    if (!isPending && !isError && households.length > 0) {
      navigate('/app', { replace: true });
    }
  }, [households.length, isError, isPending, navigate]);

  const onSubmit: SubmitHandler<CreateHouseholdFormValues> = async (values) => {
    try {
      await createHousehold({
        currency: values.currency,
        name: values.name.trim(),
        timezone: values.timezone.trim(),
      });
      navigate('/app', { replace: true });
    } catch {
      // El error de la mutacion se muestra debajo del formulario.
    }
  };

  if (isPending) {
    return (
      <section className="page-section" aria-labelledby="onboarding-loading-title">
        <p className="eyebrow">Primeros pasos</p>
        <h1 id="onboarding-loading-title">Estamos preparando tu hogar</h1>
        <p className="lead" role="status">
          Consultando los hogares asociados a tu cuenta...
        </p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="page-section" aria-labelledby="onboarding-error-title">
        <p className="eyebrow">Primeros pasos</p>
        <h1 id="onboarding-error-title">No pudimos cargar tus hogares</h1>
        <p className="lead" role="alert">
          {getErrorMessage(
            householdsError,
            'No se pudo conectar con la API de NutriHogar.',
          )}
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
