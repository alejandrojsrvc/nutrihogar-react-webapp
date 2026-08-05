import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'text';

function ButtonContent({
  children,
  icon,
  iconEnd,
  loading,
  loadingLabel,
}: {
  children: ReactNode;
  icon?: ReactNode;
  iconEnd?: ReactNode;
  loading: boolean;
  loadingLabel?: string;
}) {
  return (
    <>
      {loading ? (
        <span className="button__spinner" aria-hidden="true" />
      ) : (
        icon
      )}
      <span>{loading ? (loadingLabel ?? children) : children}</span>
      {loading || !iconEnd ? null : iconEnd}
    </>
  );
}

export function Button({
  children,
  className = '',
  icon,
  iconEnd,
  loading = false,
  loadingLabel,
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
  loadingLabel?: string;
  icon?: ReactNode;
  iconEnd?: ReactNode;
}) {
  const isBusy = Boolean(loading);
  return (
    <button
      {...props}
      aria-busy={isBusy || undefined}
      className={`button button--${variant} ${className}`.trim()}
      disabled={isBusy || props.disabled}
    >
      <ButtonContent
        children={children}
        icon={icon}
        iconEnd={iconEnd}
        loading={isBusy}
        loadingLabel={loadingLabel}
      />
    </button>
  );
}

export function ButtonLink({
  children,
  className = '',
  icon,
  iconEnd,
  variant = 'primary',
  ...props
}: LinkProps & {
  children: ReactNode;
  variant?: ButtonVariant;
  icon?: ReactNode;
  iconEnd?: ReactNode;
  className?: string;
}) {
  return (
    <Link
      className={`button button--${variant} ${className}`.trim()}
      {...props}
    >
      {icon}
      <span>{children}</span>
      {iconEnd}
    </Link>
  );
}
