import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  titleId,
  description,
  action,
  icon,
}: {
  eyebrow?: string;
  title: string;
  titleId?: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="page-header__identity">
        {icon ? <span className="page-header__icon" aria-hidden="true">{icon}</span> : null}
        <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 id={titleId}>{title}</h1>
        {description ? <p className="lead">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="page-header__action">{action}</div> : null}
    </header>
  );
}
