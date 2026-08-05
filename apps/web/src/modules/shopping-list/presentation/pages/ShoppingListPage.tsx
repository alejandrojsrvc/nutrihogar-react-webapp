import { useCallback, useState, type ReactElement } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

import { LoadingState } from '../../../../shared/presentation/components/AsyncState';
import { EmptyState } from '../../../../shared/presentation/components/EmptyState';
import { ShoppingListEditDialog } from '../components/ShoppingListEditDialog';
import { ShoppingListItem } from '../components/ShoppingListItem';
import {
  BottomSheet,
  Dialog,
} from '../../../../shared/presentation/components/Overlay';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import {
  useAddShoppingListItem,
  useConvertShoppingListToPurchase,
  useGenerateShoppingList,
  useMarkShoppingListItemPurchased,
  useRemoveShoppingListItem,
  useShoppingList,
  useShoppingListConnectivity,
  useUpdateShoppingListItem,
} from '../hooks/useShoppingList';
import {
  shoppingListItemSchema,
  type ShoppingListItemFormValues,
} from '../schemas/shoppingListSchemas';
import '../../../purchases/presentation/purchases.css';

export function ShoppingListPage() {
  const households = useHouseholds();
  const list = useShoppingList(households.activeHousehold?.id);
  const add = useAddShoppingListItem();
  const update = useUpdateShoppingListItem();
  const remove = useRemoveShoppingListItem();
  const markPurchased = useMarkShoppingListItemPurchased();
  const generate = useGenerateShoppingList();
  const convert = useConvertShoppingListToPurchase();
  const isOnline = useShoppingListConnectivity();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<
    Record<string, ShoppingListItemFormValues>
  >({});
  const [addOpen, setAddOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editError, setEditError] = useState('');
  const [conversionOpen, setConversionOpen] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [total, setTotal] = useState('');
  const [currency, setCurrency] = useState('ARS');
  const [purchaseDate, setPurchaseDate] = useState(toDateTimeInput(new Date()));
  const [conversionError, setConversionError] = useState('');
  const closeAdd = useCallback(() => setAddOpen(false), []);
  const closeConversion = useCallback(() => setConversionOpen(false), []);
  const closeEditor = useCallback(() => {
    if (editingItemId) {
      setDrafts((current) => {
        const next = { ...current };
        delete next[editingItemId];
        return next;
      });
    }
    setEditError('');
    setEditingItemId(null);
  }, [editingItemId]);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ShoppingListItemFormValues>({
    defaultValues: { name: '', quantity: '', unit: 'UNIT' },
    resolver: zodResolver(shoppingListItemSchema),
  });

  if (households.isPending)
    return (
      <p className="page-section" role="status">
        Cargando hogar...
      </p>
    );
  if (households.isError || !households.activeHousehold)
    return (
      <section className="page-section" role="alert">
        <p>
          {isOnline
            ? 'No se pudo cargar el hogar activo.'
            : 'No se pudo identificar el hogar sin conexión.'}
        </p>
        <button
          className="button button--secondary"
          onClick={() => void households.refetch()}
          type="button"
        >
          Reintentar
        </button>
      </section>
    );

  const householdId = households.activeHousehold.id;
  const items = list.data?.items ?? [];
  const pendingItems = items.filter((item) => !item.purchased);
  const onAdd: SubmitHandler<ShoppingListItemFormValues> = async (values) => {
    try {
      await add.mutateAsync({
        householdId,
        input: {
          name: values.name.trim(),
          quantity: Number(values.quantity),
          unit: values.unit,
          source: 'MANUAL',
        },
      });
      reset();
      setAddOpen(false);
    } catch {
      // El error de la mutación se muestra debajo del formulario.
    }
  };

  function draftFor(item: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
  }) {
    return (
      drafts[item.id] ?? {
        name: item.name,
        quantity: String(item.quantity),
        unit: item.unit,
      }
    );
  }

  function updateDraft(
    item: { id: string; name: string; quantity: number; unit: string },
    patch: Partial<ShoppingListItemFormValues>,
  ) {
    setDrafts((current) => {
      const existing = current[item.id] ?? draftFor(item);
      return { ...current, [item.id]: { ...existing, ...patch } };
    });
  }

  async function saveItem(item: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
  }) {
    const value = draftFor(item);
    const parsed = shoppingListItemSchema.safeParse(value);
    if (!parsed.success) {
      setEditError(parsed.error.issues[0]?.message ?? 'Revisa el producto.');
      return;
    }
    setEditError('');
    try {
      await update.mutateAsync({
        itemId: item.id,
        input: {
          name: parsed.data.name.trim(),
          quantity: Number(parsed.data.quantity),
          unit: parsed.data.unit,
        },
      });
      setEditingItemId(null);
    } catch (error) {
      setEditError(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar el cambio.',
      );
    }
  }

  async function convertSelected() {
    const selectedItems = pendingItems.filter((item) =>
      selected.includes(item.id),
    );
    if (!selectedItems.length) {
      setConversionError('Selecciona al menos un producto pendiente.');
      return;
    }
    if (
      selectedItems.some(
        (item) =>
          !shoppingListItemSchema.safeParse({
            name: drafts[item.id]?.name ?? item.name,
            quantity: String(drafts[item.id]?.quantity ?? item.quantity),
            unit: drafts[item.id]?.unit ?? item.unit,
          }).success,
      )
    ) {
      setConversionError(
        'Revisa que cada producto tenga una cantidad mayor que cero y una unidad.',
      );
      return;
    }
    if (!storeName.trim()) {
      setConversionError('Indica el comercio.');
      return;
    }
    if (!Number.isFinite(Number(total)) || Number(total) <= 0) {
      setConversionError('Indica un total mayor que cero.');
      return;
    }
    if (!currency.trim() || Number.isNaN(new Date(purchaseDate).getTime())) {
      setConversionError('Indica una fecha y una moneda válidas.');
      return;
    }
    setConversionError('');
    try {
      const purchase = await convert.mutateAsync({
        householdId,
        input: {
          currency,
          itemIds: selectedItems.map((item) => item.id),
          items: selectedItems.map((item) => ({
            foodId: item.foodId ?? undefined,
            nameSnapshot: drafts[item.id]?.name ?? item.name,
            quantity: Number(drafts[item.id]?.quantity ?? item.quantity),
            sourceShoppingItemId: item.id,
            unit: drafts[item.id]?.unit ?? item.unit,
          })),
          purchaseDate: new Date(purchaseDate),
          storeName: storeName.trim(),
          total: Number(total),
        },
      });
      navigate(`/app/compras/${purchase.id}`);
    } catch {
      // El error se muestra debajo del flujo de conversión.
    }
  }

  return (
    <section
      className="page-section shopping-list-page"
      aria-labelledby="shopping-list-title"
    >
      <div className="shopping-list-actions">
        <Link className="button button--secondary" to="/app/compras">
          Ver compras
        </Link>
        <button
          className={`button ${selected.length ? 'button--secondary' : 'button--primary'}`}
          disabled={!isOnline}
          onClick={() => {
            add.reset();
            setAddOpen(true);
          }}
          type="button"
        >
          Agregar producto
        </button>
        <button
          className="button button--secondary"
          disabled={!isOnline || generate.isPending}
          onClick={() => generate.mutate(householdId)}
          type="button"
        >
          {generate.isPending
            ? 'Revisando inventario...'
            : 'Generar desde inventario'}
        </button>
      </div>
      {!isOnline ? (
        <p
          className="feature-connectivity feature-connectivity--offline"
          role="status"
        >
          Sin conexión. Puedes revisar la lista cargada, pero los cambios
          requieren conexión y no se pondrán en cola.
        </p>
      ) : null}
      {addOpen ? (
        <BottomSheet onClose={closeAdd} open title="Agregar producto">
          <form
            className="shopping-list-add-form"
            noValidate
            onSubmit={handleSubmit(onAdd)}
          >
            <Field
              error={errors.name?.message}
              id="shopping-name"
              label="Producto"
            >
              <input id="shopping-name" {...register('name')} />
            </Field>
            <Field
              error={errors.quantity?.message}
              id="shopping-quantity"
              label="Cantidad"
            >
              <input
                id="shopping-quantity"
                inputMode="decimal"
                min="0"
                step="any"
                type="number"
                {...register('quantity')}
              />
            </Field>
            <Field
              error={errors.unit?.message}
              id="shopping-unit"
              label="Unidad"
            >
              <select id="shopping-unit" {...register('unit')}>
                <option value="GRAM">Gramos</option>
                <option value="MILLILITER">Mililitros</option>
                <option value="UNIT">Unidad</option>
                <option value="SERVING">Porción</option>
              </select>
            </Field>
            <div className="shopping-list-sheet__actions">
              <button
                className="button button--secondary"
                onClick={closeAdd}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="button button--primary"
                disabled={add.isPending}
                type="submit"
              >
                {add.isPending ? 'Agregando...' : 'Agregar a la lista'}
              </button>
            </div>
            {add.error ? (
              <p className="form-field__error" role="alert">
                {errorMessage(add.error, 'No se pudo agregar el producto.')}
              </p>
            ) : null}
          </form>
        </BottomSheet>
      ) : null}
      {list.isPending ? <LoadingState message="Cargando lista..." /> : null}
      {list.isError ? (
        <div role="alert">
          <p>
            {isOnline
              ? 'No se pudo cargar la lista de compras.'
              : 'No hay una lista guardada disponible sin conexión.'}
          </p>
          <button
            className="button button--secondary"
            onClick={() => void list.refetch()}
            type="button"
          >
            Reintentar
          </button>
        </div>
      ) : null}
      {!list.isPending && !list.isError && items.length === 0 ? (
        <EmptyState
          description="Agrega un producto o genera faltantes desde el inventario."
          title="Tu lista está vacía"
        />
      ) : null}
      {items.length ? (
        <ul className="shopping-list-items">
          {items.map((item) => (
            <ShoppingListItem
              isMarking={
                markPurchased.isPending && markPurchased.variables === item.id
              }
              isReadOnly={!isOnline}
              isRemoving={remove.isPending && remove.variables === item.id}
              isSelected={selected.includes(item.id)}
              item={item}
              key={item.id}
              onEdit={() => {
                update.reset();
                setEditError('');
                setEditingItemId(item.id);
              }}
              onMarkPurchased={() =>
                markPurchased.mutate(item.id, {
                  onSuccess: () =>
                    setSelected((current) =>
                      current.filter((id) => id !== item.id),
                    ),
                })
              }
              onRemove={() => {
                remove.mutate(item.id, {
                  onSuccess: () =>
                    setSelected((current) =>
                      current.filter((id) => id !== item.id),
                    ),
                });
              }}
              onToggle={(checked) =>
                setSelected((current) =>
                  checked
                    ? [...current, item.id]
                    : current.filter((id) => id !== item.id),
                )
              }
            />
          ))}
        </ul>
      ) : null}
      {markPurchased.error || remove.error || generate.error ? (
        <p className="form-field__error" role="alert">
          {errorMessage(
            markPurchased.error ?? remove.error ?? generate.error,
            'No se pudo actualizar la lista.',
          )}
        </p>
      ) : null}
      {editingItemId
        ? (() => {
            const item = items.find(
              (candidate) => candidate.id === editingItemId,
            );
            return item ? (
              <ShoppingListEditDialog
                draft={draftFor(item)}
                error={editError}
                isSaving={update.isPending}
                onChange={(patch) => updateDraft(item, patch)}
                onClose={closeEditor}
                onSave={() => void saveItem(item)}
              />
            ) : null;
          })()
        : null}
      {conversionOpen ? (
        <Dialog onClose={closeConversion} open title="Completar compra">
          <div className="shopping-conversion">
            <p className="shopping-conversion__intro">
              Se creará un borrador con los elementos seleccionados. La lista se
              marcará como comprada y el inventario cambiará solo al confirmar
              la compra.
            </p>
            <ul className="shopping-conversion__items">
              {pendingItems
                .filter((item) => selected.includes(item.id))
                .map((item) => (
                  <li key={item.id}>
                    <span>{item.name}</span>
                    <div className="shopping-conversion-item-fields">
                      <label>
                        <span>Cantidad</span>
                        <input
                          aria-label={`Cantidad de ${item.name}`}
                          inputMode="decimal"
                          min="0.1"
                          onChange={(event) =>
                            updateDraft(item, { quantity: event.target.value })
                          }
                          step="any"
                          type="number"
                          value={drafts[item.id]?.quantity ?? item.quantity}
                        />
                      </label>
                      <label>
                        <span>Unidad</span>
                        <select
                          aria-label={`Unidad de ${item.name}`}
                          onChange={(event) =>
                            updateDraft(item, { unit: event.target.value })
                          }
                          value={drafts[item.id]?.unit ?? item.unit}
                        >
                          <option value="GRAM">Gramos</option>
                          <option value="MILLILITER">Mililitros</option>
                          <option value="UNIT">Unidad</option>
                          <option value="SERVING">Porción</option>
                        </select>
                      </label>
                    </div>
                  </li>
                ))}
            </ul>
            <div className="purchase-form-grid">
              <Field id="conversion-store" label="Comercio">
                <input
                  id="conversion-store"
                  onChange={(event) => setStoreName(event.target.value)}
                  value={storeName}
                />
              </Field>
              <Field id="conversion-date" label="Fecha">
                <input
                  id="conversion-date"
                  onChange={(event) => setPurchaseDate(event.target.value)}
                  type="datetime-local"
                  value={purchaseDate}
                />
              </Field>
              <Field id="conversion-total" label="Total">
                <input
                  id="conversion-total"
                  min="0"
                  onChange={(event) => setTotal(event.target.value)}
                  step="any"
                  type="number"
                  value={total}
                />
              </Field>
              <Field id="conversion-currency" label="Moneda">
                <input
                  id="conversion-currency"
                  onChange={(event) => setCurrency(event.target.value)}
                  value={currency}
                />
              </Field>
            </div>
            <div className="shopping-conversion-actions">
              <button
                className="button button--secondary"
                onClick={closeConversion}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="button button--primary"
                disabled={!isOnline || convert.isPending}
                onClick={() => void convertSelected()}
                type="button"
              >
                {convert.isPending ? 'Creando...' : 'Crear borrador'}
              </button>
            </div>
            {convert.error ? (
              <p className="form-field__error" role="alert">
                {convert.error instanceof Error
                  ? convert.error.message
                  : 'No se pudo crear la compra.'}
              </p>
            ) : null}
            {conversionError ? (
              <p className="form-field__error" role="alert">
                {conversionError}
              </p>
            ) : null}
          </div>
        </Dialog>
      ) : null}
      {selected.length ? (
        <div
          aria-label="Productos seleccionados"
          className="shopping-selection-action"
          role="region"
        >
          <span>
            {selected.length} seleccionado{selected.length === 1 ? '' : 's'}
          </span>
          <button
            className="button button--primary"
            disabled={!isOnline}
            onClick={() => {
              convert.reset();
              setConversionError('');
              setConversionOpen(true);
            }}
            type="button"
          >
            Registrar compra
          </button>
        </div>
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
      {error ? (
        <p className="form-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
function toDateTimeInput(value: Date) {
  const offset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
