import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

import { useAuth } from '../providers/useAuth';
import {
  registerFormSchema,
  type RegisterFormValues,
} from '../schemas/emailAuthSchemas';

export function RegisterPage() {
  const navigate = useNavigate();
  const { error, isSigningIn, registerWithEmail } = useAuth();
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
      navigate('/auth/revisa-tu-correo');
      return;
    }

    navigate('/onboarding');
  };

  return (
    <section className="welcome-panel" aria-labelledby="register-title">
      <p className="eyebrow">Un hogar para empezar</p>
      <h1 id="register-title">Crea tu cuenta</h1>
      <p className="lead">
        Registra tus datos para comenzar a cuidar la alimentacion de tu hogar.
      </p>
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-field">
          <label htmlFor="register-full-name">Nombre completo</label>
          <input
            autoComplete="name"
            id="register-full-name"
            type="text"
            {...register('fullName')}
            aria-invalid={errors.fullName ? 'true' : 'false'}
          />
          {errors.fullName ? (
            <p className="form-field__error">{errors.fullName.message}</p>
          ) : null}
        </div>
        <div className="form-field">
          <label htmlFor="register-email">Correo electronico</label>
          <input
            autoComplete="email"
            id="register-email"
            type="email"
            {...register('email')}
            aria-invalid={errors.email ? 'true' : 'false'}
          />
          {errors.email ? (
            <p className="form-field__error">{errors.email.message}</p>
          ) : null}
        </div>
        <div className="form-field">
          <label htmlFor="register-password">Contrasena</label>
          <input
            autoComplete="new-password"
            id="register-password"
            type="password"
            {...register('password')}
            aria-invalid={errors.password ? 'true' : 'false'}
          />
          {errors.password ? (
            <p className="form-field__error">{errors.password.message}</p>
          ) : null}
        </div>
        <div className="form-field">
          <label htmlFor="register-confirm-password">
            Repite la contrasena
          </label>
          <input
            autoComplete="new-password"
            id="register-confirm-password"
            type="password"
            {...register('confirmPassword')}
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
          />
          {errors.confirmPassword ? (
            <p className="form-field__error">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>
        <button
          className="button button--primary auth-form__submit"
          disabled={isSigningIn}
          type="submit"
        >
          {isSigningIn ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>
      {error ? (
        <p className="auth-error" role="alert">
          {error.message}
        </p>
      ) : null}
      <p className="supporting-text">
        ¿Ya tienes una cuenta?{' '}
        <Link className="auth-link" to="/login">
          Inicia sesion
        </Link>
      </p>
    </section>
  );
}
