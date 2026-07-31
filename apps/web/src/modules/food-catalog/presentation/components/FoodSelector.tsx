import { useState } from 'react';

import type { MeasurementMethod, MeasurementUnit } from '@nutrihogar/domain';
import type { FoodSelection } from '../../application/ports/FoodCatalogGateway';
import {
  useFoodCategories,
  useFoodDetail,
  useFoodSearch,
} from '../hooks/useFoodCatalog';
import { formatAmount, preparationStateLabels } from '../utils/foodLabels';

export function FoodSelector({ onSelect, onClose }: { onSelect: (selection: FoodSelection) => void; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [preparationState, setPreparationState] = useState<'RAW' | 'COOKED' | 'READY_TO_EAT' | ''>('');
  const [selectedFoodId, setSelectedFoodId] = useState<string>();
  const [selectedServingId, setSelectedServingId] = useState<string>();
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState<MeasurementUnit>('GRAM');
  const [measurementMethod, setMeasurementMethod] = useState<MeasurementMethod>('WEIGHED');
  const categories = useFoodCategories();
  const foods = useFoodSearch({ categoryId: categoryId || undefined, limit: 8, page: 1, preparationState: preparationState || undefined, query });
  const detail = useFoodDetail(selectedFoodId);

  const selectedFood = detail.data ?? foods.data?.items.find((food) => food.id === selectedFoodId);
  const selectedServing = detail.data?.servings.find((serving) => serving.id === selectedServingId) ?? detail.data?.servings[0];

  return (
    <div className="food-selector" role="dialog" aria-modal="true" aria-labelledby="food-selector-title">
      <div className="food-selector__header">
        <div><p className="eyebrow">Agregar alimento</p><h2 id="food-selector-title">Busca un alimento</h2></div>
        <button className="button button--secondary" onClick={onClose} type="button">Cerrar</button>
      </div>
      <div className="food-selector__filters">
        <div className="form-field"><label htmlFor="selector-query">Nombre</label><input autoFocus id="selector-query" onChange={(event) => setQuery(event.target.value)} placeholder="Ej. pollo" type="search" value={query} /></div>
        <div className="form-field"><label htmlFor="selector-category">Categoría</label><select id="selector-category" onChange={(event) => setCategoryId(event.target.value)} value={categoryId}><option value="">Todas</option>{categories.data?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
        <div className="form-field"><label htmlFor="selector-preparation">Preparación</label><select id="selector-preparation" onChange={(event) => setPreparationState(event.target.value as typeof preparationState)} value={preparationState}><option value="">Todas</option><option value="RAW">Crudo</option><option value="COOKED">Cocido</option><option value="READY_TO_EAT">Listo para comer</option></select></div>
      </div>
      {foods.isPending ? <p role="status">Buscando alimentos...</p> : null}
      {foods.isError ? <p role="alert">No se pudieron cargar los alimentos.</p> : null}
      {!foods.isPending && !foods.isError && foods.data?.items.length === 0 ? <p role="status">No encontramos alimentos.</p> : null}
      <div className="food-selector__results">
        {foods.data?.items.map((food) => <button className={`food-selector__result${food.id === selectedFoodId ? ' is-selected' : ''}`} key={food.id} onClick={() => setSelectedFoodId(food.id)} type="button"><strong>{food.name}</strong><span>{preparationStateLabels[food.preparationState]}</span><small>{formatAmount(food.energyKcal)} kcal · {formatAmount(food.proteinGrams)} g de proteína</small></button>)}
      </div>
      {selectedFood ? (
        <div className="food-selector__selection">
          <h3>{selectedFood.name}</h3>
          <div className="form-field"><label htmlFor="selected-quantity">Cantidad</label><input id="selected-quantity" min="0.1" onChange={(event) => setQuantity(event.target.value)} step="0.1" type="number" value={quantity} /></div>
          <div className="form-field"><label htmlFor="selected-unit">Unidad</label><select id="selected-unit" onChange={(event) => { const nextUnit = event.target.value as MeasurementUnit; setUnit(nextUnit); setMeasurementMethod(nextUnit === 'SERVING' ? 'SERVING' : nextUnit === 'UNIT' ? 'UNIT' : 'WEIGHED'); }} value={unit}><option value="GRAM">Gramos</option><option value="MILLILITER">Mililitros</option><option value="UNIT">Unidad</option>{detail.data?.servings.length ? <option value="SERVING">Porción</option> : null}</select></div>
          {unit === 'SERVING' && detail.data?.servings.length ? <div className="form-field"><label htmlFor="selected-serving">Porción disponible</label><select id="selected-serving" onChange={(event) => setSelectedServingId(event.target.value)} value={selectedServing?.id ?? ''}>{detail.data.servings.map((serving) => <option key={serving.id} value={serving.id}>{serving.name}</option>)}</select></div> : null}
          <div className="form-field"><label htmlFor="selected-method">Método de medición</label><select id="selected-method" onChange={(event) => setMeasurementMethod(event.target.value as MeasurementMethod)} value={measurementMethod}><option value="WEIGHED">Pesado</option><option value="SERVING">Porción</option><option value="UNIT">Unidad</option><option value="APPROXIMATED">Aproximado</option></select></div>
          <button className="button button--primary" onClick={() => onSelect({ food: selectedFood, measurementMethod, quantity: Number(quantity), servingEquivalent: selectedServing?.equivalentGrams ?? selectedServing?.equivalentMilliliters, servingId: unit === 'SERVING' ? selectedServing?.id : undefined, unit })} type="button">Agregar alimento</button>
        </div>
      ) : null}
    </div>
  );
}
