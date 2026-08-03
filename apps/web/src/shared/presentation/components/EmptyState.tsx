import type { ReactNode } from 'react';

export function EmptyState({
  children,
  description,
  title,
}: {
  children?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="empty-state-card" aria-labelledby="empty-state-title">
      <div className="empty-state-card__mark" aria-hidden="true" />
      <h2 id="empty-state-title">{title}</h2>
      <p>{description}</p>
      {children ? (
        <div className="empty-state-card__action">{children}</div>
      ) : null}
    </section>
  );
}
