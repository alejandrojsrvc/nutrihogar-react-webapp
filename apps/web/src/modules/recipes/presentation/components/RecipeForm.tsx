import { useState } from 'react';
/* The form API exposes stable field helpers that React Compiler cannot memoize safely. */
/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable react-refresh/only-export-components */
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router';
import { recipeFormSchema, type RecipeFormValues } from '@nutrihogar/schemas';
import { FoodSelector } from '../../../food-catalog/presentation/components/FoodSelector';
import type { FoodSelection } from '../../../food-catalog/application/ports/FoodCatalogGateway';
import type { CreateRecipeInput } from '../../application/ports/RecipeGateway';

type RecipeFormInput = z.input<typeof recipeFormSchema>;

export function RecipeForm({ initialValues, isSubmitting, errorMessage, onSubmit, submitLabel, cancelTo }: { initialValues: RecipeFormValues; isSubmitting?: boolean; errorMessage?: string; onSubmit: (input: CreateRecipeInput) => void; submitLabel: string; cancelTo: string }) {
  const form = useForm<RecipeFormInput, unknown, RecipeFormValues>({ defaultValues: initialValues, resolver: zodResolver(recipeFormSchema) });
  const ingredients = useFieldArray({ control: form.control, name: 'ingredients' });
  const instructions = useFieldArray({ control: form.control, name: 'instructions' });
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<number | null>(null);

  function selectFood(selection: FoodSelection) {
    const next = { foodId: selection.food.id, foodName: selection.food.name, preparationState: selection.food.preparationState, quantity: selection.quantity, unit: selection.unit, servingId: selection.servingId ?? null, notes: '' };
    if (editingIngredient == null) ingredients.append(next);
    else form.setValue(`ingredients.${editingIngredient}`, { ...form.getValues(`ingredients.${editingIngredient}`), ...next });
    setSelectorOpen(false);
    setEditingIngredient(null);
  }

  function moveIngredient(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= ingredients.fields.length) return;
    ingredients.move(index, target);
  }

  function moveInstruction(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= instructions.fields.length) return;
    instructions.move(index, target);
  }

  return <>
    <form className="recipe-form" onSubmit={form.handleSubmit((values) => onSubmit(toRecipeInput(values)))}>
      <section className="recipe-form__section"><h2>Información general</h2><div className="form-field"><label htmlFor="recipe-name">Nombre</label><input id="recipe-name" aria-invalid={Boolean(form.formState.errors.name)} {...form.register('name')} />{form.formState.errors.name ? <p className="form-field__error">{form.formState.errors.name.message}</p> : null}</div><div className="form-field"><label htmlFor="recipe-description">Descripción</label><textarea id="recipe-description" {...form.register('description')} /></div><div className="recipe-form__grid"><div className="form-field"><label htmlFor="recipe-category">Categoría</label><input id="recipe-category" {...form.register('category')} /></div><div className="form-field"><label htmlFor="recipe-servings">Porciones de referencia</label><input id="recipe-servings" inputMode="numeric" min="1" type="number" {...form.register('defaultServings', { valueAsNumber: true })} /></div><div className="form-field"><label htmlFor="recipe-time">Tiempo estimado (minutos)</label><input id="recipe-time" inputMode="numeric" min="1" type="number" {...form.register('estimatedPreparationMinutes', { valueAsNumber: true })} /></div></div></section>
      <section className="recipe-form__section"><div className="section-heading"><div><p className="eyebrow">Ingredientes</p><h2>Qué necesitas</h2></div><button className="button button--secondary" onClick={() => { setEditingIngredient(null); setSelectorOpen(true); }} type="button">Agregar ingrediente</button></div>{ingredients.fields.length === 0 ? <p className="empty-state">Agrega al menos un ingrediente.</p> : ingredients.fields.map((field, index) => <article className="recipe-ingredient-row" key={field.id}><div className="recipe-ingredient-row__main"><strong>{form.watch(`ingredients.${index}.foodName`)}</strong><span>{form.watch(`ingredients.${index}.preparationState`) || 'Preparación no indicada'}</span><div className="recipe-form__grid"><div className="form-field"><label htmlFor={`ingredient-${index}-quantity`}>Cantidad</label><input id={`ingredient-${index}-quantity`} min="0.000001" step="any" type="number" {...form.register(`ingredients.${index}.quantity`, { valueAsNumber: true })} /></div><div className="form-field"><label htmlFor={`ingredient-${index}-unit`}>Unidad</label><select id={`ingredient-${index}-unit`} {...form.register(`ingredients.${index}.unit`)}><option value="GRAM">Gramos</option><option value="MILLILITER">Mililitros</option><option value="UNIT">Unidad</option><option value="SERVING">Porción</option></select></div></div><div className="form-field"><label htmlFor={`ingredient-${index}-notes`}>Nota</label><input id={`ingredient-${index}-notes`} {...form.register(`ingredients.${index}.notes`)} /></div></div><div className="recipe-row-actions"><button className="button button--tertiary" onClick={() => moveIngredient(index, -1)} type="button">Subir</button><button className="button button--tertiary" onClick={() => moveIngredient(index, 1)} type="button">Bajar</button><button className="button button--secondary" onClick={() => { setEditingIngredient(index); setSelectorOpen(true); }} type="button">Cambiar</button><button className="button button--danger" onClick={() => ingredients.remove(index)} type="button">Eliminar</button></div></article>)}{form.formState.errors.ingredients ? <p className="form-field__error" role="alert">{typeof form.formState.errors.ingredients.message === 'string' ? form.formState.errors.ingredients.message : 'Revisa los ingredientes.'}</p> : null}</section>
      <section className="recipe-form__section"><div className="section-heading"><div><p className="eyebrow">Preparación</p><h2>Instrucciones</h2></div><button className="button button--secondary" onClick={() => instructions.append({ description: '' })} type="button">Agregar paso</button></div>{instructions.fields.length === 0 ? <p className="supporting-text">Las instrucciones son opcionales.</p> : instructions.fields.map((field, index) => <div className="recipe-instruction-row" key={field.id}><span aria-hidden="true">{index + 1}</span><div className="form-field"><label htmlFor={`instruction-${index}`}>Paso {index + 1}</label><textarea id={`instruction-${index}`} {...form.register(`instructions.${index}.description`)} /></div><button className="button button--tertiary" onClick={() => moveInstruction(index, -1)} type="button">Subir</button><button className="button button--tertiary" onClick={() => moveInstruction(index, 1)} type="button">Bajar</button><button className="button button--danger" onClick={() => instructions.remove(index)} type="button">Eliminar</button></div>)}</section>
      {errorMessage ? <p role="alert">{errorMessage}</p> : null}<div className="recipe-form__actions"><Link className="button button--secondary" to={cancelTo}>Cancelar</Link><button className="button button--primary" disabled={isSubmitting} type="submit">{isSubmitting ? 'Guardando...' : submitLabel}</button></div>
    </form>
    {selectorOpen ? <FoodSelector onClose={() => { setSelectorOpen(false); setEditingIngredient(null); }} onSelect={selectFood} /> : null}
  </>;
}

export function emptyRecipeFormValues(): RecipeFormValues { return { name: '', description: '', category: '', defaultServings: 1, estimatedPreparationMinutes: null, ingredients: [], instructions: [] }; }

export function recipeToFormValues(recipe: { name: string; description: string | null; category: string | null; defaultServings: number; estimatedPreparationMinutes: number | null; ingredients: Array<{ id: string; foodId: string; quantity: number; unit: string; servingId: string | null; notes: string | null }>; instructions: Array<{ id: string; description: string }> }): RecipeFormValues { return { name: recipe.name, description: recipe.description ?? '', category: recipe.category ?? '', defaultServings: recipe.defaultServings, estimatedPreparationMinutes: recipe.estimatedPreparationMinutes, ingredients: recipe.ingredients.map((ingredient) => ({ id: ingredient.id, foodId: ingredient.foodId, foodName: ingredient.foodId, preparationState: '', quantity: ingredient.quantity, unit: ingredient.unit as RecipeFormValues['ingredients'][number]['unit'], servingId: ingredient.servingId, notes: ingredient.notes ?? '' })), instructions: recipe.instructions.map((instruction) => ({ id: instruction.id, description: instruction.description })) }; }

function toRecipeInput(values: RecipeFormValues): CreateRecipeInput { return { category: values.category || null, defaultServings: values.defaultServings, description: values.description || null, estimatedPreparationMinutes: values.estimatedPreparationMinutes || null, ingredients: values.ingredients.map((ingredient, index) => ({ id: ingredient.id, foodId: ingredient.foodId, notes: ingredient.notes || null, position: index + 1, quantity: ingredient.quantity, servingId: ingredient.unit === 'SERVING' ? ingredient.servingId : null, unit: ingredient.unit })), instructions: values.instructions.map((instruction, index) => ({ id: instruction.id, position: index + 1, description: instruction.description })) , name: values.name };
}
