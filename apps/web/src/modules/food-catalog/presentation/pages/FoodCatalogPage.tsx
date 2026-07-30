import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';

import type {
  FoodSearchCriteria,
  SearchPreparationState,
} from '../../application/ports/FoodCatalogGateway';
import { useFoodCategories, useFoodSearch } from '../hooks/useFoodCatalog';
import {
  formatAmount,
  formatReference,
  preparationStateLabels,
  searchPreparationStateLabels,
} from '../utils/foodLabels';

const PAGE_SIZE = 12;

export function FoodCatalogPage() {
  const [searchText, setSearchText] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [preparationState, setPreparationState] = useState<
    SearchPreparationState | ''
  >('');
  const [page, setPage] = useState(1);
  const categories = useFoodCategories();
  const criteria: FoodSearchCriteria = {
    categoryId: categoryId || undefined,
    limit: PAGE_SIZE,
    page,
    preparationState: preparationState || undefined,
    query: searchText,
  };
  const foods = useFoodSearch(criteria);
  const items = foods.data?.items ?? [];
  const pagination = foods.data?.pagination;
  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.total / pagination.limit))
    : 1;

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearchText(value);
    setPage(1);
  }

  function handleCategoryChange(value: string) {
    setCategoryId(value);
    setPage(1);
  }

  function handlePreparationChange(value: string) {
    setPreparationState(value as SearchPreparationState | '');
    setPage(1);
  }

  return (
    <section className="page-section food-catalog-page" aria-labelledby="food-catalog-title">
      <p className="eyebrow">Catalogo de alimentos</p>
      <h1 id="food-catalog-title">Encuentra un alimento</h1>
      <p className="lead">
        Busca ingredientes y consulta sus nutrientes para organizar mejor tus comidas.
      </p>

      <form className="food-search-form" onSubmit={handleSearchSubmit}>
        <div className="form-field food-search-form__query">
          <label htmlFor="food-search">Buscar alimentos</label>
          <input
            autoComplete="off"
            id="food-search"
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Ej. pollo"
            type="search"
            value={searchText}
          />
        </div>
        <div className="form-field">
          <label htmlFor="food-category">Categoria</label>
          <select
            id="food-category"
            onChange={(event) => handleCategoryChange(event.target.value)}
            value={categoryId}
          >
            <option value="">Todas las categorias</option>
            {categories.data?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {categories.isError ? (
            <p className="form-field__error" role="alert">
              No se pudieron cargar las categorias.
            </p>
          ) : null}
        </div>
        <div className="form-field">
          <label htmlFor="food-preparation">Preparacion</label>
          <select
            id="food-preparation"
            onChange={(event) => handlePreparationChange(event.target.value)}
            value={preparationState}
          >
            <option value="">Todas</option>
            {Object.entries(searchPreparationStateLabels).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ),
            )}
          </select>
        </div>
        <button className="button button--primary" type="submit">
          Buscar
        </button>
      </form>

      <div aria-live="polite" className="food-search-status">
        {foods.isFetching ? <p role="status">Buscando alimentos...</p> : null}
        {!foods.isPending && foods.isError ? (
          <p role="alert">No se pudieron cargar los alimentos.</p>
        ) : null}
        {!foods.isPending && !foods.isError && pagination ? (
          <p>{pagination.total} resultados</p>
        ) : null}
      </div>

      {!foods.isPending && !foods.isError && items.length === 0 ? (
        <div className="food-empty-state" role="status">
          <h2>No encontramos alimentos</h2>
          <p>Prueba con otro nombre o cambia los filtros de busqueda.</p>
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="food-result-list">
          {items.map((food) => (
            <FoodResultCard key={food.id} food={food} />
          ))}
        </div>
      ) : null}

      {pagination && pagination.total > 0 ? (
        <nav aria-label="Paginacion de alimentos" className="food-pagination">
          <button
            className="button button--secondary"
            disabled={page <= 1 || foods.isFetching}
            onClick={() => setPage((currentPage) => currentPage - 1)}
            type="button"
          >
            Anterior
          </button>
          <span>
            Pagina {page} de {totalPages}
          </span>
          <button
            className="button button--secondary"
            disabled={page >= totalPages || foods.isFetching}
            onClick={() => setPage((currentPage) => currentPage + 1)}
            type="button"
          >
            Siguiente
          </button>
        </nav>
      ) : null}
    </section>
  );
}

function FoodResultCard({
  food,
}: {
  food: import('../../application/ports/FoodCatalogGateway').FoodSummary;
}) {
  return (
    <Link className="food-result-card" to={`/app/alimentos/${food.id}`}>
      <article>
        <div className="food-result-card__heading">
          <div>
            <h2>{food.name}</h2>
            {food.brand ? <p>{food.brand}</p> : null}
          </div>
          <span className="food-tag">
            {preparationStateLabels[food.preparationState]}
          </span>
        </div>
        <p className="food-result-card__category">{food.category.name}</p>
        <dl className="food-macro-list">
          <div>
            <dt>Energia</dt>
            <dd>{formatAmount(food.energyKcal)} kcal</dd>
          </div>
          <div>
            <dt>Proteina</dt>
            <dd>{formatAmount(food.proteinGrams)} g</dd>
          </div>
          <div>
            <dt>Carbohidratos</dt>
            <dd>{formatAmount(food.carbohydrateGrams)} g</dd>
          </div>
          <div>
            <dt>Grasa</dt>
            <dd>{formatAmount(food.fatGrams)} g</dd>
          </div>
        </dl>
        <small>Valores por {formatReference(food)}</small>
      </article>
    </Link>
  );
}
