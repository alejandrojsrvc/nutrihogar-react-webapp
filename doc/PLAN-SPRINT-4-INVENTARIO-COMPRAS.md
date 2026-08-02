# Plan Sprint 4: Inventario, Compras y Lista de Compras

## Alcance

Trabajar las issues `#45` a `#57` del Sprint 4. La issue `#58` queda fuera por pertenecer al Sprint 5.

Se conservarán los cambios actuales de la rama, incluidos los cambios relacionados con perfiles, onboarding, comidas, navegación, estilos, compras y lista de compras.

## Próximo bloque

Las siguientes actividades frontend pendientes son `#45`, `#46` y `#47`, todas abiertas en GitHub y sin PR asociado.

1. Implementar `#45`: salidas manuales de inventario por consumo, desperdicio y vencimiento.
2. Implementar `#46`: integración de preparaciones con consumo confirmado de ingredientes.
3. Implementar `#47`: guardar sobrantes preparados como existencias.
4. Continuar con `#48`: consumir un sobrante preparado y crear la comida correspondiente.

La secuencia representa el flujo funcional: **inventario → preparación → sobrante → consumo**.

## Estado actual y orden posterior

Las issues `#49–#53` ya están cerradas en GitHub y sus módulos se conservan dentro del mismo conjunto de cambios. Las siguientes issues abiertas del Sprint 4 son `#54–#57`.

Después de completar `#45–#48`:

1. Completar `#54–#55`:
   - Migración y persistencia completa en IndexedDB.
   - Estados de operaciones, reintentos y resultados.
   - Sincronización automática y manual.
   - Conservación, visualización y resolución de conflictos.
2. Incorporar `#56` cuando inventario, compras, lista y sincronización estén estables:
   - Inventario crítico.
   - Sobrantes y próximos vencimientos.
   - Pendientes de lista de compras.
   - Estado offline y sincronización.
3. Cubrir `#57`:
   - Pruebas de aplicación y presentación necesarias.
   - Validación manual en navegador real, móvil y escritorio.
   - Persistencia tras recarga, reintentos, duplicados y conflictos.

## Bloqueos de contrato

No se duplicarán DTO ni se editará código OpenAPI generado. Las issues que dependan de contratos incompletos solo podrán cerrarse cuando los contratos backend estén disponibles, se regenere el cliente y los tipos resultantes permitan implementar el flujo completo.

- `#46`: verificar que `PreparedBatchInventoryPreviewResponseDto` exponga ingredientes, existencias compatibles, disponibilidad y estados.
- `#47`: verificar que el endpoint para agregar sobrantes acepte cantidad, ubicación y vencimiento opcional.
- `#50–#53`: las respuestas de compras y lista de compras están sin tipar; además faltan notas y filtro por fecha en los contratos actuales.

## Validación y entrega

- Crear o actualizar pruebas Vitest para comportamiento observable, validaciones, estados, errores y accesibilidad.
- No ejecutar tests frontend ni build localmente; quedan a cargo de GitHub Actions.
- Ejecutar `npm run lint` una sola vez al finalizar.
- Revisar el diff completo y confirmar que solo contiene archivos del pedido.
- Crear un único commit convencional para Sprint 4.
- Abrir un único PR contra `main` con el resumen por issue, riesgos, pasos manuales y referencias `Closes #45` a `Closes #57` únicamente para las issues completamente resueltas.

## Fuera de alcance

- `#58`, arquitectura modular de Meal Planning, por pertenecer al Sprint 5.
- Implementar silenciosamente dependencias backend o funcionalidades futuras.
