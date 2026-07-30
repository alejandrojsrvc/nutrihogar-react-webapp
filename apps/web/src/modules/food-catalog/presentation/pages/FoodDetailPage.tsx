import { Link, useParams } from 'react-router';

import { useFoodDetail } from '../hooks/useFoodCatalog';
import {
  formatAmount,
  formatReference,
  formatServingUnit,
  getConfidenceLevelLabel,
  preparationStateLabels,
} from '../utils/foodLabels';

export function FoodDetailPage() {
  const { foodId } = useParams<{ foodId: string }>();
  const foodDetail = useFoodDetail(foodId);

  if (!foodId || foodDetail.isError) {
    return (
      <FoodDetailStatus
        isError
        message="No se pudo cargar el detalle del alimento."
      />
    );
  }

  if (foodDetail.isPending || !foodDetail.data) {
    return <FoodDetailStatus message="Cargando detalle del alimento..." />;
  }

  const food = foodDetail.data;

  return (
    <section className="page-section food-detail-page" aria-labelledby="food-detail-title">
      <Link className="auth-link food-back-link" to="/app/alimentos">
        Volver al catalogo
      </Link>
      <p className="eyebrow">Detalle del alimento</p>
      <h1 id="food-detail-title">{food.name}</h1>
      {food.brand ? <p className="lead food-detail-brand">{food.brand}</p> : null}

      <div className="food-detail-meta">
        <span>{food.category.name}</span>
        <span>{preparationStateLabels[food.preparationState]}</span>
        <span>Valores por {formatReference(food)}</span>
      </div>

      <section className="food-detail-section" aria-labelledby="food-main-nutrients-title">
        <h2 id="food-main-nutrients-title">Nutrientes principales</h2>
        <dl className="food-detail-highlights">
          <FoodNutrientHighlight label="Energia" unit="kcal" value={food.energyKcal} />
          <FoodNutrientHighlight label="Proteina" unit="g" value={food.proteinGrams} />
          <FoodNutrientHighlight
            label="Carbohidratos"
            unit="g"
            value={food.carbohydrateGrams}
          />
          <FoodNutrientHighlight label="Grasa" unit="g" value={food.fatGrams} />
        </dl>
      </section>

      <section className="food-detail-section" aria-labelledby="food-nutrients-title">
        <h2 id="food-nutrients-title">Nutrientes completos</h2>
        {food.nutrients.length === 0 ? (
          <p className="empty-copy">Este alimento no tiene nutrientes adicionales.</p>
        ) : (
          <div className="food-table-wrapper">
            <table className="food-nutrients-table">
              <caption className="visually-hidden">Nutrientes completos del alimento</caption>
              <thead>
                <tr>
                  <th scope="col">Nutriente</th>
                  <th scope="col">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {food.nutrients.map((nutrient) => (
                  <tr key={nutrient.id}>
                    <th scope="row">{nutrient.nutrientDefinition.name}</th>
                    <td>
                      {formatAmount(nutrient.amount)} {nutrient.nutrientDefinition.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="food-detail-section" aria-labelledby="food-servings-title">
        <h2 id="food-servings-title">Porciones</h2>
        {food.servings.length === 0 ? (
          <p className="empty-copy">Este alimento no tiene porciones registradas.</p>
        ) : (
          <ul className="food-serving-list">
            {food.servings.map((serving) => (
              <li key={serving.id}>
                <strong>{serving.name}</strong>
                <span>
                  {formatAmount(serving.quantity)} {formatServingUnit(serving.unit)}
                </span>
                {serving.equivalentGrams !== null ? (
                  <small>{formatAmount(serving.equivalentGrams)} g equivalentes</small>
                ) : null}
                {serving.equivalentMilliliters !== null ? (
                  <small>
                    {formatAmount(serving.equivalentMilliliters)} ml equivalentes
                  </small>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="food-detail-section" aria-labelledby="food-source-title">
        <h2 id="food-source-title">Fuente y confianza</h2>
        <dl className="food-source-list">
          <div>
            <dt>Fuente</dt>
            <dd>{food.source}</dd>
          </div>
          <div>
            <dt>Nivel de confianza</dt>
            <dd>{getConfidenceLevelLabel(food.confidenceLevel)}</dd>
          </div>
          {food.sourceReference ? (
            <div>
              <dt>Referencia</dt>
              <dd>{food.sourceReference}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      {food.description ? (
        <section className="food-detail-section" aria-labelledby="food-description-title">
          <h2 id="food-description-title">Descripcion</h2>
          <p>{food.description}</p>
        </section>
      ) : null}

      {food.aliases.length > 0 ? (
        <section className="food-detail-section" aria-labelledby="food-aliases-title">
          <h2 id="food-aliases-title">Tambien conocido como</h2>
          <p>{food.aliases.join(', ')}</p>
        </section>
      ) : null}
    </section>
  );
}

function FoodNutrientHighlight({
  label,
  unit,
  value,
}: {
  label: string;
  unit: string;
  value: number | null;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>
        {formatAmount(value)} <small>{unit}</small>
      </dd>
    </div>
  );
}

function FoodDetailStatus({
  isError = false,
  message,
}: {
  isError?: boolean;
  message: string;
}) {
  return (
    <section className="page-section" aria-labelledby="food-detail-status-title">
      <p className="eyebrow">Detalle del alimento</p>
      <h1 id="food-detail-status-title">Alimento</h1>
      <p className="lead" role={isError ? 'alert' : 'status'}>
        {message}
      </p>
      {isError ? (
        <Link className="button button--secondary" to="/app/alimentos">
          Volver al catalogo
        </Link>
      ) : null}
    </section>
  );
}
