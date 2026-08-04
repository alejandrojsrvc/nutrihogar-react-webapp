import type { ReactNode } from 'react';

export function LoadingState({
  message = 'Cargando información...',
}: {
  message?: string;
}) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <p>{message}</p>
    </div>
  );
}

export function ErrorState({
  action,
  message = 'No pudimos cargar esta información.',
}: {
  action?: ReactNode;
  message?: string;
}) {
  return (
    <div className="error-state" role="alert">
      <p>{message}</p>
      {action}
    </div>
  );
}

export function ConnectionNotice({ message }: { message: string }) {
  return (
    <p className="connection-feedback" role="status" aria-live="polite">
      {message}
    </p>
  );
}
