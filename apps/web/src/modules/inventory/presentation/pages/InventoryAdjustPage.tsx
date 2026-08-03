import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, type ReactElement } from 'react';
import { useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router';

import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import '../inventory.css';
import {
  useInventoryItem,
  useAdjustInventoryItem,
  useInventorySyncStatus,
} from '../hooks/useInventory';
import {
  adjustInventorySchema,
  type AdjustInventoryValues,
  formatDateInput,
  parseDateInput,
} from '../schemas/inventorySchemas';

export function InventoryAdjustPage() {
  const { inventoryItemId } = useParams<{ inventoryItemId: string }>();
  const navigate = useNavigate();
  const households = useHouseholds();
  const item = useInventoryItem(inventoryItemId);
  const syncStatus = useInventorySyncStatus(households.activeHousehold?.id);
  const adjust = useAdjustInventoryItem();
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<AdjustInventoryValues>({
    defaultValues: { occurredAt: '', quantity: '', reason: '', unit: 'GRAM' },
    resolver: zodResolver(adjustInventorySchema),
  });
  const quantity = useWatch({ control, name: 'quantity' });

  useEffect(() => {
    if (item.data)
      reset({
        occurredAt: formatDateInput(new Date().toISOString()),
        quantity: String(item.data.currentQuantity),
        reason: '',
        unit: item.data.unit,
      });
  }, [item.data, reset]);

  if (households.isPending || item.isPending)
    return (
      <p className="page-section" role="status">
        Cargando ajuste...
      </p>
    );
  if (
    households.isError ||
    !households.activeHousehold ||
    item.isError ||
    !item.data
  )
    return (
      <section className="page-section" role="alert">
        <p>No se pudo cargar la existencia.</p>
        <Link className="button button--secondary" to="/app/inventario">
          Volver al inventario
        </Link>
      </section>
    );

  const current = item.data;
  const difference =
    quantity.trim() === '' ? null : Number(quantity) - current.currentQuantity;
  const largeAdjustment =
    difference != null &&
    Math.abs(difference) > Math.max(current.currentQuantity * 0.5, 1000);

  const onSubmit: SubmitHandler<AdjustInventoryValues> = async (values) => {
    if (!inventoryItemId || !households.activeHousehold) return;
    if (
      largeAdjustment &&
      !window.confirm(
        'Este ajuste cambia mucho la cantidad disponible. ¿Quieres continuar?',
      )
    )
      return;
    try {
      await adjust.mutateAsync({
        householdId: households.activeHousehold.id,
        input: {
          occurredAt: parseDateInput(values.occurredAt) ?? undefined,
          quantity: Number(values.quantity),
          reason: values.reason.trim(),
          unit: values.unit,
        },
        item: current,
      });
      navigate(`/app/inventario/${current.id}`, {
        replace: true,
        state: { inventoryAdjusted: true },
      });
    } catch {
      // El error se muestra debajo del formulario.
    }
  };

  return (
    <section
      className="page-section inventory-form-page"
      aria-labelledby="inventory-adjust-title"
    >
      <BackButton fallback={`/app/inventario/${current.id}`} />
      <p className="eyebrow">Ajustar existencia</p>
      <h1 id="inventory-adjust-title">{current.name}</h1>
      <p className="lead">
        El ajuste crea un movimiento de inventario; no edita el saldo
        directamente.
      </p>
      {!syncStatus.data?.isOnline ? (
        <p className="inventory-offline-note" role="status">
          Sin conexión: el ajuste quedará pendiente de sincronización.
        </p>
      ) : null}
      <dl className="inventory-current-summary">
        <div>
          <dt>Cantidad actual</dt>
          <dd>{formatQuantity(current.currentQuantity, current.unit)}</dd>
        </div>
        <div>
          <dt>Unidad</dt>
          <dd>{formatUnit(current.unit)}</dd>
        </div>
      </dl>
      <form
        className="inventory-form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <Field
          error={errors.quantity?.message}
          id="inventory-adjust-quantity"
          label="Nueva cantidad *"
        >
          <input
            id="inventory-adjust-quantity"
            inputMode="decimal"
            min="0"
            step="any"
            type="number"
            {...register('quantity')}
          />
        </Field>
        <Field
          error={errors.unit?.message}
          id="inventory-adjust-unit"
          label="Unidad *"
        >
          <select id="inventory-adjust-unit" {...register('unit')}>
            <option value="GRAM">Gramos (g)</option>
            <option value="MILLILITER">Mililitros (ml)</option>
            <option value="UNIT">Unidades</option>
          </select>
        </Field>
        <Field
          error={errors.occurredAt?.message}
          id="inventory-adjust-date"
          label="Fecha"
        >
          <input
            id="inventory-adjust-date"
            type="datetime-local"
            {...register('occurredAt')}
          />
        </Field>
        <Field
          error={errors.reason?.message}
          id="inventory-adjust-reason"
          label="Razón del ajuste *"
        >
          <textarea
            id="inventory-adjust-reason"
            placeholder="Ej. Conteo semanal"
            {...register('reason')}
          />
        </Field>
        <p className="inventory-difference" aria-live="polite">
          Diferencia:{' '}
          <strong>
            {difference == null
              ? 'Completa la cantidad'
              : `${difference > 0 ? '+' : ''}${formatQuantity(difference, current.unit)}`}
          </strong>
        </p>
        <div className="inventory-form-actions">
          <Link
            className="button button--secondary"
            to={`/app/inventario/${current.id}`}
          >
            Cancelar
          </Link>
          <button
            className="button button--primary"
            disabled={adjust.isPending}
            type="submit"
          >
            {adjust.isPending ? 'Guardando...' : 'Confirmar ajuste'}
          </button>
        </div>
      </form>
      {adjust.error ? (
        <p className="form-field__error" role="alert">
          {adjust.error instanceof Error
            ? adjust.error.message
            : 'No se pudo guardar el ajuste.'}
        </p>
      ) : null}
    </section>
  );
}

function Field({
  children,
  error,
  id,
  label,
}: {
  children: ReactElement;
  error?: string;
  id: string;
  label: string;
}) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? <p className="form-field__error">{error}</p> : null}
    </div>
  );
}

function formatUnit(unit: string) {
  return unit === 'GRAM'
    ? 'Gramos (g)'
    : unit === 'MILLILITER'
      ? 'Mililitros (ml)'
      : 'Unidades';
}
function formatQuantity(quantity: number, unit: string) {
  return `${quantity > 0 ? quantity : quantity} ${unit === 'GRAM' ? 'g' : unit === 'MILLILITER' ? 'ml' : 'un.'}`;
}
