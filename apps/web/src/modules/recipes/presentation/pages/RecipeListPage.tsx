import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { EmptyState } from '../../../../shared/presentation/components/EmptyState';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { useRecipes } from '../hooks/useRecipes';

const pageSize = 12;

export function RecipeListPage() {
  const households = useHouseholds();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [page, setPage] = useState(1);
  useEffect(() => { const timer = window.setTimeout(() => { setQuery(search); setPage(1); }, 350); return () => window.clearTimeout(timer); }, [search]);
  const recipes = useRecipes(households.activeHousehold?.id, { category: category || undefined, limit: pageSize, page, query: query || undefined, status: status || undefined });

  if (households.isPending) return <p className="page-section" role="status">Cargando hogar...</p>;
  if (households.isError || !households.activeHousehold) return <p className="page-section" role="alert">No se pudo cargar el hogar activo.</p>;

  return <section className="page-section recipe-list-page" aria-labelledby="recipe-list-title"><PageHeader action={<button className="button button--primary" disabled title="Disponible al implementar el formulario de recetas" type="button">Crear receta</button>} eyebrow="Recetas familiares" title="Recetas del hogar" titleId="recipe-list-title" description="Encuentra preparaciones que tu familia repite con frecuencia." /><div className="recipe-filters"><div className="form-field"><label htmlFor="recipe-search">Buscar receta</label><input id="recipe-search" onChange={(event) => setSearch(event.target.value)} placeholder="Ej. arroz con pollo" type="search" value={search} /></div><div className="form-field"><label htmlFor="recipe-category">Categoría</label><select id="recipe-category" onChange={(event) => { setCategory(event.target.value); setPage(1); }} value={category}><option value="">Todas</option><option value="BREAKFAST">Desayuno</option><option value="LUNCH">Almuerzo</option><option value="SNACK">Merienda</option><option value="DINNER">Cena</option></select></div><div className="form-field"><label htmlFor="recipe-status">Estado</label><select id="recipe-status" onChange={(event) => { setStatus(event.target.value); setPage(1); }} value={status}><option value="ACTIVE">Activas</option><option value="ARCHIVED">Archivadas</option></select></div></div>{recipes.isPending ? <p role="status">Cargando recetas...</p> : null}{recipes.isError ? <div role="alert"><p>No se pudieron cargar las recetas.</p><button className="button button--secondary" onClick={() => void recipes.refetch()} type="button">Reintentar</button></div> : null}{recipes.data && recipes.data.items.length === 0 ? <EmptyState title={query || category ? 'No encontramos recetas' : 'Todavía no hay recetas'} description={query || category ? 'Prueba con otra búsqueda o filtro.' : 'Cuando tu hogar cree recetas, aparecerán aquí.'} /> : null}{recipes.data && recipes.data.items.length > 0 ? <div className="recipe-list" aria-label="Recetas familiares">{recipes.data.items.map((recipe) => <Link className="recipe-card" key={recipe.id} to={`/app/recetas/${recipe.id}`}><div className="recipe-card__heading"><h2>{recipe.name}</h2><span className="badge">{recipe.status === 'ACTIVE' ? 'Activa' : 'Archivada'}</span></div>{recipe.category ? <p className="supporting-text">{recipe.category}</p> : null}<dl><div><dt>Preparación</dt><dd>{recipe.estimatedPreparationMinutes == null ? 'Sin estimar' : `${recipe.estimatedPreparationMinutes} min`}</dd></div><div><dt>Ingredientes</dt><dd>{recipe.ingredients.length}</dd></div><div><dt>Porciones</dt><dd>{recipe.defaultServings}</dd></div></dl></Link>)}</div> : null}{recipes.data && recipes.data.total > pageSize ? <nav className="recipe-pagination" aria-label="Paginación de recetas"><button className="button button--secondary" disabled={page <= 1 || recipes.isFetching} onClick={() => setPage((current) => current - 1)} type="button">Anterior</button><span>Página {page}</span><button className="button button--secondary" disabled={page * pageSize >= recipes.data.total || recipes.isFetching} onClick={() => setPage((current) => current + 1)} type="button">Siguiente</button></nav> : null}</section>;
}
