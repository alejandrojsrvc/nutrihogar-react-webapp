import type { ReactNode } from 'react';

export function PageHeader({
  title,
  titleId,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  titleId?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <h1 id={titleId}>{title}</h1>
        {description ? <p className="lead">{description}</p> : null}
      </div>
      {action ? <div className="page-header__action">{action}</div> : null}
    </header>
  );
}
