import { Check } from 'lucide-react';

export type PreparationStep =
  | 'ingredients'
  | 'weight'
  | 'portions'
  | 'leftover';

const steps: Array<{ id: PreparationStep; label: string }> = [
  { id: 'ingredients', label: 'Ingredientes' },
  { id: 'weight', label: 'Peso final' },
  { id: 'portions', label: 'Porciones' },
  { id: 'leftover', label: 'Sobrante' },
];

export function PreparationProgress({ current }: { current: PreparationStep }) {
  const currentIndex = steps.findIndex((step) => step.id === current);

  return (
    <nav className="preparation-progress" aria-label="Progreso de la preparación">
      <ol>
        {steps.map((step, index) => {
          const complete = index < currentIndex;
          return (
            <li
              className={complete ? 'is-complete' : index === currentIndex ? 'is-current' : ''}
              key={step.id}
              aria-current={index === currentIndex ? 'step' : undefined}
            >
              <span aria-hidden="true">
                {complete ? <Check size={14} /> : index + 1}
              </span>
              {step.label}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
