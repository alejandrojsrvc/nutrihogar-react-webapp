import type { ReactNode } from 'react';

export function RelatedActions({
  children,
  label = 'Acciones relacionadas',
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <nav className="meal-planning__related-actions" aria-label={label}>
      <span>También puedes</span>
      <div>{children}</div>
    </nav>
  );
}
