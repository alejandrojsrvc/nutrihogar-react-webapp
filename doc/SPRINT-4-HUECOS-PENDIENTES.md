# Sprint 4: Huecos Pendientes

Este documento registra lo que todavía falta para considerar completamente cerrado el flujo de Sprint 4. La implementación actual está en el PR `#117`.

## Estado de Validación

- `npm run lint`: correcto.
- CI: pendiente de quedar verde; la última ejecución tuvo 4 pruebas fallidas.
- Tests frontend locales: no ejecutados según las reglas del repositorio.
- Build: pendiente en CI.
- QA en navegador real: pendiente.

## Huecos Críticos

### Offline y sincronización

- Después de recargar sin conexión, el listado puede usar snapshot, pero el detalle y el ajuste todavía consultan HTTP.
- Un listado remoto filtrado puede reemplazar el snapshot completo por un subconjunto.
- Las operaciones offline no conservan siempre la razón ni el `payload` completo.
- Una operación en estado `SYNCING` puede quedar huérfana si se cierra la aplicación durante la sincronización.
- Descartar un conflicto lo marca como `FAILED`, pero `FAILED` todavía se considera pendiente y puede volver a sincronizarse.
- El snapshot devuelto por un conflicto no se aplica ni se muestra como saldo actualizado.
- El reintento no permite indicar una nueva cantidad.
- La última sincronización puede devolver una entrada antigua si existen varias filas de metadata.
- La sincronización automática ocurre al recibir el evento `online`, pero no necesariamente al abrir la aplicación ya conectada.

### Preparaciones e inventario

- `#46`: el estado `PARTIAL` se deshabilita directamente; falta permitir una decisión explícita sobre la cantidad a descontar.
- `#46`: falta cobertura de componente para candidatos, resumen, error, doble confirmación y redirección.
- `#47`: el detalle no muestra claramente nombre de receta ni fecha original de preparación.
- `#47`: la densidad se muestra por gramo; la issue solicita nutrientes por 100 g.
- `#47`: falta prueba observable de `409`, doble agregado y aparición inmediata en inventario.
- `#48`: falta prueba observable de nutrientes confirmados, origen en la comida y actualización del resumen.

### Dashboard

- `#56`: el bloque de inventario depende de que exista un perfil adulto, aunque es información del hogar.
- `#56`: faltan acciones rápidas explícitas para agregar compra y ajustar inventario.
- `#56`: los enlaces con parámetros de filtro no son interpretados por `InventoryListPage`.
- `#56`: errores y estados de carga de sobrantes/lista pueden convertirse silenciosamente en contadores cero.
- Falta validación visual real en móvil desde 320 px y escritorio.

## Compras y Lista de Compras

Las issues `#49–#53` aparecen cerradas en GitHub, pero la auditoría detectó deuda funcional:

- `#50`: falta filtro por fecha, responsable, notas y movimientos generados.
- `#51`: comercio se valida como obligatorio, faltan notas, edición completa de líneas, confirmación explícita y resultado de existencias nuevas/existentes.
- `#52`: faltan notas, edición del nombre y deduplicación visual.
- `#53`: falta `idempotencyKey`, advertencia de cantidad faltante y retorno a la lista tras confirmar.
- `#49`: el total monetario usa `number` sin una estrategia explícita de precisión decimal.

Esta deuda no se considera parte del cierre de las issues abiertas actuales, salvo que se decida reabrirlas o crear nuevas tareas.

## CI Fallido

La última ejecución de CI reportó:

- `HomePage.test.tsx`: no encontró el texto esperado `Arroz`.
- `InventoryUseCases.test.ts`: una prueba esperaba una `Promise`, pero el caso de uso lanzaba el error de forma síncrona.
- `InventoryUseCases.test.ts`: otra prueba usaba `.resolves` sobre un resultado `undefined`.
- `PreparedBatchInventoryUseCases.test.ts`: el caso de uso lanzaba el error de forma síncrona y la prueba esperaba una `Promise`.

Las pruebas deben usar `expect(() => execute(...)).toThrow(...)` cuando el caso de uso sea síncrono, o los casos de uso deben convertirse deliberadamente en asíncronos si ese es el contrato elegido.

## Pruebas Pendientes

### Repositorio IndexedDB

- Persistencia de snapshot y operaciones tras cerrar/reabrir la base.
- Migración de esquema v1 a v2 sin pérdida de datos.
- Atomicidad entre operación y snapshot.
- Descarte que no vuelva a generar operaciones pendientes.
- Recuperación de operaciones `SYNCING` huérfanas.
- Selección correcta de la última sincronización.
- Conservación de conflictos y resultados aplicados.
- Ausencia de tokens o secretos.

### Casos de uso y componentes

- Carga de detalle desde snapshot offline.
- Preservación de razón, fecha, UUID, device ID y `baseVersion`.
- Reintento con nueva cantidad y versión actualizada.
- Consumo, desperdicio y vencimiento sin exceder saldo.
- Pantalla `PreparedBatchInventoryPage` completa.
- Pantalla `PreparedFoodLeftoverDetailPage` completa.
- Pantalla `ConsumePreparedFoodPage` completa.
- Dashboard con errores independientes y acciones rápidas.

### QA manual

- Cargar inventario online.
- Desconectar red.
- Recargar la aplicación.
- Abrir detalle y ajustar/consumir.
- Confirmar persistencia de pendientes.
- Reconectar y sincronizar.
- Forzar conflicto desde otro dispositivo.
- Reintentar, revisar saldo o descartar.
- Confirmar snapshot final contra backend.
- Repetir en viewport móvil de 320 px y escritorio.

## Criterio Para Cerrar El Flujo

El flujo puede considerarse cerrado cuando:

1. CI queda verde con tests y build.
2. El detalle y ajuste funcionan offline después de recargar.
3. Las operaciones descartadas no vuelven a sincronizarse.
4. Los conflictos conservan el saldo actualizado y permiten las acciones requeridas.
5. Las pruebas IndexedDB y de componentes cubren los criterios observables.
6. El escenario manual de `#57` se ejecuta y registra resultado en navegador real.
