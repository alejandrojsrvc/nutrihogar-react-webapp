import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useEffect, useId, useRef, type ReactNode } from 'react';

interface OverlayProps {
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
  description?: string;
  footer?: ReactNode;
  closeDisabled?: boolean;
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

export function FullscreenDialog({
  children,
  closeDisabled = false,
  description,
  footer,
  onClose,
  open,
  title,
}: OverlayProps) {
  return (
    <OverlayFrame
      className="overlay overlay--fullscreen"
      closeDisabled={closeDisabled}
      description={description}
      footer={footer}
      labelledByPrefix="fullscreen-dialog"
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
  description,
  footer,
  closeDisabled,
}: OverlayProps & { className: string; labelledByPrefix: string }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusable = getFocusableElements(panel);
    (focusable[0] ?? panel)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (!closeDisabled) onClose();
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
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [closeDisabled, onClose, open]);

  if (!open) return null;

  const content = (
    <div
      className={className}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !closeDisabled) onClose();
      }}
      role="presentation"
    >
      <div
        aria-labelledby={`${labelledByPrefix}-${titleId}`}
        aria-describedby={
          description ? `${labelledByPrefix}-${descriptionId}` : undefined
        }
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
            disabled={closeDisabled}
            type="button"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {description ? (
          <p
            className="overlay__description"
            id={`${labelledByPrefix}-${descriptionId}`}
          >
            {description}
          </p>
        ) : null}
        <div className="overlay__content">{children}</div>
        {footer ? <div className="overlay__footer">{footer}</div> : null}
      </div>
    </div>
  );
  return createPortal(content, document.body);
}

function getFocusableElements(container: HTMLElement | null) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
    ),
  );
}
