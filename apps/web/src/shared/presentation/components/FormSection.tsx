import type { ReactNode } from 'react';

export function FormSection({ children, description, legend }: { children: ReactNode; description?: string; legend: string }) {
  return (
    <fieldset className="form-section">
      <legend>{legend}</legend>
      {description ? <p className="form-section__description">{description}</p> : null}
      <div className="form-section__content">{children}</div>
    </fieldset>
  );
}
