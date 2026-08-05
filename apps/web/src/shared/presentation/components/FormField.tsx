import {
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from 'react';

type ControlProps = {
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'false' | 'true';
  'aria-required'?: boolean;
};

export function FormField({
  children,
  error,
  help,
  htmlFor,
  label,
  required = false,
}: {
  children: ReactElement<ControlProps> | ((props: ControlProps) => ReactNode);
  error?: string;
  help?: string;
  htmlFor?: string;
  label: string;
  required?: boolean;
}) {
  const generatedId = useId();
  const child = isValidElement<ControlProps>(children) ? children : undefined;
  const childId = child?.props.id;
  const controlId = htmlFor ?? childId ?? `${generatedId}-control`;
  const helpId = help ? `${generatedId}-help` : undefined;
  const errorId = error ? `${generatedId}-error` : undefined;
  const describedBy =
    [child?.props['aria-describedby'], helpId, errorId]
      .filter(Boolean)
      .join(' ') || undefined;
  const controlProps: ControlProps = {
    id: controlId,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : undefined,
    'aria-required': required || undefined,
  };

  return (
    <div className="form-field">
      <label htmlFor={controlId}>
        {label}
        {required ? ' *' : ''}
      </label>
      {typeof children === 'function'
        ? children(controlProps)
        : cloneElement(children, controlProps)}
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
