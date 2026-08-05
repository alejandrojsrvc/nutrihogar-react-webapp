import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeTone =
  | 'neutral'
  | 'positive'
  | 'warning'
  | 'danger'
  | 'info'
  | 'brand';

export function Badge({
  children,
  className = '',
  dot = false,
  icon,
  tone = 'neutral',
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  icon?: ReactNode;
}) {
  return (
    <span className={`badge badge--${tone} ${className}`.trim()} {...props}>
      {dot ? <span className="badge__dot" aria-hidden="true" /> : null}
      {icon ? (
        <span className="badge__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  );
}
