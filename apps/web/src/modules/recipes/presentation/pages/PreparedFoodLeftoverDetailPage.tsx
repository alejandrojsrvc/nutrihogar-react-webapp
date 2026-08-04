import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { Badge } from '../../../../shared/presentation/components/Badge';
import { Dialog } from '../../../../shared/presentation/components/Overlay';
import {
  useAddPreparedFoodLeftoverToInventory,
  usePreparedFoodLeftover,
  useUpdatePreparedFoodLeftoverStatus,
} from '../hooks/usePreparedFoodLeftovers';
import {
  formatDateTime,
  formatNutrientAmount,
  humanizeEnum,
  statusTone,
} from '../recipePresentation';
import '../recipes.css';

export function PreparedFoodLeftoverDetailPage() {
  const { leftoverId = '' } = useParams();
  const navigate = useNavigate();
  const leftover = usePreparedFoodLeftover(leftoverId);
  const updateStatus = useUpdatePreparedFoodLeftoverStatus();
  const addToInventory = useAddPreparedFoodLeftoverToInventory();
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);

  if (!leftoverId)
    return (
      <p className="page-section" role="alert">
        Falta identificar el sobrante. Vuelve a la lista e inténtalo nuevamente.
      </p>
    );
  if (leftover.isPending)
    return (
      <p className="page-section" role="status">
        Cargando sobrante...
      </p>
    );
  if (leftover.isError || !leftover.data)
    return (
      <p className="page-section" role="alert">
        No se pudo cargar el sobrante.
      </p>
    );

  const value = leftover.data;
  const available = value.status === 'AVAILABLE';
  const selectedQuantity =
    quantity === '' ? value.availableWeight : Number(quantity);
  const invalidQuantity =
    !Number.isFinite(selectedQuantity) ||
    selectedQuantity <= 0 ||
    selectedQuantity > value.availableWeight;

  function addInventory() {
    if (invalidQuantity) return;
    addToInventory.mutate(
      {
        leftoverId,
        input: {
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          location: location.trim() || null,
          quantity: selectedQuantity,
        },
      },
      { onSuccess: (item) => navigate(`/app/inventario/${item.id}`) },
    );
  }

  return (
    <section
      className="page-section leftover-page"
      aria-labelledby="leftover-detail-title"
    >
      <BackButton fallback="/app/sobrantes" />
      <div className="recipe-status-line">
        <Badge tone={statusTone(value.status)}>
          {humanizeEnum(value.status)}
        </Badge>
      </div>
      <dl className="recipe-detail-meta">
        <div>
          <dt>Disponible</dt>
          <dd>{value.availableWeight} g</dd>
        </div>
        <div>
          <dt>Guardado</dt>
          <dd>{formatDateTime(value.storedAt)}</dd>
        </div>
        <div>
          <dt>Ubicación actual</dt>
          <dd>{humanizeEnum(value.storageLocation)}</dd>
        </div>
      </dl>
      <section className="recipe-detail-section">
        <h2>Densidad nutricional</h2>
        <dl className="nutrition-value-list">
          {Object.entries(value.nutrientDensitySnapshot).map(
            ([key, amount]) => (
              <div key={key}>
                <dt>{humanizeEnum(key)}</dt>
                <dd>{formatNutrientAmount(amount, key)} por g</dd>
              </div>
            ),
          )}
        </dl>
      </section>
      {value.notes ? (
        <p className="meal-detail-notes">
          <strong>Nota:</strong> {value.notes}
        </p>
      ) : null}
      {updateStatus.isError || addToInventory.isError ? (
        <p role="alert">
          No se pudo actualizar el sobrante. Si ya fue agregado, esta operación
          no puede repetirse.
        </p>
      ) : null}
      {available ? (
        <section
          className="recipe-detail-section"
          aria-labelledby="add-leftover-title"
        >
          <h2 id="add-leftover-title">Agregar al inventario</h2>
          <form
            className="leftover-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!invalidQuantity) setInventoryDialogOpen(true);
            }}
          >
            <fieldset className="preparation-fieldset">
              <legend>Cantidad y ubicación</legend>
              <div className="form-field">
                <label htmlFor="leftover-quantity">Cantidad (g)</label>
                <input
                  id="leftover-quantity"
                  inputMode="decimal"
                  max={value.availableWeight}
                  min="0.1"
                  onChange={(event) => setQuantity(event.target.value)}
                  step="0.1"
                  type="number"
                  value={quantity}
                />
                <p className="supporting-text">
                  Disponible: {value.availableWeight} g
                </p>
              </div>
              <div className="form-field">
                <label htmlFor="leftover-location">Ubicación</label>
                <input
                  id="leftover-location"
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Ej. Refrigerador"
                  type="text"
                  value={location}
                />
              </div>
            </fieldset>
            <fieldset className="preparation-fieldset">
              <legend>Conservación</legend>
              <div className="form-field">
                <label htmlFor="leftover-expires-at">
                  Vencimiento opcional
                </label>
                <input
                  id="leftover-expires-at"
                  onChange={(event) => setExpiresAt(event.target.value)}
                  type="datetime-local"
                  value={expiresAt}
                />
              </div>
            </fieldset>
            <div className="recipe-page-actions">
              <button
                className="button button--primary"
                disabled={addToInventory.isPending || invalidQuantity}
                type="submit"
              >
                {addToInventory.isPending
                  ? 'Agregando...'
                  : 'Agregar al inventario'}
              </button>
              <button
                className="button button--secondary"
                disabled={updateStatus.isPending}
                onClick={() =>
                  updateStatus.mutate(
                    { leftoverId, status: 'CONSUMED' },
                    { onSuccess: () => navigate('/app/sobrantes') },
                  )
                }
                type="button"
              >
                Consumir sobrante
              </button>
              <button
                className="button button--danger"
                disabled={updateStatus.isPending}
                onClick={() =>
                  updateStatus.mutate(
                    { leftoverId, status: 'DISCARDED' },
                    { onSuccess: () => navigate('/app/sobrantes') },
                  )
                }
                type="button"
              >
                Descartar sobrante
              </button>
            </div>
          </form>
        </section>
      ) : null}
      <Link
        className="button button--secondary"
        to={`/app/preparaciones/${value.preparedBatchId}`}
      >
        Ver preparación original
      </Link>
      <Dialog
        onClose={() => setInventoryDialogOpen(false)}
        open={inventoryDialogOpen}
        title="Agregar sobrante al inventario"
      >
        <p>
          Se agregarán {selectedQuantity} g al inventario con la trazabilidad de
          este sobrante.
        </p>
        {addToInventory.isError ? (
          <p role="alert">
            No se pudo agregar al inventario. Revisa si esta operación ya fue
            realizada.
          </p>
        ) : null}
        <div className="recipe-dialog-actions">
          <button
            className="button button--secondary"
            onClick={() => setInventoryDialogOpen(false)}
            type="button"
          >
            Revisar datos
          </button>
          <button
            className="button button--primary"
            disabled={addToInventory.isPending}
            onClick={addInventory}
            type="button"
          >
            {addToInventory.isPending
              ? 'Agregando...'
              : 'Confirmar en inventario'}
          </button>
        </div>
      </Dialog>
    </section>
  );
}
