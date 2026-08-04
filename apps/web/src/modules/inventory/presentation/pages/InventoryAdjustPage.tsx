import { zodResolver } from '@hookform/resolvers/zod';
import { Scale } from 'lucide-react';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router';

import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { Dialog } from '../../../../shared/presentation/components/Overlay';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
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
  const [pendingValues, setPendingValues] =
    useState<AdjustInventoryValues | null>(null);
  const initializedItemId = useRef<string | null>(null);
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
    if (item.data && initializedItemId.current !== item.data.id) {
      reset({
        occurredAt: formatDateInput(new Date().toISOString()),
        quantity: String(item.data.currentQuantity),
        reason: '',
        unit: item.data.unit,
      });
      initializedItemId.current = item.data.id;
    }
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
        <button
          className="button button--secondary"
          onClick={() =>
            void (households.isError || !households.activeHousehold
              ? households.refetch()
              : item.refetch())
          }
          type="button"
        >
          Reintentar
        </button>
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

  const saveAdjustment = async (values: AdjustInventoryValues) => {
    if (!inventoryItemId || !households.activeHousehold) return;
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

  const onSubmit: SubmitHandler<AdjustInventoryValues> = (values) => {
    if (largeAdjustment) {
      setPendingValues(values);
      return;
    }
    void saveAdjustment(values);
  };

  return (
    <section
      className="page-section inventory-form-page"
      aria-labelledby="inventory-adjust-title"
    >
      <BackButton fallback={`/app/inventario/${current.id}`} />
      <PageHeader
        description="Registra el resultado de un conteo sin reemplazar el historial del inventario."
        eyebrow="Ajustar existencia"
        icon={<Scale size={22} />}
        title={current.name}
        titleId="inventory-adjust-title"
      />
      {syncStatus.data?.isOnline === false ? (
        <p className="inventory-offline-note" role="status">
          Sin conexión. El ajuste se guardará en este dispositivo como pendiente; el saldo mostrado no estará confirmado por el servidor hasta sincronizar.
        </p>
      ) : null}
      <dl className="inventory-current-summary">
        <div>
          <dt>Cantidad mostrada</dt>
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
        <fieldset>
          <legend>Nuevo conteo</legend>
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
        </fieldset>
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
            {adjust.isPending
              ? syncStatus.data?.isOnline === false
                ? 'Guardando en dispositivo...'
                : 'Guardando...'
              : syncStatus.data?.isOnline === false
                ? 'Guardar ajuste pendiente'
                : 'Confirmar ajuste'}
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
      <Dialog
        onClose={() => setPendingValues(null)}
        open={Boolean(pendingValues)}
        title="Revisar ajuste"
      >
        <p>
          Este cambio es grande frente al saldo actual. Revisa el resultado antes de guardarlo.
        </p>
        <dl className="inventory-adjust-review">
          <div><dt>Saldo actual</dt><dd>{formatQuantity(current.currentQuantity, current.unit)}</dd></div>
          <div><dt>Nuevo saldo</dt><dd>{formatQuantity(Number(pendingValues?.quantity ?? 0), current.unit)}</dd></div>
        </dl>
        {adjust.error ? (
          <p className="form-field__error" role="alert">
            {adjust.error instanceof Error ? adjust.error.message : 'No se pudo guardar el ajuste.'}
          </p>
        ) : null}
        <div className="inventory-dialog-actions">
          <button className="button button--secondary" onClick={() => setPendingValues(null)} type="button">
            Corregir cantidad
          </button>
          <button
            className="button button--primary"
            disabled={adjust.isPending}
            onClick={() => {
              if (pendingValues) void saveAdjustment(pendingValues);
            }}
            type="button"
          >
            {adjust.isPending
              ? syncStatus.data?.isOnline === false
                ? 'Guardando en dispositivo...'
                : 'Guardando...'
              : syncStatus.data?.isOnline === false
                ? 'Guardar ajuste pendiente'
                : 'Guardar ajuste'}
          </button>
        </div>
      </Dialog>
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
      {error ? <p className="form-field__error" role="alert">{error}</p> : null}
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
