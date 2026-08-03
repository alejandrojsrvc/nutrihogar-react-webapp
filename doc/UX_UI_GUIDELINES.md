# UX/UI Guidelines — NutriHogar

Este documento define cómo las personas encuentran funciones, comprenden información y completan tareas en teléfono, tablet y escritorio. Es normativo para navegación, arquitectura de información, responsive y flujos. No sustituye los criterios específicos de cada issue.

## 1. Modelo mental

NutriHogar debe organizarse alrededor de tareas familiares, no de entidades técnicas.

La persona piensa:

- ¿Qué comemos hoy?
- ¿Qué tengo que registrar?
- ¿Qué falta comprar?
- ¿Qué puedo cocinar con lo disponible?
- ¿Cómo viene mi progreso?

No debe necesitar entender primero “movimientos”, “batches”, “snapshots” o la estructura interna de módulos.

## 2. Arquitectura de información

Destinos principales:

| Destino | Propósito | Contenido principal |
|---|---|---|
| Hoy | Orientar el día | resumen, plan de hoy, registro pendiente, alertas importantes |
| Planificar | Preparar próximas comidas | semana, recetas, preparaciones y compras |
| Hogar | Administrar recursos compartidos | inventario, familia y configuración del hogar |
| Progreso | Comprender evolución | resumen nutricional, cuerpo, síntomas y evolución |

La navegación principal tiene exactamente cuatro destinos: `Hoy`, `Planificar`, `Hogar` y `Progreso`. No existe un destino principal `Más`, `Registrar`, `Configuración`, `Compras`, `Recetas` ni `Reportes`.

`Registrar comida` es una acción contextual dentro de Hoy y no un destino permanente. Desde Hoy prioriza la comida planificada, recetas disponibles y comidas recientes antes de mostrar búsqueda de alimentos u opciones avanzadas.

Las recetas y preparaciones viven dentro de Planificar. Las compras se acceden desde la navegación secundaria de Planificar. Inventario y familia viven dentro de Hogar. Los reportes detallados viven dentro de Progreso.

El menú del perfil es una superficie pequeña y contextual. Puede contener notificaciones, configuración del hogar, preferencias personales, tema y cierre de sesión. No replica el catálogo de módulos ni crea un segundo sidebar. Si una capacidad todavía no tiene ruta o contrato disponible, se comunica como pendiente y no se simula.

## 3. Navegación adaptativa

| Ancho orientativo | Navegación | Patrón de contenido |
|---|---|---|
| 320–599 px | barra inferior con cuatro destinos | una columna y pantallas completas |
| 600–1023 px vertical | barra inferior o rail compacto según espacio real | una columna amplia; dos paneles solo si simplifican |
| 600–1023 px horizontal | navigation rail con cuatro destinos | lista-detalle para tareas adecuadas |
| 1024 px o más | sidebar fijo | contenido limitado; lista-detalle o columnas con propósito |

Reglas:

- No duplicar la navegación principal entre topbar, sidebar y tabs.
- Sidebar, barra inferior y navigation rail consumen la misma configuración central de cuatro destinos.
- El sidebar de escritorio solo muestra `Hoy`, `Planificar`, `Hogar` y `Progreso`; las funciones secundarias aparecen dentro de su sección.
- En teléfono la barra inferior tiene exactamente cuatro destinos y nunca incluye `Más` ni `Registrar`.
- En tablet horizontal el rail mantiene las mismas cuatro secciones; en vertical se usa la barra inferior cuando el espacio no permite un rail cómodo.
- Indicar destino activo con texto, icono y tratamiento visual.
- Conservar la misma agrupación conceptual entre dispositivos.
- No ocultar funciones esenciales solo por falta de ancho.
- El botón Atrás vuelve al contexto anterior, no siempre al inicio del módulo.
- Tabs cambian vistas hermanas dentro de una misma tarea; no sustituyen navegación global.
- La navegación secundaria visible se limita a tres opciones por sección cuando aplica: Planificar (`Semana`, `Recetas`, `Compras`) y Hogar (`Inventario`, `Familia`). Progreso entra directamente a su resumen; sus detalles se organizan dentro de la sección.
- La selección de hogar o integrante es contexto, no destino de navegación.
- El menú del perfil se abre desde el avatar o integrante activo y se cierra al navegar; no sustituye las cuatro secciones principales.

## 4. Experiencia en teléfono

- Diseñar desde 360–390 px, no comprimir escritorio.
- Flujo vertical y una tarea principal por pantalla.
- No usar tablas tradicionales.
- No mostrar más de una acción primaria simultánea.
- No esconder acciones frecuentes exclusivamente en menús de tres puntos.
- Acciones principales pueden fijarse abajo si no ocultan contenido ni navegación.
- Formularios largos usan ruta o pantalla completa, no modal centrado.
- Bottom sheets se reservan para selección o acciones breves.
- Evitar filas con varios iconos pequeños.
- Mantener controles y filas accionables de al menos 44 px de alto.
- Preservar borradores ante navegación accidental, cambio de app o error.
- Considerar teclado abierto, safe areas y uso con una mano.
- El contenido esencial debe aparecer antes del primer scroll cuando sea razonable.

## 5. Experiencia en tablet

Tablet no es un teléfono estirado ni un escritorio reducido.

- Mantener interacción táctil y áreas de 44 px.
- En vertical, priorizar una columna legible; no crear columnas solo porque caben.
- En horizontal, usar lista-detalle para recetas, inventario, planificación y reportes cuando evita viajes entre pantallas.
- Mantener selección y posición de scroll al cambiar entre lista y detalle.
- Formularios y texto continuo no ocupan todo el ancho.
- Panel secundario no debe contener la única forma de completar una tarea esencial si desaparece en vertical.
- Soportar cambios de orientación sin perder datos o contexto.
- Rail y sidebar nunca reducen el área útil a una columna incómoda.

## 6. Experiencia en escritorio

- Sidebar para navegación estable y completa.
- Shell máximo de 72 rem salvo vistas de datos justificadas.
- Formularios máximo de 36 rem.
- Aprovechar espacio para contexto simultáneo, no para estirar controles.
- Usar tablas solo cuando comparar columnas sea la tarea.
- Las acciones principales permanecen cerca del contenido que afectan.
- Hover puede complementar, nunca ser requisito.

## 7. Estructura de una pantalla

Orden recomendado:

1. Contexto: breadcrumb solo si aporta, título y miembro/fecha activos.
2. Información necesaria para decidir.
3. Tarea o contenido principal.
4. Acción primaria cerca de su objeto.
5. Acciones secundarias y detalles progresivos.

No repetir título, resumen o acción principal en topbar, hero y tarjeta. Los encabezados móviles deben ser breves; las descripciones largas solo aparecen cuando evitan errores.

## 8. Selección de hogar, adulto y fecha

- El hogar activo debe persistir y mostrarse cuando pueda existir ambigüedad.
- El adulto activo se muestra cerca de datos personales: metas, comidas, peso, medidas, síntomas y reportes.
- Cambiar adulto actualiza el contenido antes de permitir editar datos; comunicar claramente el nuevo contexto.
- Nunca mezclar métricas de distintos adultos sin etiquetas explícitas.
- La fecha o semana activa permanece visible en planificación y reportes.
- Volver a Hoy restablece el día actual solo cuando la acción es explícita o el contexto ya no es válido.

## 9. Divulgación progresiva

Mostrar primero lo necesario para actuar; dejar el detalle técnico bajo expansión o detalle.

Ejemplos:

- Comida: nombre, cantidad, calorías/macros relevantes; micronutrientes en detalle.
- Inventario: alimento, cantidad, estado; historial en detalle.
- Plan: comida, participantes, disponibilidad; cálculo completo en revisión.
- IA: propuesta y advertencias; trazabilidad técnica no se presenta como contenido cotidiano.
- Síntomas: frecuencia y asociaciones observadas; nunca diagnóstico.

No ocultar información crítica, restricciones alimentarias, conflictos de sincronización o consecuencias irreversibles.

## 10. Formularios y flujos largos

- Un formulario corto se completa en una pantalla.
- Dividir en pasos solo cuando cada paso tiene una decisión coherente.
- Mostrar progreso con nombre del paso, no solo “2/5”.
- Permitir volver sin perder datos.
- Guardar borrador cuando el costo de reingreso sea alto.
- Validar al salir del campo o al enviar según el tipo de error; no mostrar errores antes de interacción.
- Colocar errores junto al campo y un resumen al inicio si existen varios.
- Confirmar acciones irreversibles; no confirmar cada guardado cotidiano.
- Después de guardar, llevar al resultado útil o mantener contexto con feedback específico.
- Deshabilitar doble envío y conservar los datos ante fallos.

## 11. Búsqueda, filtros y selección

- Búsqueda visible cuando sea una tarea principal, como catálogo o recetas.
- Mostrar consultas recientes o sugerencias solo si reducen trabajo real.
- Debounce no debe impedir enviar inmediatamente.
- Filtros activos permanecen visibles y pueden limpiarse individualmente.
- En móvil, filtros complejos usan bottom sheet o pantalla breve con resumen de selección.
- Resultados indican por qué están vacíos: sin datos, sin coincidencias o sin conexión.
- Selecciones múltiples muestran contador y acción de finalizar.
- Al volver del detalle, conservar búsqueda, filtros y scroll.

## 12. Listas, detalle y acciones

- Toda fila tiene un objetivo claro: seleccionar, abrir detalle o ejecutar una acción frecuente.
- No mezclar esos tres comportamientos sin jerarquía táctil.
- Swipe no puede ser el único acceso a una acción.
- Acciones destructivas requieren confirmación o deshacer según reversibilidad.
- Preferir “Deshacer” después de una acción reversible frente a confirmación previa.
- En tablet horizontal y escritorio, lista-detalle conserva selección.
- En teléfono, el detalle es pantalla completa y Atrás restaura el estado de lista.

## 13. Patrones por flujo del producto

### Hoy

Orden:

1. Adulto y fecha activos.
2. Próxima comida o registro pendiente.
3. Acción contextual “Registrar”.
4. Resumen diario compacto.
5. Alertas operativas: faltantes, inventario crítico, sincronización o recordatorios.

No convertir Inicio en un dashboard con todas las métricas. Cada bloque debe responder “¿qué hago ahora?” o “¿necesito saber esto hoy?”.

### Registro de comidas

Flujo recomendado:

1. Elegir comida y adulto si no vienen del contexto.
2. Buscar alimento, receta, preparación o comida planificada.
3. Indicar cantidad con unidad comprensible.
4. Revisar resumen.
5. Guardar comida.

Permitir repetir una comida reciente cuando sea seguro. Diferenciar estimación del valor definitivo calculado por backend.

### Recetas y preparaciones

- Receta es plantilla; preparación es ejecución real. La interfaz debe nombrarlas claramente.
- Crear receta: datos básicos → ingredientes → revisión nutricional.
- Cocinar: confirmar cantidades reales → peso final → porciones → restos/sobrante.
- Mostrar siempre en qué paso está la persona y qué puede corregirse después.
- Distribuir porciones por adulto con nombres y cantidades visibles simultáneamente cuando quepan.

### Planificación semanal

- Semana activa siempre visible.
- En teléfono, navegar por días y mostrar comidas en orden; no comprimir siete columnas.
- En tablet horizontal/escritorio, calendario semanal puede usar columnas si cada comida sigue siendo táctil y legible.
- Añadir comida desde el día y horario correspondiente.
- Mostrar participantes, estado y faltantes sin abrir detalle cuando son importantes.
- Separar planificado, preparado y consumido mediante texto/estado, no solo color.
- “Agregar faltantes a compras” ocurre desde la revisión de disponibilidad.

### Inventario

- Vista inicial prioriza búsqueda, existencias críticas y categorías útiles.
- Cada elemento muestra cantidad disponible, unidad y estado.
- “Agregar”, “Consumir”, “Ajustar” y “Desperdiciar” son intenciones de usuario; “movimiento” queda como concepto histórico.
- Historial es detalle secundario y muestra operaciones pendientes offline.
- No presentar saldo local pendiente como confirmado por servidor.

### Compras y lista

- Lista compartida optimizada para uso en tienda: controles grandes, marcado rápido y estado offline visible.
- Convertir elementos seleccionados en compra conserva cantidades y permite corregir precio/unidad.
- Registrar compra muestra qué actualizará el inventario antes de confirmar.
- Presupuesto y totales usan moneda y formato local coherente; distinguir estimado de real.

### Progreso, medidas y síntomas

- Peso y medidas forman un registro semanal conjunto cuando corresponde.
- Mostrar tendencia, periodo y valores exactos.
- No celebrar descenso ni penalizar aumento sin contexto de objetivo.
- Registro de síntomas es breve: tipo, intensidad, momento, notas y comidas relacionadas.
- Asociaciones se expresan como coincidencias observadas, nunca causalidad o diagnóstico.
- Cambiar adulto es explícito y visible.

### Reportes

- Comenzar con una conclusión legible y luego evidencia.
- Diario: consumo frente a referencia y comidas registradas.
- Semanal: promedio, adherencia y variación, sin sobrecargar.
- Operativo: inventario, compras y desperdicio con acciones relacionadas.
- Exportar es acción secundaria; indicar formato y alcance temporal.

### Recomendaciones con IA

- Etiquetar como propuesta asistida, no decisión definitiva.
- Mostrar restricciones, advertencias y faltantes antes de confirmar.
- Permitir editar, sustituir, regenerar una parte o descartar.
- Nunca guardar cambios sin confirmación explícita.
- Distinguir generación, validación determinista y resultado guardado.
- Si la función está desactivada o falla, los flujos manuales siguen disponibles.

### Recordatorios y notificaciones

- Configuración por tipo, días y horario.
- Si la acción ya se completó, el recordatorio no debe insistir.
- Acciones: completar, posponer, silenciar o desactivar según contexto.
- El centro de notificaciones prioriza pendientes y permite identificar las leídas.
- Una notificación solo navega a rutas permitidas y conserva el hogar/adulto correcto.

## 14. Offline y sincronización

Estados mínimos:

| Estado | Mensaje esperado | Acción |
|---|---|---|
| Sin conexión con snapshot | “Viendo datos guardados en este dispositivo” | continuar si la operación es compatible |
| Cambio pendiente | “Pendiente de sincronización” | ver estado o continuar |
| Sincronizando | “Sincronizando…” | evitar duplicados |
| Sincronizado | confirmación breve | ninguna obligatoria |
| Conflicto | explicar qué dato cambió | revisar y resolver |
| Sin snapshot | explicar que no hay datos disponibles | reintentar al conectarse |

- No bloquear operaciones diseñadas para offline.
- No prometer que un cambio está guardado en servidor mientras siga pendiente.
- Las colas y reintentos no deben crear movimientos duplicados.
- El indicador global de conexión no sustituye el estado específico de cada cambio.

## 15. Estados vacíos, carga y error

- Vacío inicial: enseñar el beneficio y ofrecer crear/agregar.
- Sin resultados: conservar consulta y filtros; ofrecer limpiarlos.
- Carga inicial: skeleton con estructura probable.
- Recarga: conservar datos anteriores e indicar actualización discreta.
- Error recuperable: reintentar sin perder contexto.
- Permisos: explicar quién puede realizar la acción.
- Feature desactivada: ofrecer camino manual si existe.

## 16. Accesibilidad e interacción

- Orden de foco coincide con el orden visual.
- El foco vuelve al disparador al cerrar diálogo o sheet.
- Al cambiar de ruta, mover foco al encabezado principal de forma controlada.
- Mensajes dinámicos relevantes usan anuncios accesibles sin saturar.
- Drag and drop siempre tiene alternativa mediante botones o menú.
- Charts tienen resumen textual o tabla accesible.
- Objetivos táctiles de 44 × 44 px y separación suficiente para evitar errores.
- No depender de hover, gesto oculto, color o memoria del usuario.

## 17. Contenido y formatos

- Fechas, moneda y separadores respetan locale configurado.
- Mostrar unidad junto a cantidades; evitar números desnudos.
- Mantener precisión útil para alimentos sin exhibir decimales irrelevantes.
- Nombres largos se envuelven; no truncar la única identificación del elemento.
- Acciones usan verbo + resultado.
- Mensajes responden: qué pasó, qué implica y qué puede hacerse.

## 18. Checklist UX/UI de PR

- [ ] La tarea principal se reconoce sin conocer la arquitectura interna.
- [ ] Navegación y Atrás conservan el contexto.
- [ ] Se definió comportamiento para 390, 768 y 1440 px desde el código.
- [ ] Tablet no es solo una versión estirada.
- [ ] No hay tabla tradicional ni modal largo en teléfono.
- [ ] Formularios conservan datos y evitan doble envío.
- [ ] Búsqueda, filtros y scroll se preservan al volver del detalle.
- [ ] Estados vacío, carga, error, offline y permisos se cubren cuando aplican.
- [ ] Hogar, adulto, fecha y unidades no son ambiguos.
- [ ] La acción primaria es única y alcanzable.
- [ ] La revisión visual manual pendiente está descrita sin afirmar que fue ejecutada.
