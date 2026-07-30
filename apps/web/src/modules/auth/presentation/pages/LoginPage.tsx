import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';

import { useAuth } from '../providers/useAuth';
import { getAuthRedirectPath } from '../utils/authRedirect';
import {
  loginFormSchema,
  type LoginFormValues,
} from '../schemas/emailAuthSchemas';

export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { error, isSigningIn, loginWithEmail } = useAuth();
  const redirectPath = getAuthRedirectPath(location.state);
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    if (await loginWithEmail(values)) {
      navigate(redirectPath);
    }
  };

  return (
    <section className="welcome-panel" aria-labelledby="login-title">
      <p className="eyebrow">Tu alimentacion, en familia</p>
      <h1 id="login-title">Bienvenido a NutriHogar</h1>
      <p className="lead">
        Un espacio simple para organizar la nutricion y el bienestar de tu
        hogar.
      </p>
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-field">
          <label htmlFor="login-email">Correo electronico</label>
          <input
            autoComplete="email"
            id="login-email"
            type="email"
            {...register('email')}
            aria-invalid={errors.email ? 'true' : 'false'}
          />
          {errors.email ? (
            <p className="form-field__error">{errors.email.message}</p>
          ) : null}
        </div>
        <div className="form-field">
          <label htmlFor="login-password">Contrasena</label>
          <input
            autoComplete="current-password"
            id="login-password"
            type="password"
            {...register('password')}
            aria-invalid={errors.password ? 'true' : 'false'}
          />
          {errors.password ? (
            <p className="form-field__error">{errors.password.message}</p>
          ) : null}
        </div>
        <button
          className="button button--primary auth-form__submit"
          disabled={isSigningIn}
          type="submit"
        >
          {isSigningIn ? 'Iniciando sesion...' : 'Iniciar sesion'}
        </button>
      </form>
      {error ? (
        <p className="auth-error" role="alert">
          {error.message}
        </p>
      ) : null}
      <p className="supporting-text">
        ¿Todavia no tienes una cuenta?{' '}
        <Link
          className="auth-link"
          state={{ from: redirectPath }}
          to="/register"
        >
          Registrate
        </Link>
      </p>
    </section>
  );
}
