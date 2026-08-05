import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router';

import type { FoodSelection } from '../../../food-catalog/application/ports/FoodCatalogGateway';
import { FoodSelector } from '../../../food-catalog/presentation/components/FoodSelector';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import type { PurchaseItemInput } from '../../application/ports/PurchaseGateway';
import '../purchases.css';
import {
  useCreatePurchase,
  usePurchaseConnectivity,
  usePurchase,
  useUpdatePurchase,
} from '../hooks/usePurchases';
import {
  formatDateInput,
  parseDateInput,
  purchaseSchema,
  type PurchaseFormValues,
} from '../schemas/purchaseSchemas';

const defaultValues: PurchaseFormValues = {
  currency: 'ARS',
  purchaseDate: formatDateInput(new Date().toISOString()),
  storeName: '',
  total: '',
};

export function PurchaseFormPage() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const isEditing = Boolean(purchaseId);
  const navigate = useNavigate();
  const households = useHouseholds();
  const purchase = usePurchase(purchaseId);
  const create = useCreatePurchase();
  const update = useUpdatePurchase();
  const isOnline = usePurchaseConnectivity();
  const [draftItems, setDraftItems] = useState<PurchaseItemInput[] | null>(
    null,
  );
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [itemsError, setItemsError] = useState('');
  const initializedPurchaseId = useRef<string | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<PurchaseFormValues>({
    defaultValues,
    resolver: zodResolver(purchaseSchema),
  });

  useEffect(() => {
    if (
      purchase.data &&
      isEditing &&
      initializedPurchaseId.current !== purchase.data.id
    ) {
      reset({
        currency: purchase.data.currency,
        purchaseDate: formatDateInput(purchase.data.purchaseDate),
        storeName: purchase.data.storeName,
        total: String(purchase.data.total),
      });
      initializedPurchaseId.current = purchase.data.id;
    }
  }, [isEditing, purchase.data, reset]);

  if (households.isPending || (isEditing && purchase.isPending))
    return (
      <p className="page-section" role="status">
        Cargando formulario...
      </p>
    );
  if (
    households.isError ||
    !households.activeHousehold ||
    (isEditing && (purchase.isError || !purchase.data))
  )
    return (
      <section className="page-section" role="alert">
        <p>
          {isOnline
            ? 'No se pudo cargar la compra.'
            : isEditing
              ? 'Esta compra no está disponible para editar sin conexión.'
              : 'No se pudo preparar el formulario sin conexión.'}
        </p>
        <button
          className="button button--secondary"
          onClick={() =>
            void (households.isError || !households.activeHousehold
              ? households.refetch()
              : purchase.refetch())
          }
          type="button"
        >
          Reintentar
        </button>
      </section>
    );
  if (isEditing && purchase.data?.status !== 'DRAFT')
    return (
      <p className="page-section" role="alert">
        Solo puedes editar compras en borrador.
      </p>
    );

  const householdId = households.activeHousehold.id;
  const loadedItems =
    purchase.data?.items.map((item) => ({
      foodId: item.foodId ?? undefined,
      inventoryItemId: item.inventoryItemId ?? undefined,
      nameSnapshot: item.nameSnapshot,
      quantity: item.quantity,
      sourceShoppingItemId: item.sourceShoppingItemId ?? undefined,
      unit: item.unit,
    })) ?? [];
  const items = draftItems ?? (isEditing ? loadedItems : []);

  const onSelect = (selection: FoodSelection) => {
    setDraftItems((current) => [
      ...(current ?? items),
      {
        foodId: selection.food.id,
        nameSnapshot: selection.food.name,
        quantity: selection.quantity,
        unit: selection.unit === 'SERVING' ? 'UNIT' : selection.unit,
      },
    ]);
    setItemsError('');
    setSelectorOpen(false);
  };

  const updateItem = (index: number, patch: Partial<PurchaseItemInput>) => {
    setDraftItems(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
    setItemsError('');
  };

  const onSubmit: SubmitHandler<PurchaseFormValues> = async (values) => {
    if (items.length === 0) {
      setItemsError('Agrega al menos un producto a la compra.');
      return;
    }
    if (
      items.some(
        (item) =>
          !Number.isFinite(item.quantity) || item.quantity <= 0 || !item.unit,
      )
    ) {
      setItemsError(
        'Revisa que cada producto tenga una cantidad mayor que cero y una unidad.',
      );
      return;
    }
    const input = {
      currency: values.currency.trim(),
      items,
      purchaseDate: parseDateInput(values.purchaseDate),
      storeName: values.storeName.trim(),
      total: Number(values.total),
    };
    try {
      const result = isEditing
        ? await update.mutateAsync({ input, purchaseId: purchaseId as string })
        : await create.mutateAsync({ householdId, input });
      navigate(`/app/compras/${result.id}`, { replace: true });
    } catch {
      // El error de la mutación se muestra debajo del formulario.
    }
  };

  const saving = create.isPending || update.isPending;
  const mutationError = create.error ?? update.error;
  return (
    <section
      className="page-section purchase-form-page"
      aria-labelledby="purchase-form-title"
    >
      <BackButton
        fallback={isEditing ? `/app/compras/${purchaseId}` : '/app/compras'}
      />
      {!isOnline ? (
        <p
          className="feature-connectivity feature-connectivity--offline"
          role="status"
        >
          Sin conexión. Este formulario conserva los valores en pantalla, pero
          el borrador no puede guardarse ni se pondrá en cola.
        </p>
      ) : null}
      <form
        className="purchase-form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <fieldset>
          <legend>
            <span>1</span> Datos de la compra
          </legend>
          <div className="purchase-form-grid">
            <Field
              error={errors.storeName?.message}
              id="purchase-store-name"
              label="Comercio"
            >
              <input id="purchase-store-name" {...register('storeName')} />
            </Field>
            <Field
              error={errors.purchaseDate?.message}
              id="purchase-date"
              label="Fecha y hora"
            >
              <input
                id="purchase-date"
                type="datetime-local"
                {...register('purchaseDate')}
              />
            </Field>
            <Field
              error={errors.total?.message}
              id="purchase-total"
              label="Total"
            >
              <input
                id="purchase-total"
                inputMode="decimal"
                min="0"
                step="any"
                type="number"
                {...register('total')}
              />
            </Field>
            <Field
              error={errors.currency?.message}
              id="purchase-currency"
              label="Moneda"
            >
              <input
                id="purchase-currency"
                maxLength={3}
                {...register('currency')}
              />
            </Field>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <span>2</span> Productos
          </legend>
          <button
            className="button button--secondary"
            disabled={!isOnline}
            onClick={() => setSelectorOpen(true)}
            type="button"
          >
            Agregar producto
          </button>
          {itemsError ? (
            <p className="form-field__error" role="alert">
              {itemsError}
            </p>
          ) : null}
          {items.length ? (
            <ul className="purchase-form-items">
              {items.map((item, index) => (
                <li key={`${item.foodId ?? item.nameSnapshot}-${index}`}>
                  <div>
                    <strong>{item.nameSnapshot}</strong>
                    <div className="purchase-item-editors form-field ">
                      <label>
                        <span>Cantidad</span>
                        <input
                          aria-label={`Cantidad de ${item.nameSnapshot}`}
                          inputMode="decimal"
                          min="0.1"
                          onChange={(event) =>
                            updateItem(index, {
                              quantity: Number(event.target.value),
                            })
                          }
                          step="any"
                          type="number"
                          value={item.quantity}
                        />
                      </label>
                      <label>
                        <span>Unidad</span>
                        <select
                          aria-label={`Unidad de ${item.nameSnapshot}`}
                          onChange={(event) =>
                            updateItem(index, { unit: event.target.value })
                          }
                          value={item.unit}
                        >
                          <option value="GRAM">Gramos</option>
                          <option value="MILLILITER">Mililitros</option>
                          <option value="UNIT">Unidad</option>
                          <option value="SERVING">Porción</option>
                        </select>
                      </label>
                    </div>
                  </div>
                  <button
                    className="button button--text"
                    onClick={() =>
                      setDraftItems(
                        items.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                    type="button"
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No agregaste productos todavía.</p>
          )}
        </fieldset>
        <p className="purchase-inventory-preview" role="note">
          Guardar mantiene la compra como borrador. Ningún saldo de inventario
          cambia hasta que confirmes la compra desde su detalle.
        </p>
        <div className="purchase-form-actions">
          <Link
            className="button button--secondary"
            to={isEditing ? `/app/compras/${purchaseId}` : '/app/compras'}
          >
            Cancelar
          </Link>
          <button
            className="button button--primary"
            disabled={!isOnline || saving}
            type="submit"
          >
            {saving ? 'Guardando...' : 'Guardar borrador'}
          </button>
        </div>
      </form>
      {mutationError ? (
        <p className="form-field__error" role="alert">
          {mutationError instanceof Error
            ? mutationError.message
            : 'No se pudo guardar la compra.'}
        </p>
      ) : null}
      {selectorOpen ? (
        <FoodSelector
          onClose={() => setSelectorOpen(false)}
          onSelect={onSelect}
        />
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
