import type { HTMLAttributes, ReactNode } from 'react';

export function Surface({
  children,
  className = '',
  tone = 'default',
  ...props
}: HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  tone?: 'default' | 'muted' | 'accent' | 'dark';
}) {
  return (
    <section className={`surface surface--${tone} ${className}`.trim()} {...props}>
      {children}
    </section>
  );
}
