# Plan Frontend Inventory: Issues #41-#44

## Contexto

El PR #92 fue mergeado e incluyó las issues #37 y #38. La issue #39 queda pendiente hasta que el contrato de comidas exponga de forma explícita la referencia a la preparación original.

El siguiente bloque recomendado es Inventory:

- #41: arquitectura modular de Inventory.
- #42: listado y consulta de inventario.
- #43: detalle e historial de movimientos.
- #44: creación y ajuste manual de existencias.

El cliente OpenAPI generado ya contiene contratos para inventario, movimientos, consumo, desperdicio y sincronización.

## Dependencias Y Restricciones

- No inspeccionar ni modificar el repositorio backend.
- Usar el cliente OpenAPI generado mediante adaptadores; no duplicar DTOs generados.
- No acceder a IndexedDB desde componentes o páginas.
- Separar snapshot remoto, operaciones locales pendientes y conflictos.
- El schema generado `packages/api-client/src/generated/schema.ts` puede contener cambios ajenos; no revertirlos ni incluirlos accidentalmente.
- Dexie no está instalado actualmente; agregarlo solo si la implementación de #41 lo necesita.
- Usar TanStack Query para estado remoto.
- Mantener estados de carga, vacío, error, offline y sincronización pendiente.
- Ejecutar únicamente `npm run lint` al terminar el bloque.
- No ejecutar tests frontend ni build localmente; GitHub Actions los ejecuta en el PR.

## Orden De Implementación

### #41 - Arquitectura Modular

- [x] Crear `apps/web/src/modules/inventory/` por capas.
- [x] Definir entidades de dominio para existencias y movimientos.
- [x] Definir `InventoryGateway`.
- [x] Definir repositorio local para snapshots y operaciones pendientes.
- [x] Definir `InventorySyncGateway`.
- [x] Definir `ConnectivityGateway`.
- [x] Implementar `LoadInventoryUseCase`.
- [x] Implementar `CreateManualInventoryItemUseCase`.
- [x] Implementar `AdjustInventoryItemUseCase`.
- [x] Implementar `ConsumeInventoryItemUseCase`.
- [x] Implementar `SynchronizeInventoryUseCase`.
- [x] Implementar adaptadores HTTP y mappers.
- [x] Implementar almacenamiento local con Dexie.
- [x] Conectar dependencias y claves de TanStack Query.
- [x] Añadir tests de casos de uso y mappers.

### #42 - Listado Y Consulta

- [ ] Crear la ruta `/app/inventario`.
- [ ] Implementar búsqueda y filtros: todos, alimentos, preparados, bajo mínimo, agotados y próximos a vencer.
- [ ] Mostrar cantidad, unidad, ubicación, vencimiento y estado.
- [ ] Mostrar existencias de alimentos y preparaciones.
- [ ] Mostrar snapshot local cuando no haya conexión.
- [ ] Mostrar operaciones pendientes de sincronización.
- [ ] Añadir acción primaria `Agregar existencia`.
- [ ] Añadir acciones de ajustar y registrar consumo.
- [ ] Cubrir estados de carga, vacío, error y offline.
- [ ] Añadir tests de búsqueda, filtros y navegación.

### #43 - Detalle E Historial

- [ ] Crear la ruta `/app/inventario/:inventoryItemId`.
- [ ] Mostrar nombre, tipo, cantidad, unidad, mínimo, ubicación, vencimiento, estado y origen.
- [ ] Mostrar movimientos en orden descendente.
- [ ] Diferenciar entradas y salidas con texto o iconos además del color.
- [ ] Mostrar movimientos pendientes offline.
- [ ] Mostrar trazabilidad hacia sobrantes o preparaciones.
- [ ] Conectar acciones de ajuste, consumo, desperdicio, cambio de mínimo y archivado.
- [ ] Cubrir estados agotado, archivado, error y sincronización.
- [ ] Añadir tests de historial, acciones y navegación.

### #44 - Crear Y Ajustar

- [ ] Crear la ruta `/app/inventario/nuevo`.
- [ ] Reutilizar el selector de alimentos.
- [ ] Implementar cantidad, unidad, mínimo, ubicación, vencimiento y razón.
- [ ] Crear la ruta `/app/inventario/:inventoryItemId/ajustar`.
- [ ] Mostrar cantidad actual, nueva cantidad y diferencia.
- [ ] Hacer obligatoria la razón del ajuste.
- [ ] Explicar que el ajuste crea un movimiento y no edita el saldo directamente.
- [ ] Permitir operaciones offline con estado pendiente.
- [ ] Confirmar ajustes grandes.
- [ ] Añadir tests de formularios, validaciones, modo offline y errores.

## Contratos OpenAPI Relevantes

- `GET /api/households/{householdId}/inventory`
- `POST /api/households/{householdId}/inventory/items`
- `GET /api/inventory/items/{inventoryItemId}`
- `PATCH /api/inventory/items/{inventoryItemId}`
- `DELETE /api/inventory/items/{inventoryItemId}`
- `POST /api/inventory/items/{inventoryItemId}/adjustments`
- `GET /api/inventory/items/{inventoryItemId}/movements`
- `POST /api/inventory/items/{inventoryItemId}/consumptions`
- `POST /api/inventory/items/{inventoryItemId}/waste`
- `POST /api/inventory/items/{inventoryItemId}/expiration`
- `POST /api/households/{householdId}/inventory/sync`

## Entrega

- [ ] Crear una rama nueva desde el `main` actualizado.
- [ ] Implementar #41-#44 en un único bloque coherente.
- [ ] Revisar el diff para excluir cambios ajenos.
- [ ] Ejecutar `npm run lint` una vez al finalizar.
- [ ] Crear un commit convencional.
- [ ] Crear un PR contra `main` con `Closes #41`, `Closes #42`, `Closes #43` y `Closes #44` cuando estén completamente resueltas.
- [ ] Consultar este documento al finalizar y marcar todas las tareas completadas o bloqueadas.
