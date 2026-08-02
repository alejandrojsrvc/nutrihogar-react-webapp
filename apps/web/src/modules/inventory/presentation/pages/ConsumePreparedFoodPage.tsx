import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { formatCalories, formatGrams } from '@nutrihogar/domain';
import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { usePreparedFoodLeftover } from '../../../recipes/presentation/hooks/usePreparedFoodLeftovers';
import { useConsumePreparedFood, useInventoryItem } from '../hooks/useInventory';

export function ConsumePreparedFoodPage() {
  const { inventoryItemId = '' } = useParams();
  const navigate = useNavigate();
  const item = useInventoryItem(inventoryItemId);
  const profiles = useAdultProfiles(item.data?.householdId);
  const leftover = usePreparedFoodLeftover(item.data?.preparedFoodLeftoverId ?? undefined);
  const consume = useConsumePreparedFood();
  const [profileId, setProfileId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [mealType, setMealType] = useState<'BREAKFAST' | 'LUNCH' | 'SNACK' | 'DINNER' | 'EXTRA'>('LUNCH');
  const [consumedAt, setConsumedAt] = useState(toDateTimeLocal(new Date()));

  if (item.isPending) return <p className="page-section" role="status">Cargando preparado...</p>;
  if (item.isError || !item.data) return <p className="page-section" role="alert">No se pudo cargar el preparado.</p>;
  if (item.data.itemType !== 'PREPARED_FOOD') return <section className="page-section" role="alert"><p>Esta acción solo está disponible para alimentos preparados.</p><Link className="button button--secondary" to={`/app/inventario/${item.data.id}`}>Volver al inventario</Link></section>;

  const value = item.data;
  const amount = Number(quantity) || 0;
  const invalidQuantity = amount <= 0 || amount > value.currentQuantity;
  const selectedProfile = profileId || profiles.profiles[0]?.id || '';
  const density = leftover.data?.nutrientDensitySnapshot ?? {};
  const estimated = {
    calories: amount * numberFrom(density, ['calories', 'ENERGY_KCAL', 'CALORIES']),
    protein: amount * numberFrom(density, ['proteinGrams', 'PROTEIN']),
    carbohydrates: amount * numberFrom(density, ['carbohydrateGrams', 'CARBOHYDRATE', 'CARBS']),
    fat: amount * numberFrom(density, ['fatGrams', 'FAT']),
  };

  function submit() {
    if (!selectedProfile || invalidQuantity) return;
    consume.mutate({ item: value, input: { adultProfileId: selectedProfile, consumedAt: new Date(consumedAt), mealType, quantity: amount } }, { onSuccess: () => navigate(`/app/resumen/${consumedAt.slice(0, 10)}`) });
  }

  return <section className="page-section" aria-labelledby="consume-prepared-title"><BackButton fallback={`/app/inventario/${value.id}`} /><PageHeader eyebrow="Consumo de preparado" title={value.name} titleId="consume-prepared-title" description="Este consumo actualizará el inventario y creará una comida con el origen de la preparación." /><dl className="inventory-detail-meta"><div><dt>Disponible</dt><dd>{value.currentQuantity} {unitLabel(value.unit)}</dd></div><div><dt>Origen</dt><dd>{value.preparedFoodLeftoverId ? 'Sobrante preparado' : 'Preparación'}</dd></div></dl><div className="form-field"><label htmlFor="prepared-adult">Adulto</label><select id="prepared-adult" onChange={(event) => setProfileId(event.target.value)} value={selectedProfile}><option value="">Selecciona un adulto</option>{profiles.profiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}</select></div><div className="form-field"><label htmlFor="prepared-quantity">Cantidad ({unitLabel(value.unit)})</label><input id="prepared-quantity" inputMode="decimal" max={value.currentQuantity} min="0.1" onChange={(event) => setQuantity(event.target.value)} step="0.1" type="number" value={quantity} /><p className="supporting-text">Saldo después: {Math.max(value.currentQuantity - amount, 0)} {unitLabel(value.unit)}</p></div><div className="form-field"><label htmlFor="prepared-meal-type">Tipo de comida</label><select id="prepared-meal-type" onChange={(event) => setMealType(event.target.value as typeof mealType)} value={mealType}><option value="BREAKFAST">Desayuno</option><option value="LUNCH">Almuerzo</option><option value="SNACK">Merienda</option><option value="DINNER">Cena</option><option value="EXTRA">Extra</option></select></div><div className="form-field"><label htmlFor="prepared-consumed-at">Fecha y hora</label><input id="prepared-consumed-at" onChange={(event) => setConsumedAt(event.target.value)} type="datetime-local" value={consumedAt} /></div><section className="recipe-detail-section"><h2>Previsualización nutricional</h2>{leftover.isPending ? <p role="status">Cargando estimación...</p> : <dl className="nutrition-value-list"><div><dt>Calorías estimadas</dt><dd>{formatCalories(estimated.calories)}</dd></div><div><dt>Proteína estimada</dt><dd>{formatGrams(estimated.protein)}</dd></div><div><dt>Carbohidratos estimados</dt><dd>{formatGrams(estimated.carbohydrates)}</dd></div><div><dt>Grasas estimadas</dt><dd>{formatGrams(estimated.fat)}</dd></div></dl>}<p className="supporting-text">El backend confirmará los nutrientes definitivos y conservará el origen en la comida.</p></section>{consume.isError ? <p role="alert">No se pudo registrar el consumo. Verifica la disponibilidad e inténtalo nuevamente.</p> : null}<div className="recipe-form__actions"><Link className="button button--secondary" to={`/app/inventario/${value.id}`}>Cancelar</Link><button className="button button--primary" disabled={invalidQuantity || !selectedProfile || consume.isPending} onClick={submit} type="button">{consume.isPending ? 'Guardando...' : 'Registrar consumo'}</button></div></section>;
}

function numberFrom(values: Record<string, number>, keys: string[]) { const key = keys.find((candidate) => values[candidate] !== undefined); return key ? Number(values[key]) / 100 : 0; }
function unitLabel(unit: string) { return unit === 'GRAM' ? 'g' : unit === 'MILLILITER' ? 'ml' : 'un.'; }
function toDateTimeLocal(value: Date) { const offset = value.getTimezoneOffset() * 60000; return new Date(value.getTime() - offset).toISOString().slice(0, 16); }
