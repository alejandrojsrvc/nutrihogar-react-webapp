import {
  Apple,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  ChefHat,
  ClipboardCheck,
  ClipboardList,
  House,
  PackageCheck,
  PackagePlus,
  Plus,
  ReceiptText,
  Scale,
  Utensils,
} from 'lucide-react';
import { Link } from 'react-router';

import { PageHeader } from '../../shared/presentation/components/PageHeader';
import { useRouteParams } from '../../shared/presentation/hooks/useRouteParams';
import { HEADER_ICON_SIZE } from '../../shared/presentation/icons';

export function RecipeListHeader() {
  return (
    <PageHeader
      action={
        <Link className="button button--primary" to="/app/recetas/nueva">
          Crear receta
        </Link>
      }
      description="Encuentra preparaciones que tu familia repite con frecuencia."
      eyebrow="Recetas familiares"
      icon={<BookOpen size={HEADER_ICON_SIZE} />}
      title="Recetas del hogar"
      titleId="recipe-list-title"
    />
  );
}

function RecipeFormHeaderContent({ isEditing }: { isEditing: boolean }) {
  return (
    <PageHeader
      description="Comparte tus recetas caseras y nutre a tu familia."
      icon={<ChefHat size={HEADER_ICON_SIZE} />}
      title={isEditing ? 'Editar receta' : 'Crear receta'}
      titleId="recipe-form-title"
    />
  );
}

export function RecipeCreateHeader() {
  return <RecipeFormHeaderContent isEditing={false} />;
}

export function RecipeEditHeader() {
  return <RecipeFormHeaderContent isEditing />;
}

export function PreparedFoodLeftoverDetailHeader() {
  return (
    <PageHeader
      description="El nombre de la receta no está disponible en el detalle del sobrante."
      eyebrow="Sobrante de preparación"
      icon={<PackageCheck size={HEADER_ICON_SIZE} />}
      title="Sobrante guardado"
      titleId="leftover-detail-title"
    />
  );
}

export function PreparedBatchInventoryHeader() {
  return (
    <PageHeader
      description="Confirma qué existencias se descontarán. La preparación no se bloquea si ignoras un ingrediente."
      eyebrow="Confirmación de inventario"
      icon={<ClipboardCheck size={HEADER_ICON_SIZE} />}
      title="Ingredientes utilizados"
      titleId="prepared-batch-inventory-title"
    />
  );
}

export function InventoryListHeader() {
  return (
    <PageHeader
      action={
        <Link className="button button--primary" to="/app/inventario/nuevo">
          <Plus size={19} aria-hidden="true" /> Agregar producto
        </Link>
      }
      description="Despensa y preparados del hogar"
      icon={<House size={HEADER_ICON_SIZE} />}
      title="Inventario"
      titleId="inventory-title"
    />
  );
}

export function InventoryCreateHeader() {
  return (
    <PageHeader
      description="Registra lo que tienes disponible para mantener una referencia clara en casa."
      eyebrow="Inventario del hogar"
      icon={<PackagePlus size={HEADER_ICON_SIZE} />}
      title="Agregar existencia"
      titleId="inventory-create-title"
    />
  );
}

export function PurchaseFormHeader() {
  const { purchaseId } = useRouteParams();
  const isEditing = Boolean(purchaseId);
  return (
    <PageHeader
      description="Guarda un borrador para revisar cantidades y confirma después, cuando quieras actualizar el inventario."
      eyebrow="Compras del hogar"
      icon={<ReceiptText size={HEADER_ICON_SIZE} />}
      title={isEditing ? 'Editar compra' : 'Registrar compra'}
      titleId="purchase-form-title"
    />
  );
}

export function FoodCatalogHeader() {
  return (
    <PageHeader
      action={
        <Link className="button button--primary" to="/app/alimentos/nuevo">
          <Plus aria-hidden="true" size={19} />
          Crear alimento
        </Link>
      }
      description="Busca ingredientes y consulta sus valores nutricionales."
      icon={<Apple size={HEADER_ICON_SIZE} />}
      title="Alimentos"
      titleId="food-catalog-title"
    />
  );
}

export function CustomFoodFormHeader() {
  const { foodId } = useRouteParams();
  const isEditing = Boolean(foodId);
  return (
    <PageHeader
      description="Copia los valores de la etiqueta tal como aparecen. Podrás usar este alimento en tus comidas."
      icon={<Apple size={HEADER_ICON_SIZE} />}
      title={isEditing ? 'Editar alimento' : 'Crear alimento'}
      titleId="custom-food-title"
    />
  );
}

export function RegisterMealHeader() {
  return (
    <PageHeader
      description="Rápido, flexible y pensado para la vida real."
      icon={<Plus size={HEADER_ICON_SIZE} />}
      title="Registrar comida"
      titleId="register-meal-title"
    />
  );
}

export function PlannedMealFormHeader() {
  const { plannedMealId } = useRouteParams();
  const editing = Boolean(plannedMealId);
  return (
    <PageHeader
      eyebrow="Plan semanal"
      icon={<Utensils size={HEADER_ICON_SIZE} />}
      title={
        editing ? 'Editar comida planificada' : 'Agregar comida planificada'
      }
      titleId="planned-meal-title"
    />
  );
}

export function PlannedMealQuantitiesHeader() {
  return (
    <PageHeader
      description="Las sugerencias orientan la decisión; la cantidad confirmada es la que queda guardada."
      eyebrow="Comida planificada"
      icon={<Scale size={HEADER_ICON_SIZE} />}
      title="Cantidades por adulto"
      titleId="quantities-title"
    />
  );
}

export function WeeklyRequirementsHeader() {
  return (
    <PageHeader
      description="El agregado semanal agrupado por unidad de medida."
      eyebrow="Plan semanal"
      icon={<ClipboardList size={HEADER_ICON_SIZE} />}
      title="Ingredientes requeridos"
      titleId="requirements-title"
    />
  );
}

export function InventoryComparisonHeader() {
  return (
    <PageHeader
      description="Selecciona los faltantes que quieres enviar a la lista de compras."
      eyebrow="Plan semanal"
      icon={<PackageCheck size={HEADER_ICON_SIZE} />}
      title="Disponibilidad del inventario"
      titleId="comparison-title"
    />
  );
}

export function WeeklyAdherenceHeader() {
  return (
    <PageHeader
      description="Valores calculados por el backend a partir del plan y los consumos vinculados."
      eyebrow="Plan semanal"
      icon={<ChartNoAxesColumnIncreasing size={HEADER_ICON_SIZE} />}
      title="Adherencia del plan"
      titleId="adherence-title"
    />
  );
}
