# Frontend Brand Guidelines — NutriHogar

Este documento define la identidad visual y las decisiones de presentación del frontend. Es normativo para pantallas, layouts, formularios, componentes y estilos. La navegación y los flujos se definen en `UX_UI_GUIDELINES.md`; las capas técnicas, en `FRONTEND_ARCHITECTURE.md`.

## 1. Dirección de marca

NutriHogar debe sentirse como un cuaderno familiar de nutrición: cálido, ordenado, tranquilo y preciso.

Debe transmitir confianza, claridad, cercanía, bienestar y control cotidiano. No debe parecer un sistema hospitalario, un ERP, una app infantil, una app de delivery, una experiencia de fitness extremo ni un contador culpabilizante de calorías.

Referencias de intención, sin copiarlas literalmente:

- Wise: claridad, jerarquía y composición espaciosa.
- Airbnb: interacción táctil y formularios móviles.
- Cal.com: organización limpia de información.
- Duolingo: solamente refuerzo positivo moderado.

## 2. Principios visuales

1. Una acción principal dominante por pantalla o sección.
2. Jerarquía mediante tipografía, espacio y alineación antes que contenedores.
3. Pocos niveles de profundidad y sombras mínimas.
4. Las tarjetas agrupan unidades independientes; no envuelven cada campo o fila.
5. Los formularios largos viven sobre la superficie de la página.
6. Los datos exactos son más importantes que la decoración.
7. Los colores semánticos conservan siempre su significado.
8. Ningún estado depende únicamente del color.
9. La interfaz informa sin juzgar.
10. El modo oscuro utiliza los mismos tokens semánticos, no estilos paralelos.

## 3. Tokens de color

Centralizar los tokens en `src/styles/tokens.css` o en el paquete existente de design tokens. No usar colores hexadecimales dentro de componentes salvo excepción documentada.

```css
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

  --color-primary: var(--color-primary-600);
  --color-primary-hover: var(--color-primary-700);
  --color-primary-soft: var(--color-primary-100);

  --color-canvas: #ffffff;
  --color-surface: #ffffff;
  --color-surface-subtle: #f6f7f5;
  --color-surface-muted: #e8ebe6;
  --color-surface-elevated: #ffffff;

  --color-text-primary: #1f2924;
  --color-text-secondary: #68736d;
  --color-text-disabled: #9aa39e;
  --color-text-inverse: #ffffff;

  --color-border: #dedcd4;
  --color-border-strong: #aaa99f;
  --color-focus-ring: #68a985;

  --color-success: #24744f;
  --color-success-soft: #dcefe5;
  --color-warning: #a96917;
  --color-warning-soft: #f8ead3;
  --color-danger: #b74741;
  --color-danger-soft: #f8dfdc;
  --color-info: #3f7294;
  --color-info-soft: #dfeaf2;
}
```

El verde principal identifica marca, acción primaria, selección y foco de navegación. El color de éxito es deliberadamente distinto para que “seleccionado” y “completado” no sean equivalentes.

No usar el primario como fondo dominante de la aplicación.

## 4. Colores nutricionales

```css
:root {
  --color-protein: #8e5d45;
  --color-protein-soft: #f1e3dc;
  --color-carbohydrates: #b87915;
  --color-carbohydrates-soft: #f7ecd6;
  --color-fat: #8d68a4;
  --color-fat-soft: #eee4f3;
  --color-fiber: #4f8b61;
  --color-fiber-soft: #e1eee5;
}
```

- Un nutriente conserva el mismo color en todas las pantallas.
- Estos colores no se reutilizan como decoración genérica.
- Mostrar siempre nombre, valor y unidad junto al color.
- Para comparaciones, añadir texto, patrón, icono o posición; nunca depender solo del tono.

## 5. Tipografía

Usar `Inter` con fallback del sistema. No agregar otra familia sin una necesidad aprobada.

```css
:root {
  --font-family-body: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-family-heading: var(--font-family-body);

  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

- Cuerpo: 400 o 500.
- Labels y navegación: 500 o 600.
- Títulos: 600; usar 700 solo para énfasis puntual.
- Valores numéricos: `font-variant-numeric: tabular-nums`.
- Evitar mayúsculas extensas, texto centrado largo y tamaños menores de 14 px para contenido esencial.
- Una pantalla no debe necesitar más de cuatro niveles tipográficos visibles.

## 6. Espaciado y densidad

```css
:root {
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
}
```

- Label a control: 8 px.
- Campos consecutivos: 20–24 px.
- Padding horizontal de página: 16 px en teléfono, 24 px en tablet, 24–32 px en escritorio.
- Padding de tarjeta: 16–20 px.
- Separación entre secciones principales: 32–48 px.
- Ancho máximo del shell privado: 72 rem.
- Formularios y lectura continua: máximo 36 rem.
- No estirar líneas de texto, formularios o gráficas para llenar pantallas anchas.
- Usar la variante compacta solo en listas densas y nunca reducir el área táctil.

## 7. Radios, bordes y sombras

```css
:root {
  --radius-sm: 0.5rem;
  --radius-md: 0.625rem;
  --radius-lg: 0.875rem;
  --radius-xl: 1rem;
  --radius-pill: 9999px;
  --shadow-sm: 0 1px 2px rgb(31 41 36 / 0.05);
  --shadow-md: 0 4px 12px rgb(31 41 36 / 0.08);
}
```

- Inputs y botones: `--radius-md`.
- Tarjetas: `--radius-lg` o `--radius-xl`.
- Chips: `--radius-pill`.
- Preferir borde o cambio de superficie antes que sombra.
- `--shadow-md` se reserva para menús flotantes, drawers y diálogos.
- No redondear tablas, layouts completos o cada fila de una lista.

## 8. Acciones y botones

- Altura visual mínima: 48 px para botones principales; área táctil mínima: 44 × 44 px.
- Primario: fondo primary, texto inverso, peso 600.
- Secundario: fondo transparente o surface, borde visible, texto primario.
- Terciario: texto o icono con área táctil completa; no debe competir con el primario.
- Destructivo: danger; reservado para acciones irreversibles o de descarte real.
- Incluir `hover`, `focus-visible`, `active`, `disabled` y `loading`.
- El estado loading conserva ancho y comunica progreso accesiblemente.
- Evitar filas de botones con el mismo peso. Si hay más de dos acciones, priorizar y mover las menos frecuentes a un menú accesible.
- Los botones de icono siempre tienen nombre accesible y tooltip en dispositivos con hover.

## 9. Formularios

- Altura mínima de inputs: 48 px.
- Label visible y asociado; el placeholder solo aporta ejemplo.
- Ayuda y error junto al campo y vinculados mediante atributos accesibles.
- Unidad visible dentro o inmediatamente junto al control.
- Usar `inputmode`, `autocomplete` y tipo de teclado adecuados.
- Errores no borran valores ni desplazan inesperadamente la acción principal.
- Agrupar por títulos y espacio, no mediante una tarjeta por grupo pequeño.
- Selectores con pocas opciones deben mostrar opciones visibles cuando sea más claro que un select.
- Campos numéricos no deben depender de steppers pequeños.
- Formularios largos usan secciones o pasos solo si reducen carga cognitiva; muestran progreso y permiten volver sin perder datos.

## 10. Tarjetas, listas y datos

Usar tarjetas para unidades independientes: resumen del día, comida planificada, alerta agrupada, preparación o bloque de progreso. No usarlas para cada campo, par label/valor, fila o sección.

Una lista operativa usa filas con:

1. Identificador principal.
2. Dato secundario necesario.
3. Estado textual, si aplica.
4. Una acción directa o acceso al detalle.

Los divisores y el espacio deben separar filas. No añadir botones pequeños múltiples al final de cada fila.

Las tablas se reservan para escritorio y comparaciones de columnas. En teléfono se transforman en lista estructurada sin perder campos esenciales.

## 11. Estados y feedback

- Carga: conservar estructura con skeleton cuando reduce saltos; evitar spinner de página completa si ya existe contenido.
- Vacío: explicar qué falta y ofrecer una acción útil cuando existe.
- Error recuperable: explicar qué ocurrió y permitir reintentar.
- Error definitivo: conservar contexto e indicar el siguiente paso.
- Éxito: breve, específico y sin bloquear el flujo.
- Offline: indicar qué información es local y qué acción queda pendiente.
- Sincronización: distinguir pendiente, enviando, sincronizado y conflicto.
- Disabled: acompañar con motivo cuando no sea evidente.

Los mensajes no deben ser “Algo salió mal” si se conoce una causa más útil.

## 12. Gráficos nutricionales y de salud

- Priorizar valor actual, referencia, diferencia y tendencia.
- Usar barras de progreso, líneas temporales y comparaciones semanales simples.
- Mostrar valores exactos aunque exista gráfico.
- Evitar gráficos 3D, donuts decorativos, doble eje y paletas extensas.
- No representar una meta como juicio moral.
- En móvil, el gráfico no requiere gestos precisos para conocer valores.
- Un tooltip nunca es la única fuente de información.
- Síntomas y asociaciones se presentan como patrones observados, no diagnósticos.

## 13. Iconografía e imágenes

- Usar una sola librería, preferentemente Lucide si ya está instalada.
- Tamaño habitual: 18–22 px; stroke consistente.
- No mezclar estilos filled y outline arbitrariamente.
- No usar emojis como iconografía principal.
- Una ilustración solo aporta orientación o calidez; no sustituye información ni ocupa el primer viewport sin motivo.
- La navegación utiliza únicamente `lucide-react`, con iconos lineales de aproximadamente 20 px y nombres centralizados junto con la configuración de destinos.

## 14. Tono de contenido

El tono es amable, directo, adulto, familiar y no médico.

Evitar: “Fallaste”, “Comiste mal”, “No cumpliste”.

Preferir:

- “Consumiste 210 kcal sobre la referencia de hoy”.
- “La proteína quedó 24 g por debajo del objetivo”.
- “El promedio semanal continúa dentro del rango previsto”.
- “Puedes ajustar las próximas comidas si lo consideras necesario”.

Nombrar botones por el resultado: “Guardar comida”, “Agregar a compras”, “Registrar peso”; no “Aceptar”.

## 15. Accesibilidad visual

- Contraste WCAG AA.
- Focus visible y no oculto por overlays.
- Nombres accesibles en controles.
- Errores vinculados al campo y resumen de errores en formularios largos.
- Estado comunicado con texto o icono además de color.
- Zoom de texto sin pérdida de información esencial.
- Respeto a `prefers-reduced-motion`.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 16. Movimiento

```css
:root {
  --duration-fast: 120ms;
  --duration-normal: 180ms;
  --duration-slow: 240ms;
}
```

Animar solo confirmación, aparición de superficies temporales, cambios de estado y progreso. No usar animaciones permanentes, rebotes, parallax ni transiciones que retrasen la acción.

## 17. Modo oscuro

La preferencia inicial sigue al sistema. El usuario puede elegir Sistema, Claro u Oscuro y la elección se persiste localmente.

```css
[data-theme="dark"] {
  --color-canvas: #000000;
  --color-surface: #111111;
  --color-surface-subtle: #171717;
  --color-surface-muted: #1d1d1d;
  --color-surface-elevated: #202020;
  --color-text-primary: #f5f5f5;
  --color-text-secondary: #b3b3b3;
  --color-text-disabled: #777777;
  --color-border: #343434;
  --color-border-strong: #565656;
}
```

El negro se reserva al canvas. El primario no se convierte en fondo dominante. Verificar contraste de colores nutricionales y semánticos en ambos temas.

## 18. Componentes base esperados

Consolidar solo cuando exista uso real:

- Layout: `AppShell`, `PageContainer`, `PageHeader`, `SectionHeader`.
- Acciones: `Button`, `IconButton`, `ActionMenu`.
- Formularios: `FormField`, `TextField`, `NumberField`, `Select`, `Textarea`, `Checkbox`, `RadioGroup`.
- Navegación: `BottomNavigation`, `NavigationRail`, `Sidebar`, `Tabs`.
- Feedback: `Alert`, `Toast`, `InlineMessage`, `Skeleton`, `EmptyState`, `ErrorState`, `OfflineStatus`.
- Superficies: `Dialog`, `BottomSheet`, `Drawer`.
- Producto: `MemberSelector`, `MacroProgress`, `NutritionSummary`, `FoodRow`, `QuantityInput`, `SyncStatus`.

No crear todos por adelantado. Los nombres describen responsabilidades y no obligan una API específica.

## 19. Patrones prohibidos

- Hexadecimales o spacing arbitrario en componentes.
- Gradientes decorativos por defecto.
- Glassmorphism, sombras intensas o tarjetas anidadas.
- Varias acciones primarias simultáneas.
- Métricas sin una decisión o tarea asociada.
- Iconos sin texto para acciones no universales.
- Texto gris de bajo contraste como información esencial.
- Estado expresado solo mediante rojo/verde.
- Gráficos sin valores exactos.
- Tono médico, punitivo o infantil.

## 20. Checklist visual de PR

- [ ] Usa tokens existentes y conserva colores nutricionales.
- [ ] Tiene una acción primaria clara.
- [ ] La jerarquía se entiende sin depender de tarjetas.
- [ ] Controles y acciones cumplen tamaño táctil.
- [ ] Labels, focus y errores son accesibles.
- [ ] Incluye estados aplicables y no depende solo del color.
- [ ] Números, unidades y formatos son consistentes.
- [ ] El modo oscuro usa tokens semánticos.
- [ ] No introduce variantes o componentes especulativos.
- [ ] Los pasos de validación manual quedaron en el PR.
