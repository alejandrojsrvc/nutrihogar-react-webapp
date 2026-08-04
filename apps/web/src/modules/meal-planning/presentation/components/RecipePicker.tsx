import { useState } from 'react';
import { useRecipes } from '../../../recipes/presentation/hooks/useRecipes';

export function RecipePicker({
  householdId,
  value,
  onChange,
  error,
}: {
  householdId: string;
  value?: string;
  onChange: (id: string) => void;
  error?: string;
}) {
  const [query, setQuery] = useState('');
  const recipes = useRecipes(householdId, { query, page: 1, limit: 20 });
  const selected = recipes.data?.items.find((recipe) => recipe.id === value);
  return (
    <div className="form-field">
      <label htmlFor="recipe-search">Receta</label>
      <input
        id="recipe-search"
        value={selected ? selected.name : query}
        onChange={(event) => {
          setQuery(event.target.value);
          if (selected) onChange('');
        }}
        placeholder="Buscar recetas del hogar"
        aria-invalid={Boolean(error)}
      />
      {recipes.isPending ? (
        <small role="status">Cargando recetas...</small>
      ) : null}
      {recipes.isError ? (
        <small role="alert">No se pudieron cargar las recetas.</small>
      ) : null}
      {!recipes.isPending &&
      !recipes.isError &&
      recipes.data?.items.length === 0 ? (
        <small>No hay recetas que coincidan.</small>
      ) : null}
      <div className="meal-planning__recipe-results">
        {recipes.data?.items.map((recipe) => (
          <button
            aria-pressed={recipe.id === value}
            className={recipe.id === value ? 'is-selected' : ''}
            key={recipe.id}
            onClick={() => {
              onChange(recipe.id);
              setQuery('');
            }}
            type="button"
          >
            {recipe.name}
          </button>
        ))}
      </div>
      {selected ? <small>Seleccionada: {selected.name}</small> : null}
      {error ? <span className="form-field__error">{error}</span> : null}
    </div>
  );
}
