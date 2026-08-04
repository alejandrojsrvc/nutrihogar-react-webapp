import { useId, type ReactNode } from 'react';

export function EmptyState({
  children,
  description,
  title,
}: {
  children?: ReactNode;
  description: string;
  title: string;
}) {
  const titleId = useId();

  return (
    <section className="empty-state-card" aria-labelledby={titleId}>
      <div className="empty-state-card__mark" aria-hidden="true" />
      <h2 id={titleId}>{title}</h2>
      <p>{description}</p>
      {children ? (
        <div className="empty-state-card__action">{children}</div>
      ) : null}
    </section>
  );
}
