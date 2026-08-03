import { Navigate, Outlet } from 'react-router';

import { AuthLoadingPage } from '../../modules/auth/presentation/pages/AuthLoadingPage';
import { useOnboardingStatus } from '../../modules/onboarding/presentation/hooks/useOnboardingStatus';

export function RequireCompletedOnboarding() {
  const { error, isError, isLoading, step } = useOnboardingStatus();

  if (isLoading) {
    return <AuthLoadingPage />;
  }

  if (isError) {
    return (
      <section
        className="page-section"
        aria-labelledby="onboarding-gate-error-title"
      >
        <p className="eyebrow">Area familiar</p>
        <h1 id="onboarding-gate-error-title">No pudimos preparar tu espacio</h1>
        <p className="lead" role="alert">
          {error instanceof Error
            ? error.message
            : 'No se pudo conectar con la API de NutriHogar.'}
        </p>
      </section>
    );
  }

  if (step !== 'ready') {
    return <Navigate replace to="/onboarding" />;
  }

  return <Outlet />;
}
