import type { ReactNode } from 'react';

export function ActionBar({
  ariaLabel = 'Acciones',
  primary,
  secondary,
  stickyOnMobile = true,
}: {
  ariaLabel?: string;
  primary: ReactNode;
  secondary?: ReactNode;
  stickyOnMobile?: boolean;
}) {
  return (
    <div aria-label={ariaLabel} className={`action-bar${stickyOnMobile ? ' action-bar--sticky-mobile' : ''}`} role="group">
      {secondary ? <div className="action-bar__secondary">{secondary}</div> : null}
      <div className="action-bar__primary">{primary}</div>
    </div>
  );
}
