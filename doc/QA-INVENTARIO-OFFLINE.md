# QA: Inventario Offline y Sincronización

## Preparación

- Usar un hogar con al menos dos existencias activas.
- Tener una existencia con cantidad suficiente para consumo y ajuste.
- Abrir la aplicación en móvil y escritorio con DevTools disponible.
- Confirmar que IndexedDB está habilitado.

## Flujo principal

1. Abrir `/app/inventario` y verificar el inventario remoto.
2. Desactivar la red desde DevTools.
3. Recargar la página y confirmar que aparece el snapshot local.
4. Registrar un consumo manual.
5. Registrar un ajuste de cantidad.
6. Confirmar que la UI muestra los saldos optimistas.
7. Recargar la página sin red.
8. Confirmar que las operaciones siguen visibles como pendientes.
9. Reactivar la red.
10. Confirmar que la sincronización se inicia al recuperar conexión.
11. Verificar que las operaciones aplicadas permanecen registradas con estado aplicado.
12. Confirmar que el snapshot final coincide con el backend.

## Conflictos

1. Crear una operación offline sobre una existencia.
2. Modificar esa misma existencia desde otro dispositivo o desde el backend.
3. Recuperar conexión y sincronizar.
4. Confirmar que el conflicto aparece en la lista y no desaparece silenciosamente.
5. Revisar el motivo mostrado.
6. Descartar la operación.
7. Confirmar que deja de aparecer como pendiente y que el snapshot remoto sigue intacto.

## Validaciones

- No se pierden operaciones tras recargar.
- No se aplican duplicados al reintentar.
- El consumo no permite superar la disponibilidad.
- El estado offline es visible y comprensible.
- Los conflictos tienen una acción explícita.
- La experiencia funciona desde 320 px de ancho y en escritorio.
- No se almacenan tokens ni secretos en IndexedDB.
