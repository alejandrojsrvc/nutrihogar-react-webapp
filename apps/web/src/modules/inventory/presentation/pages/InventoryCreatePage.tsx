import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type ReactElement } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';

import type { FoodSelection } from '../../../food-catalog/application/ports/FoodCatalogGateway';
import { FoodSelector } from '../../../food-catalog/presentation/components/FoodSelector';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { useCreateInventoryItem } from '../hooks/useInventory';
import { createInventorySchema, type CreateInventoryValues, parseDateInput } from '../schemas/inventorySchemas';

export function InventoryCreatePage() {
  const navigate = useNavigate();
  const households = useHouseholds();
  const create = useCreateInventoryItem();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodSelection['food']>();
  const { formState: { errors }, handleSubmit, register, setValue } = useForm<CreateInventoryValues>({
    defaultValues: { expiresAt: '', foodId: '', location: '', minimumQuantity: '', quantity: '', reason: '', unit: 'GRAM' },
    resolver: zodResolver(createInventorySchema),
  });

  if (households.isPending) return <p className="page-section" role="status">Cargando hogar...</p>;
  if (households.isError || !households.activeHousehold) return <p className="page-section" role="alert">No se pudo cargar el hogar activo.</p>;
  const householdId = households.activeHousehold.id;

  const onFoodSelected = (selection: FoodSelection) => {
    const unit = selection.unit === 'SERVING' ? 'GRAM' : selection.unit;
    setSelectedFood(selection.food);
    setValue('foodId', selection.food.id, { shouldValidate: true });
    setValue('quantity', String(selection.quantity), { shouldValidate: true });
    setValue('unit', unit, { shouldValidate: true });
    setSelectorOpen(false);
  };

  const onSubmit: SubmitHandler<CreateInventoryValues> = async (values) => {
    try {
      const item = await create.mutateAsync({
        householdId,
        input: {
          expiresAt: parseDateInput(values.expiresAt),
          foodId: values.foodId,
          location: values.location.trim() || null,
          minimumQuantity: values.minimumQuantity.trim() ? Number(values.minimumQuantity) : null,
          occurredAt: new Date(),
          quantity: Number(values.quantity),
          reason: values.reason.trim() || undefined,
          unit: values.unit,
        },
      });
      if (!item) return;
      navigate(`/app/inventario/${item.id}`, { replace: true, state: { inventorySaved: true } });
    } catch {
      // El error de la mutación se muestra debajo del formulario.
    }
  };

  return (
    <section className="page-section inventory-form-page" aria-labelledby="inventory-create-title">
      <BackButton fallback="/app/inventario" />
      <p className="eyebrow">Inventario del hogar</p>
      <h1 id="inventory-create-title">Agregar existencia</h1>
      <p className="lead">Registra lo que tienes disponible para mantener una referencia clara en casa.</p>
      <form className="inventory-form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <fieldset>
          <legend>Alimento</legend>
          <input type="hidden" {...register('foodId')} />
          <div className="form-field">
            <span className="form-field__label">Alimento *</span>
            {selectedFood ? <p className="inventory-selected-food"><strong>{selectedFood.name}</strong><button className="button button--text" onClick={() => setSelectorOpen(true)} type="button">Cambiar</button></p> : <button className="button button--secondary" onClick={() => setSelectorOpen(true)} type="button">Buscar alimento</button>}
            {errors.foodId ? <p className="form-field__error" role="alert">{errors.foodId.message}</p> : null}
          </div>
        </fieldset>
        <fieldset>
          <legend>Cantidad y ubicación</legend>
          <div className="inventory-form-grid">
            <Field error={errors.quantity?.message} id="inventory-create-quantity" label="Cantidad inicial *"><input id="inventory-create-quantity" inputMode="decimal" min="0" step="any" type="number" {...register('quantity')} /></Field>
            <Field error={errors.unit?.message} id="inventory-create-unit" label="Unidad *"><select id="inventory-create-unit" {...register('unit')}><option value="GRAM">Gramos (g)</option><option value="MILLILITER">Mililitros (ml)</option><option value="UNIT">Unidades</option></select></Field>
            <Field error={errors.minimumQuantity?.message} id="inventory-create-minimum" label="Mínimo opcional"><input id="inventory-create-minimum" inputMode="decimal" min="0" step="any" type="number" {...register('minimumQuantity')} /></Field>
            <Field error={errors.location?.message} id="inventory-create-location" label="Ubicación"><input id="inventory-create-location" placeholder="Ej. Alacena" type="text" {...register('location')} /></Field>
            <Field error={errors.expiresAt?.message} id="inventory-create-expires" label="Vencimiento"><input id="inventory-create-expires" type="datetime-local" {...register('expiresAt')} /></Field>
          </div>
        </fieldset>
        <Field error={errors.reason?.message} id="inventory-create-reason" label="Razón"><textarea id="inventory-create-reason" placeholder="Ej. Compra semanal" {...register('reason')} /></Field>
        <div className="inventory-form-actions"><Link className="button button--secondary" to="/app/inventario">Cancelar</Link><button className="button button--primary" disabled={create.isPending} type="submit">{create.isPending ? 'Guardando...' : 'Agregar existencia'}</button></div>
      </form>
      {create.error ? <p className="form-field__error" role="alert">{create.error instanceof Error ? create.error.message : 'No se pudo agregar la existencia.'}</p> : null}
      {selectorOpen ? <FoodSelector onClose={() => setSelectorOpen(false)} onSelect={onFoodSelected} /> : null}
    </section>
  );
}

function Field({ children, error, id, label }: { children: ReactElement; error?: string; id: string; label: string }) {
  return <div className="form-field"><label htmlFor={id}>{label}</label>{children}{error ? <p className="form-field__error">{error}</p> : null}</div>;
}
