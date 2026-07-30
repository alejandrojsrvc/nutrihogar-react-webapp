import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router';

import { useAuth } from '../../../auth/presentation/providers/useAuth';
import { useHouseholds } from '../hooks/useHouseholds';
import { useAdultProfiles } from '../hooks/useAdultProfiles';
import type {
  ActivityLevel,
  BiologicalSex,
  PrimaryGoal,
} from '../../application/ports/AdultProfileGateway';
import {
  createAdultProfileFormSchema,
  type CreateAdultProfileFormValues,
} from '../schemas/adultProfileSchemas';

export function AdultProfilePage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const households = useHouseholds();
  const profiles = useAdultProfiles(households.activeHousehold?.id);
  const currentProfile = profiles.profiles.find(
    (profile) => profile.userId === session?.userId,
  );
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<CreateAdultProfileFormValues>({
    defaultValues: {
      activityLevel: '',
      birthDate: '',
      biologicalSex: '',
      hasKitchenScale: false,
      heightCm: '',
      name: '',
      primaryGoal: '',
    },
    resolver: zodResolver(createAdultProfileFormSchema),
  });

  if (households.isPending) {
    return <ProfileStatus message="Cargando tu hogar..." />;
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
        <p className="eyebrow">Perfil adulto</p>
        <h1 id="profile-select-title">Selecciona un hogar</h1>
        <p className="lead">
          Primero elige el hogar donde quieres configurar tu perfil.
        </p>
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
    return <ProfileStatus message="No se pudieron cargar los perfiles." isError />;
  }

  if (currentProfile) {
    return (
      <section className="page-section" aria-labelledby="profile-title">
        <p className="eyebrow">Perfil adulto</p>
        <h1 id="profile-title">Tu perfil ya esta configurado</h1>
        <div className="profile-card">
          <h2>{currentProfile.name}</h2>
          <p>
            {currentProfile.heightCm} cm · {formatPrimaryGoal(currentProfile.primaryGoal)}
          </p>
        </div>
        <Link className="button button--secondary" to="/app">
          Volver al inicio
        </Link>
      </section>
    );
  }

  const onSubmit: SubmitHandler<CreateAdultProfileFormValues> = async (
    values,
  ) => {
    try {
      await profiles.createAdultProfile({
        activityLevel: values.activityLevel as ActivityLevel,
        birthDate: values.birthDate,
        biologicalSex: values.biologicalSex as BiologicalSex,
        hasKitchenScale: values.hasKitchenScale,
        heightCm: Number(values.heightCm),
        name: values.name.trim(),
        primaryGoal: values.primaryGoal as PrimaryGoal,
      });
      navigate('/app', {
        replace: true,
        state: { profileSaved: true },
      });
    } catch {
      // El error de la mutacion se muestra debajo del formulario.
    }
  };

  return (
    <section className="page-section" aria-labelledby="profile-title">
      <p className="eyebrow">Perfil adulto</p>
      <h1 id="profile-title">Configura tu perfil</h1>
      <p className="lead">
        Estos datos ayudaran a personalizar las recomendaciones de tu hogar.
      </p>
      <form
        className="auth-form profile-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="form-field">
          <label htmlFor="profile-name">Nombre</label>
          <input id="profile-name" type="text" {...register('name')} />
          {errors.name ? (
            <p className="form-field__error">{errors.name.message}</p>
          ) : null}
        </div>
        <div className="form-field">
          <label htmlFor="profile-birth-date">Fecha de nacimiento</label>
          <input
            id="profile-birth-date"
            type="date"
            {...register('birthDate')}
          />
          {errors.birthDate ? (
            <p className="form-field__error">{errors.birthDate.message}</p>
          ) : null}
        </div>
        <div className="form-field">
          <label htmlFor="profile-sex">Sexo biologico</label>
          <select id="profile-sex" {...register('biologicalSex')}>
            <option value="">Selecciona una opcion</option>
            <option value="FEMALE">Femenino</option>
            <option value="MALE">Masculino</option>
          </select>
          {errors.biologicalSex ? (
            <p className="form-field__error">{errors.biologicalSex.message}</p>
          ) : null}
        </div>
        <div className="form-field">
          <label htmlFor="profile-height">Altura en centimetros</label>
          <input
            id="profile-height"
            inputMode="decimal"
            type="number"
            {...register('heightCm')}
          />
          {errors.heightCm ? (
            <p className="form-field__error">{errors.heightCm.message}</p>
          ) : null}
        </div>
        <div className="form-field">
          <label htmlFor="profile-activity">Nivel de actividad</label>
          <select id="profile-activity" {...register('activityLevel')}>
            <option value="">Selecciona una opcion</option>
            <option value="SEDENTARY">Sedentario</option>
            <option value="LIGHT">Ligero</option>
            <option value="MODERATE">Moderado</option>
            <option value="HIGH">Alto</option>
            <option value="VERY_HIGH">Muy alto</option>
          </select>
          {errors.activityLevel ? (
            <p className="form-field__error">{errors.activityLevel.message}</p>
          ) : null}
        </div>
        <div className="form-field">
          <label htmlFor="profile-goal">Objetivo principal</label>
          <select id="profile-goal" {...register('primaryGoal')}>
            <option value="">Selecciona una opcion</option>
            <option value="FAT_LOSS">Perder grasa</option>
            <option value="MAINTENANCE">Mantenerme</option>
            <option value="MUSCLE_GAIN">Ganar masa muscular</option>
          </select>
          {errors.primaryGoal ? (
            <p className="form-field__error">{errors.primaryGoal.message}</p>
          ) : null}
        </div>
        <label className="checkbox-field">
          <input type="checkbox" {...register('hasKitchenScale')} />
          <span>Tengo una balanza de cocina</span>
        </label>
        <button
          className="button button--primary auth-form__submit"
          disabled={profiles.isCreatingAdultProfile}
          type="submit"
        >
          {profiles.isCreatingAdultProfile
            ? 'Guardando perfil...'
            : 'Guardar perfil'}
        </button>
      </form>
      {profiles.createAdultProfileError ? (
        <p className="auth-error" role="alert">
          {getErrorMessage(
            profiles.createAdultProfileError,
            'No se pudo guardar el perfil. Intentalo nuevamente.',
          )}
        </p>
      ) : null}
    </section>
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
    <section className="page-section" aria-labelledby="profile-status-title">
      <p className="eyebrow">Perfil adulto</p>
      <h1 id="profile-status-title">Perfil adulto</h1>
      <p className="lead" role={isError ? 'alert' : 'status'}>
        {message}
      </p>
    </section>
  );
}

function formatPrimaryGoal(goal: PrimaryGoal): string {
  const labels: Record<PrimaryGoal, string> = {
    FAT_LOSS: 'Perder grasa',
    MAINTENANCE: 'Mantenerme',
    MUSCLE_GAIN: 'Ganar masa muscular',
  };

  return labels[goal];
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
