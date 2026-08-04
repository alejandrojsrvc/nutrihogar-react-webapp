import type { ReactElement } from 'react';

import { Button } from '../../../../shared/presentation/components/Button';
import { BottomSheet } from '../../../../shared/presentation/components/Overlay';
import type { ShoppingListItemFormValues } from '../schemas/shoppingListSchemas';

export function ShoppingListEditDialog({
  draft,
  error,
  isSaving,
  onChange,
  onClose,
  onSave,
}: {
  draft: ShoppingListItemFormValues;
  error?: string;
  isSaving: boolean;
  onChange: (patch: Partial<ShoppingListItemFormValues>) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <BottomSheet onClose={onClose} open title="Editar producto">
      <div className="shopping-list-edit-form">
        <Field id="shopping-edit-name" label="Producto">
          <input
            id="shopping-edit-name"
            onChange={(event) => onChange({ name: event.target.value })}
            value={draft.name}
          />
        </Field>
        <Field id="shopping-edit-quantity" label="Cantidad">
          <input
            id="shopping-edit-quantity"
            min="0"
            onChange={(event) => onChange({ quantity: event.target.value })}
            step="any"
            type="number"
            value={draft.quantity}
          />
        </Field>
        <Field id="shopping-edit-unit" label="Unidad">
          <select
            id="shopping-edit-unit"
            onChange={(event) => onChange({ unit: event.target.value })}
            value={draft.unit}
          >
            <option value="GRAM">Gramos</option>
            <option value="MILLILITER">Mililitros</option>
            <option value="UNIT">Unidad</option>
            <option value="SERVING">Porción</option>
          </select>
        </Field>
      </div>
      {error ? (
        <p className="form-field__error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="shopping-list-sheet__actions">
        <Button onClick={onClose} variant="secondary">
          Cancelar
        </Button>
        <Button disabled={isSaving} onClick={onSave} variant="primary">
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </BottomSheet>
  );
}

function Field({
  children,
  id,
  label,
}: {
  children: ReactElement;
  id: string;
  label: string;
}) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}
