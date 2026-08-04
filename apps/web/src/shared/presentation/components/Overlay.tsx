import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

interface OverlayProps {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
}

export function Dialog({ children, onClose, open, title }: OverlayProps) {
  return (
    <OverlayFrame
      className="overlay overlay--dialog"
      labelledByPrefix="dialog"
      onClose={onClose}
      open={open}
      title={title}
    >
      {children}
    </OverlayFrame>
  );
}

export function BottomSheet({ children, onClose, open, title }: OverlayProps) {
  return (
    <OverlayFrame
      className="overlay overlay--bottom-sheet"
      labelledByPrefix="bottom-sheet"
      onClose={onClose}
      open={open}
      title={title}
    >
      {children}
    </OverlayFrame>
  );
}

export function Drawer({ children, onClose, open, title }: OverlayProps) {
  return (
    <OverlayFrame
      className="overlay overlay--drawer"
      labelledByPrefix="drawer"
      onClose={onClose}
      open={open}
      title={title}
    >
      {children}
    </OverlayFrame>
  );
}

function OverlayFrame({
  children,
  className,
  labelledByPrefix,
  onClose,
  open,
  title,
}: OverlayProps & { className: string; labelledByPrefix: string }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusable = getFocusableElements(panel);
    (focusable[0] ?? panel)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const elements = getFocusableElements(panelRef.current);
      if (!elements.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      restoreFocusRef.current?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className={className}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        aria-labelledby={`${labelledByPrefix}-${titleId}`}
        aria-modal="true"
        className="overlay__panel"
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="overlay__header">
          <h2 id={`${labelledByPrefix}-${titleId}`}>{title}</h2>
          <button
            aria-label={`Cerrar ${title.toLowerCase()}`}
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="overlay__content">{children}</div>
      </div>
    </div>
  );
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    ),
  );
}
