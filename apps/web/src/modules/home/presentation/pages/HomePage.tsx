import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import { UserRound } from 'lucide-react';
import { formatCalories } from '@nutrihogar/domain';
import { PageHeader } from '../../../../shared/presentation/components/PageHeader';
import { useHealth } from '../../../../shared/presentation/hooks/useHealth';
import { useAdultProfiles } from '../../../households/presentation/hooks/useAdultProfiles';
import { useHouseholds } from '../../../households/presentation/hooks/useHouseholds';
import { useDailyNutritionSummary } from '../../../meals/presentation/hooks/useMeals';
import { useInventory, useInventorySyncStatus } from '../../../inventory/presentation/hooks/useInventory';
import { usePreparedFoodLeftovers } from '../../../recipes/presentation/hooks/usePreparedFoodLeftovers';
import { useShoppingList } from '../../../shopping-list/presentation/hooks/useShoppingList';

const mealTypes = [
  ['BREAKFAST', 'Desayuno'],
  ['LUNCH', 'Almuerzo'],
  ['SNACK', 'Merienda'],
  ['DINNER', 'Cena'],
] as const;

export function HomePage() {
  const location = useLocation();
  const healthQuery = useHealth();
  const { activeHousehold, households, isError: householdsError, isPending: householdsPending, selectActiveHousehold } = useHouseholds();
  const profilesQuery = useAdultProfiles(activeHousehold?.id);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const activeProfiles = profilesQuery.profiles.filter((profile) => profile.isActive !== false);
  const profileId = selectedProfileId || (activeProfiles.length === 1 ? activeProfiles[0]?.id : activeProfiles[0]?.id) || '';
  const date = today();
  const summaryQuery = useDailyNutritionSummary(profileId, date);
  const inventoryQuery = useInventory(activeHousehold?.id);
  const leftoversQuery = usePreparedFoodLeftovers(activeHousehold?.id);
  const shoppingListQuery = useShoppingList(activeHousehold?.id);
  const inventorySyncQuery = useInventorySyncStatus(activeHousehold?.id);

  if (householdsPending) return <section className="page-section" aria-labelledby="home-loading-title"><p className="eyebrow">Inicio</p><h1 id="home-loading-title">Cargando tu espacio familiar</h1><p className="lead" role="status">Consultando tus hogares...</p></section>;
  if (householdsError) return <section className="page-section" aria-labelledby="home-error-title"><p className="eyebrow">Inicio</p><h1 id="home-error-title">No pudimos cargar tu hogar</h1><p className="lead" role="alert">No se pudo conectar con la API de NutriHogar.</p></section>;
  if (households.length === 0) return <Navigate replace to="/onboarding" />;
  if (!activeHousehold) return <section className="page-section" aria-labelledby="household-select-title"><p className="eyebrow">Tus hogares</p><h1 id="household-select-title">Elige un hogar para continuar</h1><p className="lead">Selecciona el espacio familiar que quieres consultar.</p><div className="household-list" role="list">{households.map((household) => <button className="household-list__item" key={household.id} onClick={() => selectActiveHousehold(household)} type="button"><span>{household.name}</span><small>{household.currency}</small></button>)}</div></section>;

  return (
    <section className="page-section home-page" aria-labelledby="home-title">
      <PageHeader action={<Link className="button button--primary home-page__primary-action" to={profileId ? `/app/comidas/nueva?profileId=${profileId}&date=${date}` : '/app/perfil/editar'}>{profileId ? 'Registrar comida' : 'Configurar perfil'}</Link>} eyebrow="Inicio" title="Tu hogar empieza aqui" titleId="home-title" />
      {isSuccessNavigation(location.state) ? <p className="profile-success" role="status">{location.state.mealSaved ? 'Comida registrada correctamente.' : 'Perfil guardado correctamente.'}</p> : null}
      <div className="household-summary"><p className="household-summary__label">Hogar activo</p><h2>{activeHousehold.name}</h2><p>{activeHousehold.currency} · {activeHousehold.timezone}</p></div>
      {activeProfiles.length > 1 ? <div className="form-field home-page__profile-selector"><label htmlFor="home-profile">Consultar para</label><select id="home-profile" onChange={(event) => setSelectedProfileId(event.target.value)} value={profileId}>{activeProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}</select></div> : null}
       {profileId ? <>
         <section className="home-page__quick-actions" aria-labelledby="quick-meal-actions-title"><div className="section-heading"><div><p className="eyebrow">Acceso rápido</p><h2 id="quick-meal-actions-title">Registrar una comida</h2></div></div><div className="quick-action-list">{mealTypes.map(([type, label]) => <Link className="quick-action" key={type} to={`/app/comidas/nueva?profileId=${profileId}&mealType=${type}&date=${date}`}>{label}</Link>)}</div></section>
          <section className="home-page__organization" aria-labelledby="home-organization-title"><div className="section-heading"><div><p className="eyebrow">Organizar tu hogar</p><h2 id="home-organization-title">Todo en su lugar</h2></div></div><div className="organization-links"><Link to="/app/inventario"><strong>Inventario</strong><span>Lo que tienes disponible</span></Link><Link to="/app/lista-de-compras"><strong>Lista de compras</strong><span>Lo que falta comprar</span></Link><Link to="/app/recetas"><strong>Recetas</strong><span>Ideas para cocinar</span></Link><Link to="/app/compras"><strong>Historial de compras</strong><span>Revisa tus compras</span></Link></div></section>
          <HomeInventoryPulse inventory={inventoryQuery.data?.items ?? []} inventoryError={inventoryQuery.isError} leftovers={leftoversQuery.data ?? []} pendingShoppingItems={(shoppingListQuery.data?.items ?? []).filter((item) => !item.purchased).length} sync={inventorySyncQuery.data} />
          {summaryQuery.isPending ? <p role="status">Cargando el resumen de hoy...</p> : null}
        {summaryQuery.isError ? <p role="alert">No se pudo cargar el resumen de hoy.</p> : null}
        {summaryQuery.data ? <HomeSummary summary={summaryQuery.data} date={date} /> : null}
      </> : <p className="lead">Configura un perfil adulto para comenzar a registrar comidas.</p>}
       <div className="household-section"><h2>Integrantes</h2>{profilesQuery.isPending ? <p role="status">Cargando integrantes...</p> : null}{profilesQuery.isError ? <p role="alert">No se pudieron cargar los integrantes.</p> : null}{!profilesQuery.isPending && !profilesQuery.isError && activeProfiles.length === 0 ? <p>Aún no hay perfiles adultos configurados en este hogar.</p> : null}{activeProfiles.length > 0 ? <div className="profile-list">{activeProfiles.map((profile) => <div className="profile-card" key={profile.id}><div className="profile-card__identity"><UserRound size={18} aria-hidden="true" /><strong>{profile.name}</strong><span className="profile-card__sex">{profile.biologicalSex === 'MALE' ? 'Hombre' : 'Mujer'}</span></div><span>{profile.weightKg == null ? 'Peso pendiente' : `${profile.weightKg} kg`} {' · '} {profile.heightCm} cm</span></div>)}</div> : null}<div className="home-actions">{profileId ? <Link className="button button--secondary" to={`/app/perfiles/${profileId}/meta`}>Ver meta nutricional</Link> : null}<Link className="button button--secondary" to={profileId ? '/app/perfil' : '/app/perfil/editar'}>{profileId ? 'Ver mi perfil' : 'Configurar perfil'}</Link><Link className="button button--secondary" to="/app/alimentos">Explorar alimentos</Link><Link className="button button--secondary" to="/app/invitaciones">Gestionar invitaciones</Link></div></div>
      {healthQuery.isPending ? <p className="lead" role="status">Comprobando la conexión con NutriHogar...</p> : null}{healthQuery.isError ? <p className="lead" role="alert">No se pudo conectar con la API de NutriHogar.</p> : null}{healthQuery.data ? <p className="lead" role="status">API disponible.</p> : null}
    </section>
  );
}

function HomeInventoryPulse({ inventory, inventoryError, leftovers, pendingShoppingItems, sync }: { inventory: Array<{ id: string; name: string; currentQuantity: number; minimumQuantity: number | null; status: string; expiresAt: string | null; itemType: string }>; inventoryError: boolean; leftovers: Array<{ id: string; availableWeight: number; status: string }>; pendingShoppingItems: number; sync?: { isOnline: boolean; pendingCount: number; conflictsCount: number; lastSyncAt: string | null } }) {
  const critical = inventory.filter((item) => item.status === 'DEPLETED' || item.currentQuantity <= 0 || (item.minimumQuantity != null && item.currentQuantity <= item.minimumQuantity) || isExpiring(item.expiresAt)).slice(0, 3);
  return <section className="home-page__inventory-pulse" aria-labelledby="home-inventory-pulse-title"><div className="section-heading"><div><p className="eyebrow">Estado del hogar</p><h2 id="home-inventory-pulse-title">Lo que requiere atención</h2></div><Link to="/app/inventario">Ver inventario</Link></div>{inventoryError ? <p role="alert">No se pudo cargar el estado del inventario.</p> : null}<div className="home-pulse-grid"><Link to="/app/inventario?status=DEPLETED"><strong>{inventory.filter((item) => item.status === 'DEPLETED' || item.currentQuantity <= 0).length}</strong><span>Agotados</span></Link><Link to="/app/inventario?belowMinimum=true"><strong>{inventory.filter((item) => item.minimumQuantity != null && item.currentQuantity <= item.minimumQuantity && item.currentQuantity > 0).length}</strong><span>Bajo mínimo</span></Link><Link to="/app/sobrantes"><strong>{leftovers.filter((leftover) => leftover.status === 'AVAILABLE').length}</strong><span>Sobrantes</span></Link><Link to="/app/lista-de-compras"><strong>{pendingShoppingItems}</strong><span>Por comprar</span></Link></div>{critical.length ? <ul className="home-pulse-list">{critical.map((item) => <li key={item.id}><Link to={item.itemType === 'PREPARED_FOOD' ? `/app/inventario/${item.id}/consumir-preparado` : `/app/inventario/${item.id}`}><span>{item.name}</span><small>{item.status === 'DEPLETED' || item.currentQuantity <= 0 ? 'Agotado' : item.minimumQuantity != null && item.currentQuantity <= item.minimumQuantity ? 'Bajo mínimo' : 'Próximo a vencer'}</small></Link></li>)}</ul> : <p>El inventario no tiene alertas prioritarias.</p>}<p className="supporting-text">{sync?.isOnline === false ? 'Sin conexión: se muestran los datos guardados en este dispositivo.' : sync?.pendingCount ? `${sync.pendingCount} operación${sync.pendingCount === 1 ? '' : 'es'} pendiente${sync.pendingCount === 1 ? '' : 's'} de sincronizar.` : sync?.conflictsCount ? `${sync.conflictsCount} conflicto${sync.conflictsCount === 1 ? '' : 's'} requiere${sync.conflictsCount === 1 ? '' : 'n'} revisión.` : 'Inventario sincronizado.'}</p></section>;
}

function HomeSummary({ summary, date }: { summary: NonNullable<ReturnType<typeof useDailyNutritionSummary>['data']>; date: string }) {
  const registeredTypes = new Set(summary.meals.map((meal) => meal.mealType));
  const nextMeal = mealTypes.find(([type]) => !registeredTypes.has(type));
  return <section className="home-page__summary" aria-labelledby="home-summary-title"><div className="section-heading"><div><p className="eyebrow">Resumen de hoy</p><h2 id="home-summary-title">{summary.profile.name}</h2></div><Link to={`/app/resumen/${date}`}>Ver resumen completo</Link></div><p className="home-page__calories">{formatCalories(summary.consumed.calories)} <span>consumidas</span></p><p className="supporting-text">{nextMeal ? `Próxima comida: ${nextMeal[1]}` : 'Ya registraste las comidas principales de hoy.'}</p><div className="home-page__recent-meals"><h3>Últimas comidas</h3>{summary.meals.length === 0 ? <p>Aún no hay comidas registradas hoy.</p> : summary.meals.slice(-3).reverse().map((meal) => <Link className="daily-meal" key={meal.id} to={`/app/comidas/${meal.id}`}><span><strong>{mealTypeLabel(meal.mealType)}</strong><small>{formatTime(meal.consumedAt)}</small></span><span className="daily-meal__totals">{formatCalories(meal.totals.calories)}<small>Ver detalle</small></span></Link>)}</div></section>;
}

function mealTypeLabel(value: string) { return mealTypes.find(([type]) => type === value)?.[1] ?? value; }
function formatTime(value: string) { return new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value)); }
function today() { return new Date().toISOString().slice(0, 10); }
function isSuccessNavigation(state: unknown): state is { mealSaved?: boolean; profileSaved?: boolean } { return typeof state === 'object' && state !== null && ('mealSaved' in state || 'profileSaved' in state); }
function isExpiring(value: string | null) { return value != null && value <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); }
