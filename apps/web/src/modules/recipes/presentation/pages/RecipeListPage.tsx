import { useEffect, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { Link } from 'react-router';
import { Badge } from '../../../../shared/presentation/components/Badge';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { EmptyState } from '../../../../shared/presentation/components/EmptyState';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { humanizeEnum, statusTone } from '../recipePresentation';
import { useRecipes } from '../hooks/useRecipes';
import '../recipes.css';

const pageSize = 12;

export function RecipeListPage() {
  const households = useHouseholds();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);
  const recipes = useRecipes(households.activeHousehold?.id, {
    category: category || undefined,
    limit: pageSize,
    page,
    query: query || undefined,
  });

  if (households.isPending)
    return (
      <p className="page-section" role="status">
        Cargando hogar...
      </p>
    );
  if (households.isError || !households.activeHousehold)
    return (
      <p className="page-section" role="alert">
        No se pudo cargar el hogar activo.
      </p>
    );

  return (
    <section
      className="page-section recipe-list-page"
      aria-labelledby="recipe-list-title"
    >
      <PageHeader
        action={
          <Link className="button button--primary" to="/app/recetas/nueva">
            Crear receta
          </Link>
        }
        eyebrow="Recetas familiares"
        title="Recetas del hogar"
        titleId="recipe-list-title"
        description="Encuentra preparaciones que tu familia repite con frecuencia."
        icon={<BookOpen size={22} />}
      />
      <div className="recipe-filters">
        <div className="form-field">
          <label htmlFor="recipe-search">Buscar receta</label>
          <input
            aria-describedby="recipe-search-hint"
            id="recipe-search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ej. arroz con pollo"
            type="search"
            value={search}
          />
          <span className="supporting-text" id="recipe-search-hint">
            <Search size={14} aria-hidden="true" /> Busca por nombre o ingrediente.
          </span>
        </div>
        <div className="form-field">
          <label htmlFor="recipe-category">Categoría</label>
          <select
            id="recipe-category"
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
            value={category}
          >
            <option value="">Todas</option>
            <option value="BREAKFAST">Desayuno</option>
            <option value="LUNCH">Almuerzo</option>
            <option value="SNACK">Merienda</option>
            <option value="DINNER">Cena</option>
          </select>
        </div>
      </div>
      {recipes.isPending ? <p role="status">Cargando recetas...</p> : null}
      {recipes.isError ? (
        <div role="alert">
          <p>No se pudieron cargar las recetas.</p>
          <button
            className="button button--secondary"
            onClick={() => void recipes.refetch()}
            type="button"
          >
            Reintentar
          </button>
        </div>
      ) : null}
      {recipes.data && recipes.data.items.length === 0 ? (
        <EmptyState
          title={
            query || category
              ? 'No encontramos recetas'
              : 'Todavía no hay recetas'
          }
          description={
            query || category
              ? 'Prueba con otra búsqueda o filtro.'
              : 'Cuando tu hogar cree recetas, aparecerán aquí.'
          }
        />
      ) : null}
      {recipes.data && recipes.data.items.length > 0 ? (
        <ul className="recipe-list" aria-label="Recetas familiares">
          {recipes.data.items.map((recipe) => (
            <li className="recipe-list-row" key={recipe.id}>
              <Link
                className="recipe-list-row__link"
                to={`/app/recetas/${recipe.id}`}
              >
                <div className="recipe-list-row__heading">
                  <h2>{recipe.name}</h2>
                  <Badge tone={statusTone(recipe.status)}>
                    {humanizeEnum(recipe.status)}
                  </Badge>
                </div>
                {recipe.category ? (
                  <p className="supporting-text">
                    {humanizeEnum(recipe.category)}
                  </p>
                ) : null}
                <dl>
                  <div>
                    <dt>Preparación</dt>
                    <dd>
                      {recipe.estimatedPreparationMinutes == null
                        ? 'Sin estimar'
                        : `${recipe.estimatedPreparationMinutes} min`}
                    </dd>
                  </div>
                  <div>
                    <dt>Ingredientes</dt>
                    <dd>{recipe.ingredients.length}</dd>
                  </div>
                  <div>
                    <dt>Porciones</dt>
                    <dd>{recipe.defaultServings}</dd>
                  </div>
                </dl>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {recipes.data && recipes.data.total > pageSize ? (
        <nav className="recipe-pagination" aria-label="Paginación de recetas">
          <button
            className="button button--secondary"
            disabled={page <= 1 || recipes.isFetching}
            onClick={() => setPage((current) => current - 1)}
            type="button"
          >
            Anterior
          </button>
          <span>Página {page}</span>
          <button
            className="button button--secondary"
            disabled={
              page * pageSize >= recipes.data.total || recipes.isFetching
            }
            onClick={() => setPage((current) => current + 1)}
            type="button"
          >
            Siguiente
          </button>
        </nav>
      ) : null}
    </section>
  );
}
