import { CookingPot } from 'lucide-react';
import { useSearchParams } from 'react-router';

import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useRecipe } from '../hooks/useRecipes';
import { usePreparedBatch } from '../hooks/usePreparedBatches';

export function StartPreparedBatchHeader() {
  const [params] = useSearchParams();
  const recipeId = params.get('recipeId') ?? '';
  const batchId = params.get('batchId') ?? '';
  const recipe = useRecipe(recipeId || undefined);
  const batch = usePreparedBatch(batchId || undefined);

  if (batch.data && batch.data.status !== 'DRAFT') {
    const finalized = batch.data.status === 'FINALIZED';
    const cancelled = batch.data.status === 'CANCELLED';

    return (
      <PageHeader
        description={
          cancelled
            ? 'Esta preparación ya no puede modificarse.'
            : finalized
              ? 'La preparación ya tiene su cálculo nutricional definitivo.'
              : 'Las cantidades ya no pueden editarse. Continúa con el peso cocido.'
        }
        eyebrow="Preparación familiar"
        icon={<CookingPot size={22} />}
        title={
          cancelled ? 'Preparación cancelada' : 'Ingredientes ya confirmados'
        }
      />
    );
  }

  return (
    <PageHeader
      description="Ajusta las cantidades reales sin modificar la receta original."
      eyebrow="Preparación familiar"
      icon={<CookingPot size={22} />}
      title={
        recipe.data ? `Cocinar ${recipe.data.name}` : 'Preparación familiar'
      }
      titleId="preparation-title"
    />
  );
}
