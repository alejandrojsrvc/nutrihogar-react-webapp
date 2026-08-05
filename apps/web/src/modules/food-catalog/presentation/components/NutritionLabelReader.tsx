import { ScanText, Upload } from 'lucide-react';
import { useRef, useState, type DragEvent } from 'react';

import '../food-catalog.css';

const acceptedLabelFile = (file: File) =>
  file.type.startsWith('image/') || file.type === 'application/pdf';

export function NutritionLabelReader({
  error,
  isPending,
  onFile,
}: {
  error?: string | null;
  isPending: boolean;
  onFile: (file: File) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  function handleFiles(files: FileList | File[] | null) {
    const file = files?.[0];
    if (!file) {
      return;
    }

    if (!acceptedLabelFile(file)) {
      setLocalError('Elegí una foto o un PDF de la etiqueta del envase.');
      return;
    }

    setLocalError(null);
    onFile(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  const visibleError = localError ?? error;

  return (
    <div
      className={`nutrition-label-reader${isDragging ? ' is-dragging' : ''}`}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="nutrition-label-reader__text">
        <strong id="nutrition-label-reader-title">
          ¿Tenés la etiqueta del envase?
        </strong>
        <p>Subí una foto o el PDF y revisá los datos antes de guardar.</p>
      </div>
      <div className="nutrition-label-reader__actions">
        <button
          className="button button--secondary"
          disabled={isPending}
          onClick={() => fileInput.current?.click()}
          type="button"
        >
          <ScanText aria-hidden="true" size={18} />
          {isPending ? 'Leyendo etiqueta...' : 'Elegir foto o PDF'}
        </button>
        <span className="nutrition-label-reader__hint">
          <Upload aria-hidden="true" size={16} />
          o arrastrala hasta acá
        </span>
      </div>
      <input
        aria-label="Archivo de etiqueta nutricional"
        accept="image/*,application/pdf"
        className="visually-hidden"
        onChange={(event) => {
          const files = event.target.files ? [...event.target.files] : null;
          event.target.value = '';
          handleFiles(files);
        }}
        ref={fileInput}
        type="file"
      />
      {visibleError ? (
        <p className="food-form-error nutrition-label-reader__error" role="alert">
          {visibleError}
        </p>
      ) : null}
    </div>
  );
}
