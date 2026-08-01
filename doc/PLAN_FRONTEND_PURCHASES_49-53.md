# Plan Frontend Purchases: Issues #49-#53

## Contexto

El bloque de Inventory #41-#44 fue completado y mergeado mediante el PR #96.

El siguiente bloque funcional corresponde a compras y lista de compras:

- #49: arquitectura modular de compras.
- #50: historial de compras.
- #51: creación y confirmación de compras.
- #52: lista de compras compartida.
- #53: creación de compras desde elementos seleccionados.

La implementación seguirá el orden `#49 -> #50 -> #51 -> #52 -> #53`.

## Dependencias Y Restricciones

- Usar el cliente OpenAPI generado mediante adaptadores.
- No duplicar DTOs generados.
- No editar `packages/api-client/src/generated/schema.ts`.
- Usar TanStack Query para estado remoto.
- Usar React Hook Form y Zod en formularios.
- Reutilizar `FoodSelector` y componentes compartidos existentes.
- Mantener la lógica de negocio fuera de componentes React.
- No actualizar inventario directamente desde componentes.
- El backend es la fuente definitiva para confirmar compras y movimientos.
- Mantener estados de carga, vacío, error, guardado y éxito.
- Mantener una acción primaria clara por pantalla.
- Respetar diseño mobile-first y tokens visuales existentes.
- No inspeccionar ni modificar el repositorio backend.
- Ejecutar únicamente `npm run lint` al terminar todo el bloque.
- No ejecutar tests frontend ni build localmente; GitHub Actions ejecuta ambas validaciones.

## Estado Del Contrato OpenAPI

El cliente generado contiene rutas para compras y lista de compras:

- `GET /api/households/{householdId}/purchases`
- `POST /api/households/{householdId}/purchases`
- `GET /api/purchases/{purchaseId}`
- `PATCH /api/purchases/{purchaseId}`
- `POST /api/purchases/{purchaseId}/confirm`
- `DELETE /api/purchases/{purchaseId}`
- `GET /api/households/{householdId}/shopping-list`
- `POST /api/households/{householdId}/shopping-list/items`
- `PATCH /api/shopping-list/items/{itemId}`
- `DELETE /api/shopping-list/items/{itemId}`
- `POST /api/shopping-list/items/{itemId}/mark-purchased`
- `POST /api/households/{householdId}/shopping-list/generate-from-inventory`
- `POST /api/households/{householdId}/shopping-list/convert-to-purchase`

Antes de implementar las pantallas dependientes se debe confirmar que las respuestas generadas exponen los datos necesarios. No se debe resolver una respuesta incompleta creando DTOs locales.

## Orden De Implementación

### #49 - Arquitectura Modular De Compras

- [x] Crear `apps/web/src/modules/purchases/` por capas.
- [x] Definir entidades de compra y producto comprado.
- [x] Definir `PurchaseGateway`.
- [x] Definir entradas de creación y actualización de compras.
- [x] Implementar `CreatePurchaseUseCase`.
- [x] Implementar `UpdatePurchaseUseCase`.
- [x] Implementar `ConfirmPurchaseUseCase`.
- [x] Implementar `LoadPurchaseUseCase`.
- [x] Implementar `ListPurchasesUseCase`.
- [x] Implementar `CancelPurchaseUseCase`.
- [x] Implementar adaptador HTTP y mappers.
- [x] Conectar dependencias de composición.
- [x] Crear claves de TanStack Query e invalidaciones.
- [x] Añadir tests de casos de uso, mappers y gateway.

### #50 - Historial De Compras

- [x] Crear la ruta `/app/compras`.
- [x] Crear la ruta `/app/compras/:purchaseId`.
- [x] Mostrar fecha, comercio, total, moneda, productos, estado y responsable.
- [x] Implementar filtros por estado, comercio y fecha cuando el contrato lo permita.
- [x] Diferenciar estados `DRAFT`, `CONFIRMED` y `CANCELLED`.
- [x] Mostrar productos, cantidades e inventario asociado.
- [x] Mostrar movimientos generados cuando el contrato lo exponga.
- [x] Impedir editar compras confirmadas o canceladas.
- [x] Cubrir carga, vacío, error y navegación.
- [x] Añadir tests de listado, filtros, detalle y accesibilidad.

### #51 - Crear Y Confirmar Compras

- [x] Crear la ruta `/app/compras/nueva`.
- [x] Crear la ruta `/app/compras/:purchaseId/editar`.
- [x] Reutilizar `FoodSelector` para agregar alimentos.
- [x] Implementar fecha y hora.
- [x] Implementar comercio opcional.
- [x] Implementar total y moneda.
- [x] Implementar productos, cantidad, unidad y eliminación.
- [x] Separar creación de draft, revisión y confirmación.
- [x] Mostrar que confirmar modifica el inventario.
- [x] Confirmar antes de aplicar la compra.
- [x] Invalidar compras, inventario y lista de compras después de confirmar.
- [x] Mostrar resultado exitoso y errores de backend.
- [x] Impedir modificar compras confirmadas.
- [x] Añadir tests de validación, draft, edición, confirmación y errores.

### #52 - Lista De Compras Compartida

- [x] Crear `apps/web/src/modules/shopping-list/` por capas.
- [x] Definir entidad de elemento de lista.
- [x] Definir `ShoppingListGateway`.
- [x] Implementar casos de uso para cargar, agregar, editar, eliminar y marcar comprado.
- [x] Implementar generación desde inventario.
- [x] Crear la ruta `/app/lista-de-compras`.
- [x] Mostrar elementos pendientes y comprados.
- [x] Mostrar nombre, cantidad, unidad, notas y fuente.
- [x] Diferenciar fuentes manuales, bajo mínimo, agotados y plan semanal.
- [x] Aclarar que marcar comprado no modifica inventario.
- [x] Mostrar estados de carga, vacío, error y éxito.
- [x] Añadir tests de CRUD, marcado y generación desde inventario.

### #53 - Crear Compra Desde La Lista

- [x] Permitir seleccionar varios elementos pendientes.
- [x] Mostrar la acción primaria `Registrar compra`.
- [x] Abrir un draft con los elementos seleccionados.
- [x] Mantener `sourceShoppingItemId` en cada producto.
- [x] Permitir modificar cantidades faltantes.
- [x] Advertir cuando falte una cantidad.
- [x] Permitir indicar comercio, total, moneda y fecha.
- [x] No confirmar automáticamente al crear el draft.
- [x] Confirmar la compra mediante `convert-to-purchase`.
- [x] Usar `idempotencyKey` cuando corresponda.
- [x] Marcar elementos comprados únicamente después de confirmar.
- [x] Volver a `/app/lista-de-compras` con feedback de éxito.
- [x] Añadir tests de selección, cantidades, cancelación, errores y confirmación.

## Pruebas Y Accesibilidad

- [x] Probar casos de uso con éxito, error y estados inválidos.
- [x] Probar mappers y payloads sin duplicar contratos generados.
- [x] Probar estados visibles de carga, vacío, error y éxito.
- [x] Probar formularios con validación, envío, edición y confirmación.
- [x] Probar navegación entre compras, inventario y lista de compras.
- [x] Verificar labels asociados, nombres accesibles y foco visible.
- [x] Verificar que las acciones destructivas o irreversibles pidan confirmación.
- [x] Verificar funcionamiento desde 320 px y escritorio.
- [x] Evitar snapshots sin comportamiento observable.

## Entrega

- [ ] Crear una rama nueva desde `main` actualizado.
- [ ] Implementar #49-#53 en un único bloque coherente.
- [ ] Revisar el diff y excluir cambios ajenos.
- [ ] Ejecutar `npm run lint` una vez al finalizar.
- [ ] Crear un único commit convencional.
- [ ] Hacer un único push.
- [ ] Crear un único PR contra `main`.
- [ ] Incluir `Closes #49`, `Closes #50`, `Closes #51`, `Closes #52` y `Closes #53`.
- [ ] Documentar pasos manuales en móvil y escritorio.
- [ ] Marcar tests y build como pendientes de GitHub Actions.
