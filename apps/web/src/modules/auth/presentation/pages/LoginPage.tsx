import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';

import { useAuth } from '../providers/useAuth';
import { getAuthRedirectPath } from '../utils/authRedirect';
import {
  loginFormSchema,
  type LoginFormValues,
} from '../schemas/emailAuthSchemas';
import { FormField } from '../../../../shared/presentation/components/FormField';

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
      <p className="eyebrow">Tu alimentación, en familia</p>
      <h1 id="login-title">Bienvenido a NutriHogar</h1>
      <p className="lead">
        Un espacio simple para organizar la nutrición y el bienestar de tu
        hogar.
      </p>
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField error={errors.email?.message} htmlFor="login-email" label="Correo electrónico">
          {(fieldProps) => <input autoComplete="email" id="login-email" type="email" {...register('email')} {...fieldProps} />}
        </FormField>
        <FormField error={errors.password?.message} htmlFor="login-password" label="Contraseña">
          {(fieldProps) => <input autoComplete="current-password" id="login-password" type="password" {...register('password')} {...fieldProps} />}
        </FormField>
        <button
          className="button button--primary auth-form__submit"
          aria-busy={isSigningIn}
          disabled={isSigningIn}
          type="submit"
        >
          {isSigningIn ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
      </form>
      {error ? (
        <p className="auth-error" role="alert">
          No pudimos iniciar sesión. Revisa tus datos e inténtalo nuevamente.
        </p>
      ) : null}
      <p className="supporting-text">
        ¿Todavía no tienes una cuenta?{' '}
        <Link
          className="auth-link"
          state={{ from: redirectPath }}
          to="/register"
        >
          Regístrate
        </Link>
      </p>
    </section>
  );
}
