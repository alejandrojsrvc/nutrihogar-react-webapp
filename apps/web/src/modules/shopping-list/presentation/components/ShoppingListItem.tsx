import { Button } from '../../../../shared/presentation/components/Button';
import type { ShoppingListItem as ShoppingListItemModel } from '../../domain/ShoppingList';

export function ShoppingListItem({
  item,
  isSelected,
  isMarking,
  isReadOnly,
  isRemoving,
  onToggle,
  onMarkPurchased,
  onEdit,
  onRemove,
}: {
  item: ShoppingListItemModel;
  isSelected: boolean;
  isMarking: boolean;
  isReadOnly: boolean;
  isRemoving: boolean;
  onToggle: (selected: boolean) => void;
  onMarkPurchased: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <li className={item.purchased ? 'is-purchased' : ''}>
      <div className="shopping-list-item__heading">
        <input
          aria-label={`Incluir ${item.name} en la compra`}
          checked={isSelected}
          disabled={item.purchased || isReadOnly}
          onChange={(event) => onToggle(event.target.checked)}
          type="checkbox"
        />
        <div>
          <strong>{item.name}</strong>
          <span className="shopping-list-item__meta">
            {item.quantity} {unitLabel(item.unit)} · {sourceLabel(item.source)}
          </span>
        </div>
      </div>
      <div className="shopping-list-item-actions">
        {!item.purchased ? (
          <Button
            disabled={isMarking || isReadOnly}
            onClick={onMarkPurchased}
            variant="secondary"
          >
            Marcar comprado
          </Button>
        ) : (
          <span>Comprado</span>
        )}
        <details className="shopping-list-item-more">
          <summary>Más</summary>
          <div>
            <Button
              disabled={item.purchased || isReadOnly}
              onClick={onEdit}
              variant="text"
            >
              Editar
            </Button>
            <Button
              className="button--danger-text"
              disabled={isRemoving || isReadOnly}
              onClick={onRemove}
              variant="text"
            >
              Eliminar
            </Button>
          </div>
        </details>
      </div>
    </li>
  );
}

function sourceLabel(source: string) {
  return source === 'BELOW_MINIMUM'
    ? 'Bajo mínimo'
    : source === 'DEPLETED'
      ? 'Agotado'
      : source === 'MEAL_PLAN'
        ? 'Plan semanal'
        : 'Manual';
}

function unitLabel(unit: string) {
  return (
    {
      GRAM: 'g',
      MILLILITER: 'ml',
      SERVING: 'porción',
      UNIT: 'unidad',
    }[unit] ?? unit
  );
}
