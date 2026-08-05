import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'text';

export function Button({
  children,
  className = '',
  loading = false,
  loadingLabel = 'Guardando...',
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
  loadingLabel?: string;
}) {
  return (
    <button
      className={`button button--${variant} ${className}`.trim()}
      {...props}
      aria-busy={loading || undefined}
      disabled={loading || props.disabled}
    >
      {loading ? loadingLabel : children}
    </button>
  );
}

export function ButtonLink({
  children,
  className = '',
  variant = 'primary',
  ...props
}: LinkProps & {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}) {
  return (
    <Link
      className={`button button--${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </Link>
  );
}
