import { useState, type ReactElement } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import {
  useAddShoppingListItem,
  useConvertShoppingListToPurchase,
  useGenerateShoppingList,
  useMarkShoppingListItemPurchased,
  useRemoveShoppingListItem,
  useShoppingList,
  useUpdateShoppingListItem,
} from '../hooks/useShoppingList';
import { shoppingListItemSchema, type ShoppingListItemFormValues } from '../schemas/shoppingListSchemas';

export function ShoppingListPage() {
  const households = useHouseholds();
  const list = useShoppingList(households.activeHousehold?.id);
  const add = useAddShoppingListItem();
  const update = useUpdateShoppingListItem();
  const remove = useRemoveShoppingListItem();
  const markPurchased = useMarkShoppingListItemPurchased();
  const generate = useGenerateShoppingList();
  const convert = useConvertShoppingListToPurchase();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, ShoppingListItemFormValues>>({});
  const [conversionOpen, setConversionOpen] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [total, setTotal] = useState('');
  const [currency, setCurrency] = useState('ARS');
  const [purchaseDate, setPurchaseDate] = useState(toDateTimeInput(new Date()));
  const { formState: { errors }, handleSubmit, register, reset } = useForm<ShoppingListItemFormValues>({ defaultValues: { name: '', quantity: '', unit: 'UNIT' }, resolver: zodResolver(shoppingListItemSchema) });

  if (households.isPending) return <p className="page-section" role="status">Cargando hogar...</p>;
  if (households.isError || !households.activeHousehold) return <p className="page-section" role="alert">No se pudo cargar el hogar activo.</p>;

  const items = list.data?.items ?? [];
  const pendingItems = items.filter((item) => !item.purchased);
  const onAdd: SubmitHandler<ShoppingListItemFormValues> = async (values) => {
    try {
      await add.mutateAsync({ householdId: households.activeHousehold.id, input: { name: values.name.trim(), quantity: Number(values.quantity), unit: values.unit, source: 'MANUAL' } });
      reset();
    } catch {
      // El error de la mutación se muestra debajo del formulario.
    }
  };

  function draftFor(item: { id: string; name: string; quantity: number; unit: string }) {
    return drafts[item.id] ?? { name: item.name, quantity: String(item.quantity), unit: item.unit };
  }

  function updateDraft(item: { id: string; name: string; quantity: number; unit: string }, patch: Partial<ShoppingListItemFormValues>) {
    setDrafts((current) => {
      const existing = current[item.id] ?? draftFor(item);
      return { ...current, [item.id]: { ...existing, ...patch } };
    });
  }

  async function saveItem(item: { id: string; name: string; quantity: number; unit: string }) {
    const value = draftFor(item);
    if (!value || Number(value.quantity) <= 0 || !value.name.trim()) return;
    await update.mutateAsync({ itemId: item.id, input: { name: value.name.trim(), quantity: Number(value.quantity), unit: value.unit } });
  }

  async function convertSelected() {
    const selectedItems = pendingItems.filter((item) => selected.includes(item.id));
    if (!selectedItems.length || !storeName.trim() || Number(total) <= 0) return;
    try {
      const purchase = await convert.mutateAsync({ householdId: households.activeHousehold.id, input: { currency, itemIds: selected, items: selectedItems.map((item) => ({ foodId: item.foodId ?? undefined, nameSnapshot: item.name, quantity: Number(drafts[item.id]?.quantity ?? item.quantity), sourceShoppingItemId: item.id, unit: drafts[item.id]?.unit ?? item.unit })), purchaseDate: new Date(purchaseDate), storeName: storeName.trim(), total: Number(total) } });
      navigate(`/app/compras/${purchase.id}`);
    } catch {
      // El error se muestra debajo del flujo de conversión.
    }
  }

  return (
    <section className="page-section shopping-list-page" aria-labelledby="shopping-list-title">
      <PageHeader action={<Link className="button button--secondary" to="/app/compras">Ver compras</Link>} eyebrow={households.activeHousehold.name} title="Lista de compras" titleId="shopping-list-title" description="Organiza lo pendiente sin confundir comprar con actualizar el inventario." />
      <form className="shopping-list-add-form" noValidate onSubmit={handleSubmit(onAdd)}><Field error={errors.name?.message} id="shopping-name" label="Producto"><input id="shopping-name" {...register('name')} /></Field><Field error={errors.quantity?.message} id="shopping-quantity" label="Cantidad"><input id="shopping-quantity" inputMode="decimal" min="0" step="any" type="number" {...register('quantity')} /></Field><Field error={errors.unit?.message} id="shopping-unit" label="Unidad"><input id="shopping-unit" {...register('unit')} /></Field><button className="button button--primary" disabled={add.isPending} type="submit">{add.isPending ? 'Agregando...' : 'Agregar a la lista'}</button></form>
      <div className="shopping-list-actions"><button className="button button--secondary" disabled={generate.isPending} onClick={() => generate.mutate(households.activeHousehold.id)} type="button">{generate.isPending ? 'Revisando inventario...' : 'Generar desde inventario'}</button>{selected.length ? <button className="button button--primary" onClick={() => setConversionOpen(true)} type="button">Registrar compra ({selected.length})</button> : null}</div>
      {list.isPending ? <p role="status">Cargando lista...</p> : null}{list.isError ? <div role="alert"><p>No se pudo cargar la lista de compras.</p><button className="button button--secondary" onClick={() => void list.refetch()} type="button">Reintentar</button></div> : null}
      {!list.isPending && !list.isError && items.length === 0 ? <section className="empty-state-card"><h2>Tu lista está vacía</h2><p>Agrega un producto o genera faltantes desde el inventario.</p></section> : null}
      {items.length ? <ul className="shopping-list-items">{items.map((item) => <li className={item.purchased ? 'is-purchased' : ''} key={item.id}><label><input checked={selected.includes(item.id)} disabled={item.purchased} onChange={(event) => setSelected((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))} type="checkbox" /> <span>{item.name}</span></label><span className="shopping-list-source">{sourceLabel(item.source)}</span><div className="shopping-list-item-fields"><input aria-label={`${item.name} cantidad`} onChange={(event) => updateDraft(item, { quantity: event.target.value })} type="number" value={draftFor(item).quantity} /><input aria-label={`${item.name} unidad`} onChange={(event) => updateDraft(item, { unit: event.target.value })} value={draftFor(item).unit} /><button className="button button--text" disabled={update.isPending || item.purchased} onClick={() => void saveItem(item)} type="button">Guardar</button></div><div className="shopping-list-item-actions">{!item.purchased ? <button className="button button--secondary" disabled={markPurchased.isPending} onClick={() => markPurchased.mutate(item.id)} type="button">Marcar comprado</button> : <span>Comprado</span>}<button className="button button--text" disabled={remove.isPending} onClick={() => remove.mutate(item.id)} type="button">Eliminar</button></div></li>)}</ul> : null}
      {conversionOpen ? <section className="shopping-conversion" aria-labelledby="shopping-conversion-title"><h2 id="shopping-conversion-title">Completar compra</h2><p>Se creará un borrador con los elementos seleccionados. La lista se marcará como comprada solo después de confirmar.</p><div className="purchase-form-grid"><Field id="conversion-store" label="Comercio"><input id="conversion-store" onChange={(event) => setStoreName(event.target.value)} value={storeName} /></Field><Field id="conversion-date" label="Fecha"><input id="conversion-date" onChange={(event) => setPurchaseDate(event.target.value)} type="datetime-local" value={purchaseDate} /></Field><Field id="conversion-total" label="Total"><input id="conversion-total" min="0" onChange={(event) => setTotal(event.target.value)} step="any" type="number" value={total} /></Field><Field id="conversion-currency" label="Moneda"><input id="conversion-currency" onChange={(event) => setCurrency(event.target.value)} value={currency} /></Field></div><div className="shopping-conversion-actions"><button className="button button--secondary" onClick={() => setConversionOpen(false)} type="button">Cancelar</button><button className="button button--primary" disabled={convert.isPending} onClick={() => void convertSelected()} type="button">{convert.isPending ? 'Creando...' : 'Crear borrador'}</button></div>{convert.error ? <p className="form-field__error" role="alert">{convert.error instanceof Error ? convert.error.message : 'No se pudo crear la compra.'}</p> : null}</section> : null}
    </section>
  );
}

function Field({ children, error, id, label }: { children: ReactElement; error?: string; id: string; label: string }) { return <div className="form-field"><label htmlFor={id}>{label}</label>{children}{error ? <p className="form-field__error">{error}</p> : null}</div>; }
function sourceLabel(source: string) { return source === 'BELOW_MINIMUM' ? 'Bajo mínimo' : source === 'DEPLETED' ? 'Agotado' : source === 'MEAL_PLAN' ? 'Plan semanal' : 'Manual'; }
function toDateTimeInput(value: Date) { const offset = value.getTimezoneOffset() * 60_000; return new Date(value.getTime() - offset).toISOString().slice(0, 16); }
