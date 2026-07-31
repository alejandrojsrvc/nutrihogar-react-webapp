import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function IconButton({
  'aria-label': ariaLabel,
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  'aria-label': string;
  children: ReactNode;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className={`icon-button ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
