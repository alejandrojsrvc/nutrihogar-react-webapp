import { useAuth } from '../providers/useAuth';

export function LoginPage() {
  const { error, isSigningIn, loginWithGoogle } = useAuth();

  return (
    <section className="welcome-panel" aria-labelledby="login-title">
      <p className="eyebrow">Tu alimentacion, en familia</p>
      <h1 id="login-title">Bienvenido a NutriHogar</h1>
      <p className="lead">
        Un espacio simple para organizar la nutricion y el bienestar de tu
        hogar.
      </p>
      <button
        className="button button--primary"
        disabled={isSigningIn}
        onClick={() => void loginWithGoogle()}
        type="button"
      >
        {isSigningIn ? 'Conectando con Google...' : 'Continuar con Google'}
      </button>
      {error ? (
        <p className="auth-error" role="alert">
          {error.message}
        </p>
      ) : null}
      <p className="supporting-text">
        Usaremos Google para mantener segura tu cuenta y tu hogar.
      </p>
    </section>
  );
}
