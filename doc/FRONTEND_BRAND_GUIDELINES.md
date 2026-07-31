Frontend Brand Guidelines

Plataforma de control nutricional familiar

Este documento define la identidad visual y las reglas de diseño que deben respetarse en el frontend.

Debe leerse antes de crear o modificar pantallas, componentes, layouts, formularios, dashboards o estilos

globales.

1. Dirección de marca

La interfaz debe sentirse como:

Un cuaderno familiar de nutrición, cálido, simple y preciso.

La aplicación debe transmitir:

•

Calidez.

•
•

Confianza.
Claridad.

•

Cercanía.

•

Precisión.

•

Bienestar.

•

Organización familiar.

La aplicación no debe parecer:

•

Un sistema hospitalario.

•

Una aplicación de fitness extremo.

•

Un ERP empresarial.

•

Una aplicación infantil.

•

Una aplicación de delivery.

•

Un contador obsesivo de calorías.

2. Referencias visuales

La dirección visual combina:

•

Wise como referencia principal para claridad, composición espaciosa y jerarquía de acciones.

•

Airbnb como referencia secundaria para interacción móvil, tamaños táctiles, formularios y drawers.

•

Cal.com como referencia secundaria para dashboards limpios y jerarquía visual.

•

Duolingo únicamente como inspiración para logros, rachas y refuerzo positivo.

1

Estas referencias no deben copiarse literalmente.

3. Principios de interfaz

1.

Mobile-first.

2.

Una acción principal clara por pantalla.

3.

Pocos niveles de profundidad visual.

4.

Uso mínimo de sombras.

5.

No colocar todo dentro de tarjetas.

6.

Formularios largos directamente sobre la superficie de la página.

7.

Las tarjetas se reservan para contenido agrupado o resumido.

8.

Los colores semánticos deben conservar siempre el mismo significado.

9.

Los datos nutricionales deben priorizar legibilidad sobre decoración.

10.

La interfaz debe evitar mensajes culpabilizantes.

4. Paleta de colores

Colores principales

:root {

--color-primary-50: #eef7f2;

--color-primary-100: #ddeee5;

--color-primary-200: #bfddcc;

--color-primary-300: #96c5ab;

--color-primary-400: #68a985;

--color-primary-500: #438d68;

--color-primary-600: #2f7d5a;

--color-primary-700: #276a4c;

--color-primary-800: #22553f;

--color-primary-900: #1d4635;

}

Color principal de marca:

--color-primary: #2f7d5a;

--color-primary-hover: #276a4c;

--color-primary-soft: #ddeee5;

El verde principal debe utilizarse en:

•

Acción principal.

•

Elementos seleccionados.

2

•

Confirmaciones.

•

Progreso favorable.

•

Estados activos.

•

Enlaces importantes.

No debe utilizarse como fondo dominante de toda la aplicación.

Superficies

--color-canvas: #ffffff;

--color-surface: #ffffff;

--color-surface-muted: #e8ebe6;

--color-surface-elevated: #ffffff;

Texto

--color-text-primary: #1f2924;

--color-text-secondary: #68736d;

--color-text-disabled: #9aa39e;

--color-text-inverse: #ffffff;

Bordes

--color-border: #dedcd4;

--color-border-strong: hsl(48, 48%, 61%);

--color-focus-ring: #68a985;

Estados

--color-success: #2f7d5a;

--color-success-soft: #ddeee5;

--color-warning: #c7852c;

--color-warning-soft: #f8ead3;

--color-danger: #c5534c;

--color-danger-soft: #f8dfdc;

--color-info: #4a7fa3;

--color-info-soft: #dfeaf2;

3

5. Colores nutricionales

Los nutrientes deben conservar siempre el mismo color.

--color-protein: #8e5d45;

--color-protein-soft: #f1e3dc;

--color-carbohydrates: #d19a3e;

--color-carbohydrates-soft: #f7ecd6;

--color-fat: #a47bbd;

--color-fat-soft: #eee4f3;

--color-fiber: #4f8b61;

--color-fiber-soft: #e1eee5;

Reglas:

•

No cambiar estos colores entre pantallas.

•

No utilizarlos como colores decorativos genéricos.

•

Deben representar siempre el mismo nutriente.

•

La información no debe depender únicamente del color.

•

Incluir siempre nombre, unidad y valor.

6. Tipografía

Fuente principal

Usar:

Inter

Los encabezados utilizan la misma familia para mantener una interfaz consistente:

Inter

Configuración recomendada:

--font-family-body:

"Inter",

system-ui,

4

-apple-system,

BlinkMacSystemFont,

"Segoe UI",

sans-serif;

--font-family-heading:

"Inter",

"Inter",

system-ui,

sans-serif;

No agregar una segunda fuente sin una necesidad real.

Escala tipográfica

--font-size-xs: 0.75rem;

--font-size-sm: 0.875rem;

--font-size-base: 1rem;

--font-size-lg: 1.125rem;

--font-size-xl: 1.25rem;

--font-size-2xl: 1.5rem;

--font-size-3xl: 1.875rem;
--font-size-4xl: 2.25rem;

Pesos:

--font-weight-regular: 400;

--font-weight-medium: 500;

--font-weight-semibold: 600;

--font-weight-bold: 600;

Reglas:

•

El cuerpo utiliza peso 400 o 500.

•

Los labels utilizan 500 o 600.

•

•

Los títulos utilizan 600.
Los datos numéricos deben usar  font-variant-numeric: tabular-nums .

•

No usar textos en mayúsculas extensas.

7. Espaciado

Usar una escala basada en múltiplos de cuatro.

5

--space-1: 0.25rem;

--space-2: 0.5rem;

--space-3: 0.75rem;

--space-4: 1rem;

--space-5: 1.25rem;

--space-6: 1.5rem;

--space-8: 2rem;

--space-10: 2.5rem;

--space-12: 3rem;

--space-16: 4rem;

Reglas:

•

Separación entre label e input: 8 px.

•

Separación entre campos: 20–24 px.

•

Padding de página móvil: 16 px.

•

Padding de página de escritorio: 24–32 px.

El contenido privado utiliza un ancho común máximo de 72rem para que las
pantallas compartan la misma alineación. Los formularios y bloques de lectura
continua pueden limitarse a 36rem sin cambiar el ancho del shell.

•

Padding de tarjeta: 16–20 px.

•

Evitar márgenes arbitrarios fuera de la escala.

8. Radios

--radius-sm: 0.5rem;

--radius-md: 0.625rem;

--radius-lg: 0.875rem;

--radius-xl: 1rem;

--radius-pill: 9999px;

Uso recomendado:

•

Inputs y botones: 10 px.

•

Tarjetas: 14–16 px.

•

Chips: radio completo.

•

Modales y drawers: 16 px en las esquinas visibles.

No redondear excesivamente tablas, secciones o layouts completos.

9. Sombras

Las sombras deben ser discretas.

6

--shadow-sm: 0 1px 2px rgb(31 41 36 / 0.05);

--shadow-md: 0 4px 12px rgb(31 41 36 / 0.08);

Reglas:

•

Preferir bordes antes que sombras.

•

No usar sombras intensas.

•

•

No aplicar sombra a todos los componentes.
shadow-md  se reserva para modales, drawers y menús flotantes.

10. Botones

Botón primario

•

Fondo  --color-primary .

•

Texto blanco.

•

Altura mínima de 48 px.

•

Radio de 10 px.

•

•

Peso 600.
Hover con  --color-primary-hover .

Botón secundario

•

Fondo transparente o superficie.

•

Borde visible.

•

Texto principal.

•

No competir visualmente con el botón primario.

Botón destructivo

•

Utilizar  --color-danger .

•

Reservado para eliminar, cancelar permanentemente o descartar.

Reglas

•

Una sola acción primaria dominante por pantalla o sección.

•

No mostrar filas de muchos botones con el mismo peso visual.

•

En móvil, las acciones principales pueden fijarse en la zona inferior.

•

Área táctil mínima: 44 × 44 px.

•

Incluir estados loading y disabled.

7

11. Inputs y formularios

Los inputs deben tener:

•

Altura mínima de 48 px.

•

Label visible.

•

Placeholder complementario, no sustituto del label.

•

Borde de 1 px.

•

Fondo de superficie.

•

Focus ring visible.

•

Mensaje de ayuda o error debajo.

Estados obligatorios:

•

Default.

•

Hover.

•

Focus.

•

Disabled.

•

Error.

•

Loading cuando corresponda.

Reglas:

•

No meter cada campo dentro de una tarjeta.

•

Agrupar campos mediante títulos de sección y espaciado.

•

Los formularios extensos pueden dividirse en pasos.

•

Los números deben mostrar su unidad claramente.

•

Utilizar teclado numérico en móvil cuando corresponda.

12. Tarjetas

Usar tarjetas para:

•

Resumen del día.

•

Comida planificada.

•

Estado de inventario.

•

Progreso semanal.

•

Alertas agrupadas.

•

Contenido que pueda actuar como una unidad independiente.

No usar tarjetas para:

•

Cada campo individual.

•

Cada línea de una tabla.

•

Cada label y valor.

•

Toda sección de una página sin motivo.

8

Estilo:

background: var(--color-surface-subtle);

border: 0;

border-radius: var(--radius-lg);

box-shadow: var(--shadow-sm);

13. Navegación

Móvil

Utilizar navegación inferior para las secciones principales en móvil y un
drawer para navegación secundaria.

Posibles accesos:

•

Inicio.

•

Plan.

•

Registrar.

•

Inventario.

•

Progreso.

La acción “Registrar comida” debe tener mayor visibilidad.

Escritorio

Utilizar un sidebar fijo en escritorio. El topbar se reserva para marca,
contexto y acciones del shell; no duplica la navegación principal.

Reglas:

•

No duplicar navegación sin necesidad.

•

Mantener reducido el número de secciones principales.

•

Indicar claramente la sección activa.

14. Iconografía

Usar una sola librería de iconos en todo el proyecto.

Recomendación:

Lucide Icons

9

Reglas:

•

Stroke consistente.

•

Tamaño habitual: 18–22 px.

•

No mezclar iconos outline y filled arbitrariamente.

•

Todo icono sin texto debe tener label accesible.

•

No utilizar emojis como iconografía principal de interfaz.

15. Gráficos y datos

Los gráficos deben ser simples y accionables.

Priorizar:

•

Barras de progreso.

•

Tendencias lineales.

•

Comparaciones semanales.

•

Valores actuales frente a objetivo.

Evitar:

•

Gráficos 3D.

•

Donuts innecesarios.

•

Exceso de colores.

•

Visualizaciones que oculten los valores exactos.

Los datos deben poder comprenderse aunque el color no sea visible.

16. Tono de comunicación

La aplicación debe informar sin juzgar.

Evitar:

Fallaste tu objetivo.

Comiste mal.

Te excediste demasiado.

No cumpliste.

Preferir:

10

Consumiste 210 kcal sobre la referencia de hoy.

La proteína quedó 24 g por debajo del objetivo.

El promedio semanal continúa dentro del rango previsto.

Puedes ajustar las próximas comidas si lo consideras necesario.

El tono debe ser:

•

Claro.

•

Amable.

•

Directo.

•

No médico.

•

No culpabilizante.

•

Sin infantilizar.

17. Accesibilidad

Requisitos mínimos:

•

Contraste AA.

•

Navegación mediante teclado.

•

Focus visible.

•

Labels asociados a campos.

•

Estados comunicados mediante texto, no solo color.

•

Botones con nombres accesibles.

•

Mensajes de error vinculados a sus campos.

•

Soporte para reducción de movimiento.

@media (prefers-reduced-motion: reduce) {

*,

*::before,

*::after {

scroll-behavior: auto !important;

animation-duration: 0.01ms !important;

animation-iteration-count: 1 !important;

transition-duration: 0.01ms !important;

}

}

18. Movimiento y animaciones

Las animaciones deben ser breves y funcionales.

11

--duration-fast: 120ms;

--duration-normal: 180ms;

--duration-slow: 240ms;

Usar animación para:

•

Confirmar una acción.

•

Mostrar u ocultar un drawer.

•

Cambiar estados.

•

Actualizar progreso.

No usar:

•

Animaciones permanentes.

•
•

Rebotes excesivos.
Efectos que retrasen la interacción.

19. Modo oscuro

El modo oscuro forma parte del sistema visual vigente y se aplica a toda la
aplicación mediante los mismos tokens semánticos.

La preferencia inicial sigue el sistema operativo (`prefers-color-scheme`). La
persona puede elegir `Sistema`, `Claro` u `Oscuro`; la elección se persiste
localmente.

En oscuro:

--color-canvas: #000000;

--color-surface: #111111;

--color-surface-muted: #1d1d1d;

--color-surface-subtle: #171717;

--color-text-primary: #f5f5f5;

--color-text-secondary: #a6a6a6;

El negro se reserva para el canvas. El verde continúa siendo el color de
marca, acción y estados positivos, no el fondo dominante.

20. Implementación de tokens

Los tokens deben centralizarse.

Ubicación sugerida:

src/styles/tokens.css

O, si existe un paquete compartido:

packages/design-tokens/src/tokens.css

Los componentes no deben usar hexadecimales arbitrarios.

Incorrecto:

12

color: #2f7d5a;

Correcto:

color: var(--color-primary);

Cualquier excepción debe documentarse.

21. Reglas para Codex y OpenCode

Antes de modificar una pantalla o componente:

1.

Leer este documento completo.

2.

Revisar los tokens existentes.

3.

Reutilizar componentes antes de crear nuevos.

4.

No introducir colores arbitrarios.

5.

No crear variantes visuales innecesarias.

6.

Mantener una sola acción primaria.

7.

Diseñar primero para móvil.

8.

Incluir estados loading, empty, error y disabled.

9.

No mover lógica de negocio a componentes.

10.

Verificar accesibilidad básica.

11.

No cambiar la identidad visual fuera del alcance de la tarea.

12.

Ejecutar lint y tests. No iniciar servidores ni ejecutar build como parte de
la validación automatizada del frontend.

13.

Indicar qué componentes y tokens fueron reutilizados.

14.

Incluir pasos para probar manualmente en móvil y escritorio.

22. Checklist para pull requests

•

[ ] Respeta la paleta definida.

•

[ ] Utiliza tokens, no colores arbitrarios.

•

[ ] Conserva los colores nutricionales.

•

[ ] Funciona desde 320 px de ancho.

•

[ ] Tiene una acción primaria clara.

•

[ ] Incluye estados loading, empty y error.

•

[ ] Los controles tienen tamaño táctil adecuado.

•

[ ] El focus es visible.

•

[ ] No depende únicamente del color.

•

[ ] No agrega sombras excesivas.

•

[ ] No coloca todo dentro de tarjetas.

•

[ ] Reutiliza componentes existentes.

•

[ ] No contiene lógica de negocio dentro de la vista.

13

•

[ ] Lint y tests pasan correctamente.

23. Prompt base para tareas visuales

Usar este bloque al solicitar cambios visuales a Codex mediante OpenCode:

Lee primero docs/FRONTEND_BRAND_GUIDELINES.md y

docs/FRONTEND_ARCHITECTURE.md.

Implementa únicamente el alcance del issue actual.

La interfaz debe seguir una dirección cálida, familiar, precisa

y mobile-first.

Usa los tokens existentes y no introduzcas colores hexadecimales

dentro de componentes.

Mantén una sola acción primaria por pantalla, poco uso de sombras

y evita colocar todos los elementos dentro de cards.

Conserva los colores semánticos de proteína, carbohidratos,

grasas y fibra.

Incluye estados loading, empty, error, disabled y focus.

Reutiliza componentes existentes antes de crear nuevos.

Al finalizar:

- ejecuta lint y tests;

- enumera los archivos modificados;

- explica qué tokens y componentes reutilizaste;
- indica cómo probar el cambio en móvil y escritorio.

24. Resumen visual

Base visual: cálida y espaciosa

Fondo claro: blanco

Superficies claras: blanco y gris suave

Fondo oscuro: negro

Superficies oscuras: grises neutros

Primary: verde #2F7D5A

Bordes: grises cálidos

Sombras: mínimas

14

Tipografía: Inter

Radio: 10 px en controles, 14–16 px en cards

Acción principal: clara y dominante

Datos: precisos, legibles y sin decoración innecesaria

Tono: amable, directo y no culpabilizante

15
