import type { CSSProperties } from 'react';

export type ProgressTone =
  | 'primary'
  | 'protein'
  | 'carbohydrates'
  | 'fat'
  | 'fiber';

export function ProgressBar({
  ariaHidden = false,
  goal,
  goalLabel,
  label,
  size = 'md',
  tone = 'primary',
  value,
  valueLabel,
}: {
  ariaHidden?: boolean;
  goal: number;
  goalLabel?: string;
  label: string;
  size?: 'sm' | 'md';
  tone?: ProgressTone;
  value: number;
  valueLabel?: string;
}) {
  const percent = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  const clamped = Math.min(value, goal);
  return (
    <div
      aria-hidden={ariaHidden || undefined}
      aria-label={
        ariaHidden
          ? undefined
          : `${label}: ${valueLabel ?? value} de ${goalLabel ?? goal}`
      }
      aria-valuemax={ariaHidden ? undefined : goal}
      aria-valuemin={ariaHidden ? undefined : 0}
      aria-valuenow={ariaHidden ? undefined : Math.max(clamped, 0)}
      className={`progress-bar progress-bar--${tone} progress-bar--${size}`}
      role={ariaHidden ? undefined : 'progressbar'}
    >
      <div className="progress-bar__track">
        <span
          className="progress-bar__fill"
          style={{ '--progress-bar-fill': `${percent}%` } as CSSProperties}
        />
      </div>
    </div>
  );
}
