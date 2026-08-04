import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';

import { useAuth } from '../providers/useAuth';
import { getAuthRedirectPath } from '../utils/authRedirect';
import {
  registerFormSchema,
  type RegisterFormValues,
} from '../schemas/emailAuthSchemas';
import { FormField } from '../../../../shared/presentation/components/FormField';

export function RegisterPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { error, isSigningIn, registerWithEmail } = useAuth();
  const redirectPath = getAuthRedirectPath(location.state);
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (values) => {
    const result = await registerWithEmail({
      email: values.email,
      fullName: values.fullName,
      password: values.password,
    });

    if (!result) {
      return;
    }

    if (result.requiresEmailConfirmation) {
      navigate('/auth/revisa-tu-correo', { state: { from: redirectPath } });
      return;
    }

    navigate(redirectPath);
  };

  return (
    <section className="welcome-panel" aria-labelledby="register-title">
      <p className="eyebrow">Un hogar para empezar</p>
      <h1 id="register-title">Crea tu cuenta</h1>
      <p className="lead">
        Registra tus datos para comenzar a cuidar la alimentación de tu hogar.
      </p>
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField
          error={errors.fullName?.message}
          htmlFor="register-full-name"
          label="Nombre completo"
        >
          {(fieldProps) => (
            <input
              autoComplete="name"
              id="register-full-name"
              type="text"
              {...register('fullName')}
              {...fieldProps}
            />
          )}
        </FormField>
        <FormField
          error={errors.email?.message}
          htmlFor="register-email"
          label="Correo electrónico"
        >
          {(fieldProps) => (
            <input
              autoComplete="email"
              id="register-email"
              type="email"
              {...register('email')}
              {...fieldProps}
            />
          )}
        </FormField>
        <FormField
          error={errors.password?.message}
          help="Usa al menos ocho caracteres."
          htmlFor="register-password"
          label="Contraseña"
        >
          {(fieldProps) => (
            <input
              autoComplete="new-password"
              id="register-password"
              type="password"
              {...register('password')}
              {...fieldProps}
            />
          )}
        </FormField>
        <FormField
          error={errors.confirmPassword?.message}
          htmlFor="register-confirm-password"
          label="Repite la contraseña"
        >
          {(fieldProps) => (
            <input
              autoComplete="new-password"
              id="register-confirm-password"
              type="password"
              {...register('confirmPassword')}
              {...fieldProps}
            />
          )}
        </FormField>
        <button
          className="button button--primary auth-form__submit"
          aria-busy={isSigningIn}
          disabled={isSigningIn}
          type="submit"
        >
          {isSigningIn ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>
      {error ? (
        <p className="auth-error" role="alert">
          No pudimos crear la cuenta. Conservamos tus datos para que lo intentes
          nuevamente.
        </p>
      ) : null}
      <p className="supporting-text">
        ¿Ya tienes una cuenta?{' '}
        <Link className="auth-link" state={{ from: redirectPath }} to="/login">
          Inicia sesión
        </Link>
      </p>
    </section>
  );
}
