import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router';
import { Apple, ChevronRight, Search } from 'lucide-react';

import type {
  FoodSearchCriteria,
  SearchPreparationState,
} from '../../application/ports/FoodCatalogGateway';
import { useFoodCategories, useFoodSearch } from '../hooks/useFoodCatalog';
import '../food-catalog.css';
import {
  formatAmount,
  formatReference,
  preparationStateLabels,
  searchPreparationStateLabels,
} from '../utils/foodLabels';

const PAGE_SIZE = 12;

export function FoodCatalogPage() {
  const location = useLocation();
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
  const hasFilters = Boolean(searchText || categoryId || preparationState);
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

  function clearFilters() {
    setSearchText('');
    setCategoryId('');
    setPreparationState('');
    setPage(1);
  }

  return (
    <section
      className="page-section food-catalog-page"
      aria-labelledby="food-catalog-title"
    >
      {getCatalogFeedback(location.state) ? (
        <p className="food-feedback" role="status">
          {getCatalogFeedback(location.state)}
        </p>
      ) : null}
      <form className="food-search-form" onSubmit={handleSearchSubmit}>
        <div className="food-search-control food-search-form__query">
          <Search aria-hidden="true" size={20} />
          <label className="visually-hidden" htmlFor="food-search">
            Buscar alimentos
          </label>
          <input
            autoComplete="off"
            id="food-search"
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Buscar por nombre o marca"
            type="search"
            value={searchText}
          />
        </div>
        <div className="food-filter-control">
          <label className="visually-hidden" htmlFor="food-category">
            Categoría
          </label>
          <select
            disabled={categories.isPending || categories.isError}
            id="food-category"
            onChange={(event) => handleCategoryChange(event.target.value)}
            value={categoryId}
          >
            <option value="">Todas las categorías</option>
            {categories.data?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="food-filter-control">
          <label className="visually-hidden" htmlFor="food-preparation">
            Preparación
          </label>
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
        <button
          className="button button--secondary food-search-submit"
          type="submit"
        >
          Buscar
        </button>
      </form>

      {categories.isError ? (
        <p className="food-inline-error" role="alert">
          Las categorías no están disponibles. Aún puedes buscar por nombre.
        </p>
      ) : null}

      <div aria-live="polite" className="food-search-status">
        {foods.isPending ? <p role="status">Cargando alimentos...</p> : null}
        {!foods.isPending && foods.isFetching ? (
          <p role="status">Actualizando resultados...</p>
        ) : null}
        {!foods.isPending && !foods.isError && pagination ? (
          <p>
            {pagination.total}{' '}
            {pagination.total === 1 ? 'alimento' : 'alimentos'}
          </p>
        ) : null}
      </div>

      {!foods.isPending && foods.isError ? (
        <div className="food-error-state" role="alert">
          <div>
            <h2>No pudimos cargar los alimentos</h2>
            <p>Tu búsqueda y filtros siguen disponibles.</p>
          </div>
          <button
            className="button button--secondary"
            onClick={() => void foods.refetch()}
            type="button"
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {!foods.isPending && !foods.isError && items.length === 0 ? (
        <div className="food-empty-state" role="status">
          <h2>No encontramos alimentos</h2>
          <p>
            {hasFilters
              ? 'Prueba con otro nombre o limpia los filtros.'
              : 'Todavía no hay alimentos disponibles en este catálogo.'}
          </p>
          {hasFilters ? (
            <button
              className="button button--secondary"
              onClick={clearFilters}
              type="button"
            >
              Limpiar búsqueda
            </button>
          ) : null}
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="food-result-list" aria-label="Resultados de alimentos">
          {items.map((food) => (
            <FoodResultCard key={food.id} food={food} />
          ))}
        </div>
      ) : null}

      {pagination && pagination.total > 0 ? (
        <nav aria-label="Paginación de alimentos" className="food-pagination">
          <button
            className="button button--secondary"
            disabled={page <= 1 || foods.isFetching}
            onClick={() => setPage((currentPage) => currentPage - 1)}
            type="button"
          >
            Anterior
          </button>
          <span>
            Página {page} de {totalPages}
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

function getCatalogFeedback(state: unknown): string | null {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const feedback = state as { foodDeleted?: boolean };
  return feedback.foodDeleted
    ? 'El alimento se eliminó correctamente de tu catálogo.'
    : null;
}

function FoodResultCard({
  food,
}: {
  food: import('../../application/ports/FoodCatalogGateway').FoodSummary;
}) {
  return (
    <Link className="food-result-card" to={`/app/alimentos/${food.id}`}>
      <article>
        <span className="food-result-card__icon" aria-hidden="true">
          <Apple size={21} />
        </span>
        <div className="food-result-card__heading">
          <div>
            <h2>{food.name}</h2>
            {food.brand ? <p>{food.brand}</p> : null}
          </div>
          <p className="food-result-card__category">
            {food.category.name} ·{' '}
            {preparationStateLabels[food.preparationState]}
          </p>
        </div>
        <dl className="food-macro-list">
          <div>
            <dt>Energía</dt>
            <dd>{formatAmount(food.energyKcal)} kcal</dd>
          </div>
          <div>
            <dt>Proteína</dt>
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
        <small className="food-result-card__reference">
          Por {formatReference(food)}
        </small>
        <ChevronRight
          aria-hidden="true"
          className="food-result-card__chevron"
          size={20}
        />
      </article>
    </Link>
  );
}
