Arquitectura Frontend
Plataforma de control nutricional familiar
Stack inicial: React, TypeScript, Vite, TanStack Query, React Hook Form, Zod y PWA
Enfoque: arquitectura modular por funcionalidades, casos de uso, puertos y adaptadores
1. Propósito
Este documento define la arquitectura del frontend web de la plataforma de control nutricional familiar.
El frontend debe:
• Mantener la lógica de negocio fuera de los componentes React.
• Permitir reutilizar dominio y casos de uso en una futura aplicación React Native.
• Ser independiente del cliente HTTP concreto.
• Ser independiente de TanStack Query en las capas internas.
• Ser independiente de IndexedDB en los casos de uso.
• Evitar componentes que conozcan directamente la forma de la API.
• Separar formularios, presentación, aplicación e infraestructura.
• Mantener una experiencia mobile-first.
La regla principal es:
El dominio y los casos de uso del cliente no conocen React,
TanStack Query, Axios, Fetch, IndexedDB, Supabase ni el navegador.
2. Estilo arquitectónico
El frontend seguirá una arquitectura basada en:
• Módulos funcionales.
• Casos de uso.
• Puertos y adaptadores.
• Domain model compartible.
• Presentación desacoplada.
• Estado remoto separado del estado de interfaz.
1

Dirección de dependencias
Presentation
↓
Application
↓
Domain
Infrastructure
↑
Application ports
React pertenece a la capa de presentación.
Los gateways HTTP e IndexedDB pertenecen a infraestructura.
3. Organización general
src/
├── app/
│ ├── composition/
│ ├── providers/
│ ├── router/
│ ├── layouts/
│ └── bootstrap/
├── modules/
│ ├── auth/
│ ├── households/
│ ├── adult-profiles/
│ ├── food-catalog/
│ ├── nutrition-goals/
│ ├── meals/
│ ├── recipes/
│ ├── inventory/
│ ├── meal-planning/
│ ├── health-tracking/
│ └── notifications/
├── shared/
│ ├── domain/
│ ├── application/
│ ├── infrastructure/
│ ├── presentation/
2

│ └── utils/
└── main.tsx
Cada módulo contendrá solo las capas que necesite.
4. Estructura de un módulo
Ejemplo para meals :
modules/meals/
├── domain/
│ ├── entities/
│ ├── value-objects/
│ ├── models/
│ └── errors/
├── application/
│ ├── use-cases/
│ ├── ports/
│ ├── commands/
│ ├── queries/
│ └── dto/
├── infrastructure/
│ ├── http/
│ ├── mappers/
│ └── storage/
└── presentation/
├── pages/
├── components/
├── forms/
├── hooks/
└── routes/
5. Capa Domain
La capa de dominio del frontend contiene modelos y reglas necesarias para representar y manipular el
estado del cliente.
No debe duplicar todo el dominio backend.
Solo incluirá reglas útiles para la experiencia del usuario y para previsualizaciones.
3

Ejemplos:
MealDraft
MealDraftItem
FoodSelection
FoodQuantity
NutrientSummary
NutritionGoalView
WeeklyPlanDraft
InventorySnapshot
Ejemplo
| export  | class | MealDraft | {                |     |     |
| ------- | ----- | --------- | ---------------- | --- | --- |
| private |       | items:    | MealDraftItem[]; |     |     |
constructor(
|     | public | readonly        | profileId:  | string,   |     |
| --- | ------ | --------------- | ----------- | --------- | --- |
|     | public | readonly        | mealType:   | MealType, |     |
|     | public | readonly        | consumedAt: | Date,     |     |
|     | items: | MealDraftItem[] |             | = [],     |     |
) {
|     | this.items | =   | items; |     |     |
| --- | ---------- | --- | ------ | --- | --- |
}
| addItem(item: |        | MealDraftItem): |     | MealDraft | {   |
| ------------- | ------ | --------------- | --- | --------- | --- |
|               | return | new MealDraft(  |     |           |     |
this.profileId,
this.mealType,
this.consumedAt,
|     | [...this.items, |     | item], |     |     |
| --- | --------------- | --- | ------ | --- | --- |
);
}
| removeItem(itemId: |        |                | string): | MealDraft | {   |
| ------------------ | ------ | -------------- | -------- | --------- | --- |
|                    | return | new MealDraft( |          |           |     |
this.profileId,
this.mealType,
this.consumedAt,
|     | this.items.filter((item) |     |     | => item.id | !== itemId), |
| --- | ------------------------ | --- | --- | ---------- | ------------ |
);
}
| isEmpty(): |        | boolean           | {   |        |     |
| ---------- | ------ | ----------------- | --- | ------ | --- |
|            | return | this.items.length |     | === 0; |     |
4

}
}
El frontend puede calcular una previsualización, pero el backend seguirá siendo la fuente definitiva.
6. Value Objects del cliente
Ejemplos:
FoodQuantity
Grams
Milliliters
Calories
NutrientAmount
LocalDate
LocalTime
HouseholdId
AdultProfileId
No es necesario replicar cada Value Object del backend.
Se utilizarán cuando aporten:
• Validación.
• Claridad.
• Reutilización.
• Menos estados inválidos.
7. Capa Application
La capa de aplicación contiene casos de uso de interacción.
Ejemplos:
LoginWithEmailUseCase
LoadActiveHouseholdUseCase
CreateHouseholdUseCase
CompleteAdultProfileUseCase
SearchFoodsUseCase
CreateCustomFoodUseCase
GenerateNutritionGoalUseCase
ConfirmNutritionGoalUseCase
5

RegisterMealUseCase
UpdateMealUseCase
DuplicateMealUseCase
LoadDailyNutritionSummaryUseCase
AdjustInventoryOfflineUseCase
SynchronizeInventoryUseCase
Estos casos de uso no conocen React ni hooks.
8. Ejemplo de caso de uso
| export interface   | RegisterMealInput |         | {   |
| ------------------ | ----------------- | ------- | --- |
| householdId:       | string;           |         |     |
| profileId:         | string;           |         |     |
| mealType:          | string;           |         |     |
| consumedAt:        | Date;             |         |     |
| items: Array<{     |                   |         |     |
| foodId:            | string;           |         |     |
| quantity:          | number;           |         |     |
| unit:              | string;           |         |     |
| servingId?:        | string;           |         |     |
| measurementMethod: |                   | string; |     |
}>;
}
| export class | RegisterMealUseCase |     | {   |
| ------------ | ------------------- | --- | --- |
constructor(
| private | readonly | mealGateway: | MealGateway, |
| ------- | -------- | ------------ | ------------ |
) {}
| async execute(             |                            |     |      |
| -------------------------- | -------------------------- | --- | ---- |
| input:                     | RegisterMealInput,         |     |      |
| ): Promise<RegisteredMeal> |                            | {   |      |
| if (input.items.length     |                            | === | 0) { |
| throw                      | new EmptyMealDraftError(); |     |      |
}
| return | this.mealGateway.register(input); |     |     |
| ------ | --------------------------------- | --- | --- |
}
}
La interfaz React ejecutará este caso de uso mediante un hook adaptador.
6

9. Puertos
Gateway de comidas
| export interface | MealGateway         | {   |                          |
| ---------------- | ------------------- | --- | ------------------------ |
| register(input:  | RegisterMealInput): |     | Promise<RegisteredMeal>; |
update(id: string, input: UpdateMealInput): Promise<RegisteredMeal>;
| getById(id: | string): Promise<MealDetails>; |     |     |
| ----------- | ------------------------------ | --- | --- |
| cancel(id:  | string): Promise<void>;        |     |     |
duplicate(id: string, input: DuplicateMealInput): Promise<RegisteredMeal>;
}
Gateway de alimentos
| export interface | FoodCatalogGateway             |     | {                        |
| ---------------- | ------------------------------ | --- | ------------------------ |
| search(input:    | SearchFoodsInput):             |     | Promise<PaginatedFoods>; |
| getById(id:      | string): Promise<FoodDetails>; |     |                          |
createCustomFood(
| householdId:                  | string, |     |     |
| ----------------------------- | ------- | --- | --- |
| input: CreateCustomFoodInput, |         |     |     |
): Promise<FoodDetails>;
}
Gateway de hogares
| export interface                     | HouseholdGateway       |     | {                   |
| ------------------------------------ | ---------------------- | --- | ------------------- |
| list(): Promise<HouseholdSummary[]>; |                        |     |                     |
| create(input:                        | CreateHouseholdInput): |     | Promise<Household>; |
inviteMember(
| householdId:              | string, |     |     |
| ------------------------- | ------- | --- | --- |
| input: InviteMemberInput, |         |     |     |
): Promise<void>;
}
Sesión
| export interface         | AuthSessionGateway  |     | {        |
| ------------------------ | ------------------- | --- | -------- |
| loginWithEmail(credentials: EmailCredentials): | Promise<void>; | | |
| registerWithEmail(input: RegisterWithEmailInput): | Promise<RegisterWithEmailResult>; | | |
| getSession():            | Promise<AuthSession |     | | null>; |
| logout(): Promise<void>; |                     |     |          |
}
7

Inventario offline
export interface InventoryLocalRepository {
getSnapshot(householdId: string): Promise<InventorySnapshot>;
saveMovement(movement: PendingInventoryMovement): Promise<void>;
listPendingMovements(): Promise<PendingInventoryMovement[]>;
markSynchronized(ids: string[]): Promise<void>;
}
10. Capa Infrastructure
Implementa los puertos.
infrastructure/
├── http/
├── auth/
├── storage/
├── notifications/
└── mappers/
Ejemplos:
HttpMealGateway
HttpFoodCatalogGateway
HttpHouseholdGateway
SupabaseAuthSessionGateway
DexieInventoryLocalRepository
WebPushNotificationGateway
11. Cliente OpenAPI
El cliente generado desde OpenAPI pertenece a infraestructura.
No debe utilizarse directamente desde componentes.
Incorrecto
const response = await generatedApi.mealsControllerCreate(...);
8

dentro de una página React.
Correcto
Page
→ Hook
→ Use Case
→ MealGateway
→ Generated API Client
Adaptador
| export class | HttpMealGateway | implements | MealGateway | {   |
| ------------ | --------------- | ---------- | ----------- | --- |
constructor(
| private | readonly apiClient: | GeneratedApiClient, |     |     |
| ------- | ------------------- | ------------------- | --- | --- |
) {}
| async register(            |                                 |                             |     |     |
| -------------------------- | ------------------------------- | --------------------------- | --- | --- |
| input:                     | RegisterMealInput,              |                             |     |     |
| ): Promise<RegisteredMeal> |                                 | {                           |     |     |
| const                      | response = await                | this.apiClient.createMeal({ |     |     |
| householdId:               | input.householdId,              |                             |     |     |
| body:                      | MealApiMapper.toRequest(input), |                             |     |     |
});
| return | MealApiMapper.toDomain(response); |     |     |     |
| ------ | --------------------------------- | --- | --- | --- |
}
}
12. Mappers
Se utilizarán mappers para separar:
• Respuestas API.
• Modelos de aplicación.
• Estado de formularios.
• Dominio del cliente.
Ejemplos:
MealApiMapper
FoodApiMapper
9

NutritionGoalApiMapper
MealFormMapper
AdultProfileFormMapper
Flujo
Formulario
→ Form Mapper
→ Application Input
→ Gateway
→ API Mapper
→ HTTP Request
13. Capa Presentation
Contiene:
• Páginas.
• Componentes.
• Hooks React.
• Formularios.
• Routing.
• Estados visuales.
• Notificaciones visuales.
No contiene:
• Reglas nutricionales definitivas.
• Requests HTTP directos.
• Acceso directo a IndexedDB.
• Tokens de Supabase.
• Mapeo complejo de respuestas.
14. Páginas y componentes
Pages
Coordinan una vista completa.
Ejemplos:
10

DailyNutritionPage
RegisterMealPage
FoodCatalogPage
WeeklyPlanPage
InventoryPage
AdultProfilePage
Feature components
Representan una funcionalidad relevante.
Ejemplos:
MealForm
FoodSelector
NutritionSummary
ServedPortionEditor
InventoryAdjustmentForm
UI components
Componentes visuales genéricos.
Ejemplos:
Button
Input
Modal
Drawer
Card
ProgressBar
EmptyState
Un componente UI genérico no debe conocer Meal , Food o Household .
15. Hooks
Los hooks conectan React con la capa de aplicación.
export function useRegisterMeal() {
const useCase = useDependency(RegisterMealUseCase);
11

const queryClient = useQueryClient();
return useMutation({
mutationFn: (input: RegisterMealInput) =>
useCase.execute(input),
onSuccess: async (_, input) => {
await queryClient.invalidateQueries({
queryKey: [
'daily-nutrition-summary',
input.profileId,
],
});
},
});
}
El caso de uso no debe importar:
• useMutation .
• useQuery .
• React.
• QueryClient.
16. TanStack Query
Se utilizará para:
• Datos remotos.
• Caché.
• Refetch.
• Estados de carga.
• Invalidación.
• Mutaciones HTTP.
No se utilizará como:
• Fuente durable del inventario offline.
• Estado global para formularios.
• Reemplazo de casos de uso.
• Contenedor de reglas de negocio.
Query keys
Se centralizarán.
12

| export const           | mealQueryKeys    | = {       |               |           |
| ---------------------- | ---------------- | --------- | ------------- | --------- |
| all: ['meals']         | as const,        |           |               |           |
| detail:                | (mealId: string) | =>        |               |           |
| [...mealQueryKeys.all, |                  | 'detail', | mealId]       | as const, |
| dailySummary:          | (profileId:      | string,   | date: string) | =>        |
[
...mealQueryKeys.all,
'daily-summary',
profileId,
date,
| ] as const, |     |     |     |     |
| ----------- | --- | --- | --- | --- |
};
17. Formularios
React Hook Form administrará el estado de formularios.
Zod validará la estructura de entrada.
Separación recomendada
Form Schema
→ Form Values
→ Form Mapper
→ Application Command
→ Use Case
No se enviarán los valores del formulario directamente a la API sin mapear.
Ejemplo
| export const | mealFormSchema     | = z.object({ |     |     |
| ------------ | ------------------ | ------------ | --- | --- |
| profileId:   | z.string().uuid(), |              |     |     |
| mealType:    | z.enum([           |              |     |     |
'BREAKFAST',
'LUNCH',
'SNACK',
'DINNER',
'EXTRA',
]),
| consumedAt: | z.date(), |     |     |     |
| ----------- | --------- | --- | --- | --- |
13

items: z.array(mealItemFormSchema).min(1),
});
18. Estado global
Se evitará un store global grande.
Estado remoto
TanStack Query.
Estado de formulario
React Hook Form.
Sesión
Provider pequeño.
Hogar activo
Contexto o store pequeño persistido.
Flujos temporales complejos
Estado local, reducer o máquina de estados.
Ejemplo:
• Preparar receta.
• Registrar peso cocido.
• Asignar porciones.
• Registrar sobrantes.
Inventario offline
IndexedDB detrás de un repositorio.
19. Composition root
La carpeta app/composition construirá las dependencias.
Ejemplo:
14

const mealGateway = new HttpMealGateway(apiClient);
export const registerMealUseCase =
new RegisterMealUseCase(mealGateway);
Los componentes no deben instanciar gateways.
Puede utilizarse un Dependency Provider para exponer los casos de uso.
20. Manejo de errores
Se diferenciarán:
Errores de dominio del cliente
EmptyMealDraftError
InvalidQuantityError
IncompleteFormError
Errores de infraestructura
NetworkError
UnauthorizedError
ForbiddenError
ApiValidationError
OfflineUnavailableError
Presentación
Los hooks o páginas traducen errores a mensajes comprensibles.
La infraestructura no debe mostrar toasts directamente.
21. Previsualización nutricional
El frontend podrá calcular una previsualización para mejorar la experiencia.
Ejemplo:
15

Cantidad seleccionada
→ equivalencia
→ nutrientes estimados
Sin embargo:
• El backend recalcula.
• El backend guarda los snapshots.
• La respuesta del backend reemplaza la previsualización.
• La interfaz debe distinguir estimación de valor confirmado.
El motor de previsualización puede residir en un paquete compartido reutilizable con React Native.
22. Arquitectura offline del inventario
Solo el inventario funcionará sin conexión durante el MVP.
Datos locales
IndexedDB almacenará:
• Último snapshot.
• Movimientos pendientes.
• Ajustes pendientes.
• Última sincronización.
• IDs de operación.
Flujo
UI
→ AdjustInventoryUseCase
→ InventoryLocalRepository
→ IndexedDB
Al recuperar conexión:
SynchronizeInventoryUseCase
→ obtener movimientos pendientes
→ enviar al backend
→ aplicar respuesta
→ marcar sincronizados
16

Los componentes no deben acceder directamente a Dexie.
23. React Native futuro
La arquitectura debe permitir compartir:
• Entidades ligeras.
• Value Objects.
• Casos de uso.
• Puertos.
• Mappers.
• Esquemas.
• Cliente OpenAPI.
• Motor de previsualización.
• Query keys.
• Reglas de validación.
No se compartirán necesariamente:
• Componentes DOM.
• Navegación.
• Modales.
• Inputs.
• Cámara.
• Escáner.
• Almacenamiento concreto.
• Push notifications.
Estructura futura:
nutrition-clients/
├── apps/
│ ├── web/
│ └── mobile/
└── packages/
├── domain/
├── application/
├── api-client/
├── schemas/
├── nutrition-engine/
└── design-tokens/
17

24. Diseño mobile-first
Las funcionalidades principales se diseñarán primero para teléfono:
• Registrar comida.
• Buscar alimento.
• Ingresar peso.
• Consultar plan de hoy.
• Ajustar inventario.
• Registrar compra.
• Confirmar porción.
Las tablas extensas se evitarán en móvil.
Se usarán:
• Listas.
• Cards simples.
• Drawers.
• Formularios por pasos.
• Acciones fijas inferiores cuando sea necesario.
25. Rutas iniciales
/login
/onboarding
/app
/app/hogar
/app/perfiles
/app/perfiles/:profileId
/app/perfiles/:profileId/meta
/app/alimentos
/app/alimentos/:foodId
/app/comidas/nueva
/app/comidas/:mealId
/app/resumen/:date
/app/recetas
/app/inventario
/app/plan-semanal
/app/progreso
Las rutas se registrarán desde cada módulo.
18

26. Dependencias entre módulos
Los módulos no deben importar libremente componentes internos de otros módulos.
Se expondrá una API pública por módulo.
Ejemplo:
modules/meals/index.ts
Podrá exportar:
• Casos de uso públicos.
• Modelos públicos.
• Componentes reutilizables explícitos.
• Query keys públicas.
No se importarán rutas profundas de otro módulo sin justificación.
27. Pruebas
Domain
Pruebas unitarias puras.
Ejemplos:
• MealDraft vacío.
• Agregar alimento.
• Eliminar alimento.
• Cálculo de previsualización.
• Validación de cantidades.
Application
Casos de uso con gateways falsos.
Ejemplos:
• Registrar comida.
• Buscar alimentos.
• Crear hogar.
• Sincronizar inventario.
19

Infrastructure
Pruebas de adaptadores.
Ejemplos:
• Mapeo API.
• Manejo de errores HTTP.
• Repositorio Dexie.
• Sesión Supabase.
Presentation
Pruebas con Testing Library.
Ejemplos:
• Formulario.
• Selector de alimentos.
• Resumen diario.
• Estados de carga y error.
End-to-end
Flujos completos:
Login
→ hogar
→ perfil
→ catálogo
→ meta
→ registrar comida
→ resumen diario
28. Reglas para Codex
Cada tarea frontend deberá respetar:
1. Identificar el módulo funcional.
2. No hacer llamadas HTTP desde páginas o componentes.
3. Crear o reutilizar un gateway.
4. Crear un caso de uso para la interacción.
5. Mantener React fuera de application y domain.
6. No colocar lógica compleja dentro de hooks.
20

7. No duplicar tipos generados por OpenAPI.
8. Mapear respuestas API a modelos internos.
9. Separar schemas de formulario de commands.
10. Usar TanStack Query solo para estado remoto.
11. Usar React Hook Form para formularios.
12. Mantener IndexedDB detrás de un puerto.
13. Diseñar primero para móvil.
14. Añadir pruebas.
15. No implementar funcionalidades fuera del issue.
16. Ejecutar lint, tests y build.
29. Ejemplo completo de flujo
RegisterMealPage
→ MealForm
→ useRegisterMeal
→ RegisterMealUseCase
→ MealGateway
→ HttpMealGateway
→ GeneratedApiClient
→ Backend
Respuesta:
Backend
→ HttpMealGateway
→ MealApiMapper
→ RegisteredMeal
→ RegisterMealUseCase
→ useRegisterMeal
→ invalidar resumen diario
→ mostrar confirmación
30. Definición de terminado
Una tarea frontend está terminada cuando:
• La funcionalidad está dentro de su módulo.
• No existen requests HTTP directos en componentes.
• La interacción pasa por un caso de uso.
• Los proveedores externos están detrás de adaptadores.
21

• El formulario está validado.
• Los errores tienen representación visual.
• Existen estados de carga y vacío.
• Funciona en móvil.
• Existen pruebas de aplicación y presentación.
• No se rompe lint, test ni build.
• El código potencialmente compartible no depende de React DOM.
22
