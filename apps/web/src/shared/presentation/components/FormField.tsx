import { useId, type ReactNode } from 'react';

export function FormField({
  children,
  error,
  help,
  htmlFor,
  label,
}: {
  children: (props: {
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
  }) => ReactNode;
  error?: string;
  help?: string;
  htmlFor: string;
  label: string;
}) {
  const generatedId = useId();
  const helpId = help ? `${generatedId}-help` : undefined;
  const errorId = error ? `${generatedId}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="form-field">
      <label htmlFor={htmlFor}>{label}</label>
      {children({
        'aria-describedby': describedBy,
        'aria-invalid': Boolean(error),
      })}
      {help ? (
        <p className="form-field__help" id={helpId}>
          {help}
        </p>
      ) : null}
      {error ? (
        <p className="form-field__error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
