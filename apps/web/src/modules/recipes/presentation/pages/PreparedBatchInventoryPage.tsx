import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { BackButton } from '../../../../shared/presentation/components/BackButton';
import { Badge } from '../../../../shared/presentation/components/Badge';
import { PreparationProgress } from '../components/PreparationProgress';
import {
  useConfirmPreparedBatchInventory,
  usePreparedBatchInventoryPreview,
} from '../hooks/usePreparedBatchInventory';
import type { PreparedBatchInventoryDecision } from '../../domain/PreparedBatchInventory';
import { formatQuantity, humanizeEnum, statusTone } from '../recipePresentation';
import '../recipes.css';

export function PreparedBatchInventoryPage() {
  const { batchId = '' } = useParams();
  const navigate = useNavigate();
  const preview = usePreparedBatchInventoryPreview(batchId);
  const confirm = useConfirmPreparedBatchInventory();
  const [decisions, setDecisions] = useState<
    Record<string, PreparedBatchInventoryDecision>
  >({});

  if (!batchId)
    return (
      <p className="page-section" role="alert">
        Falta identificar la preparación. Abre esta revisión desde su detalle.
      </p>
    );
  if (preview.isPending)
    return (
      <p className="page-section" role="status">
        Revisando ingredientes...
      </p>
    );
  if (preview.isError || !preview.data)
    return (
      <section className="page-section" role="alert">
        <p>No se pudo revisar el inventario de la preparación.</p>
        <button
          className="button button--secondary"
          onClick={() => void preview.refetch()}
          type="button"
        >
          Reintentar
        </button>
      </section>
    );

  const value = preview.data;
  const decisionFor = (ingredientId: string) => decisions[ingredientId];
  const setDecision = (decision: PreparedBatchInventoryDecision) =>
    setDecisions((current) => ({
      ...current,
      [decision.ingredientId]: decision,
    }));
  const allDecided = value.ingredients.every(
    (ingredient) =>
      Boolean(decisionFor(ingredient.ingredientId)) ||
      ingredient.status === 'CONFIRMED',
  );
  const selectedDecisions = value.ingredients
    .filter((ingredient) => ingredient.status !== 'CONFIRMED')
    .map((ingredient) => decisionFor(ingredient.ingredientId))
    .filter((decision): decision is PreparedBatchInventoryDecision =>
      Boolean(decision),
    );

  function submit() {
    if (!allDecided || !batchId || value.alreadyConfirmed) return;
    confirm.mutate(
      { batchId, decisions: selectedDecisions },
      { onSuccess: () => navigate(`/app/preparaciones/${batchId}`) },
    );
  }

  return (
    <section
      className="page-section preparation-page"
      aria-labelledby="prepared-batch-inventory-title"
    >
      <BackButton fallback={`/app/preparaciones/${batchId}`} />
      <PreparationProgress current="portions" />
      {value.alreadyConfirmed ? (
        <p className="preparation-callout" role="status">
          El consumo de ingredientes ya fue confirmado y no puede repetirse.
        </p>
      ) : null}
      <ul className="recipe-list">
        {value.ingredients.map((ingredient) => {
          const decision = decisionFor(ingredient.ingredientId);
          const unavailable =
            ingredient.availability === 'UNAVAILABLE' ||
            ingredient.availability === 'PARTIAL';
          return (
            <li className="recipe-list-row" key={ingredient.ingredientId}>
              <div className="recipe-list-row__content inventory-choice">
                <div className="recipe-list-row__heading">
                  <h2>{ingredient.name}</h2>
                  <Badge
                    tone={statusTone(
                      decision?.action === 'IGNORE'
                        ? 'IGNORED'
                        : ingredient.status,
                    )}
                  >
                    {statusLabel(
                    decision?.action === 'IGNORE'
                      ? 'IGNORED'
                      : ingredient.status,
                    )}
                  </Badge>
                </div>
                <p className="inventory-choice__amounts">
                  Utilizado: {formatQuantity(ingredient.usedQuantity, ingredient.unit)} ·{' '}
                  Disponible: {formatQuantity(ingredient.availableQuantity, ingredient.unit)}
                </p>
              {ingredient.options.length > 1 &&
              decision?.action !== 'IGNORE' ? (
                <div className="form-field">
                  <label htmlFor={`inventory-option-${ingredient.ingredientId}`}>
                    Existencia a descontar
                  </label>
                  <select
                    id={`inventory-option-${ingredient.ingredientId}`}
                    onChange={(event) =>
                      setDecision({
                        action: 'CONSUME',
                        ingredientId: ingredient.ingredientId,
                        inventoryItemId: event.target.value,
                      })
                    }
                    value={
                      decision?.inventoryItemId ??
                      ingredient.selectedInventoryItemId ??
                      ''
                    }
                  >
                    {ingredient.options.map((option) => (
                      <option
                        key={option.inventoryItemId}
                        value={option.inventoryItemId}
                      >
                        {formatQuantity(option.availableQuantity, option.unit)}
                        {option.location
                          ? ` · ${humanizeEnum(option.location)}`
                          : ' · Ubicación no indicada'}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              <div className="recipe-row-actions">
                {!value.alreadyConfirmed ? (
                  <>
                    <button
                      className="button button--secondary"
                      disabled={unavailable}
                      onClick={() =>
                        setDecision({
                          action: 'CONSUME',
                          ingredientId: ingredient.ingredientId,
                          inventoryItemId:
                            decision?.inventoryItemId ??
                            ingredient.selectedInventoryItemId ??
                            ingredient.options[0]?.inventoryItemId,
                        })
                      }
                      type="button"
                    >
                      Consumir
                    </button>
                    <button
                      className="button button--text"
                      onClick={() =>
                        setDecision({
                          action: 'IGNORE',
                          ingredientId: ingredient.ingredientId,
                        })
                      }
                      type="button"
                    >
                      Ignorar
                    </button>
                  </>
                ) : null}
              </div>
              </div>
            </li>
          );
        })}
      </ul>
      <section className="recipe-detail-section">
        <h2>Resumen</h2>
        <p>
          {
            selectedDecisions.filter(
              (decision) => decision.action === 'CONSUME',
            ).length
          }{' '}
          ingrediente
          {selectedDecisions.filter((decision) => decision.action === 'CONSUME')
            .length === 1
            ? ''
            : 's'}{' '}
          se descontarán y{' '}
          {
            selectedDecisions.filter((decision) => decision.action === 'IGNORE')
              .length
          }{' '}
          se ignorarán.
        </p>
        {confirm.isError ? (
          <p role="alert">
            No se pudo confirmar el consumo. Revisa las existencias e inténtalo
            nuevamente.
          </p>
        ) : null}
        <div className="recipe-page-actions">
          <Link
            className="button button--secondary"
            to={`/app/preparaciones/${batchId}`}
          >
            Volver
          </Link>
          {!value.alreadyConfirmed ? (
            <button
              className="button button--primary"
              disabled={!allDecided || confirm.isPending}
              onClick={submit}
              type="button"
            >
              {confirm.isPending ? 'Confirmando...' : 'Confirmar inventario'}
            </button>
          ) : null}
        </div>
      </section>
    </section>
  );
}

function statusLabel(status: string) {
  return (
    (
      {
        AVAILABLE: 'Disponible',
        PARTIAL: 'Parcial',
        UNAVAILABLE: 'Sin inventario',
        IGNORED: 'Ignorado',
        CONFIRMED: 'Confirmado',
      } as Record<string, string>
    )[status] ?? humanizeEnum(status)
  );
}
