import type { HTMLAttributes, ReactNode } from 'react';

export function Badge({
  children,
  className = '',
  tone = 'neutral',
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: 'neutral' | 'positive' | 'warning' | 'danger';
}) {
  return (
    <span className={`badge badge--${tone} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
