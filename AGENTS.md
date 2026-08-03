# AGENTS.md

Instrucciones para trabajar exclusivamente en `alejandrojsrvc/nutrihogar-react-webapp`.

## Producto

NutriHogar es una PWA familiar para planificaciÃ³n nutricional, registro de comidas, recetas y preparaciones, inventario, compras, seguimiento corporal, sÃ­ntomas, reportes y recordatorios.

El frontend usa React y TypeScript. Debe sentirse cÃ¡lido, simple y preciso, sin parecer un ERP, una aplicaciÃ³n hospitalaria, una aplicaciÃ³n de fitness extremo ni un contador obsesivo de calorÃ­as.

## Documentos normativos

Leer Ãºnicamente lo necesario para el alcance actual, en este orden:

1. La issue completa.
2. Este `AGENTS.md`.
3. `docs/FRONTEND_ARCHITECTURE.md` si la tarea afecta estructura, datos, estado, rutas o un mÃ³dulo desconocido.
4. `docs/FRONTEND_BRAND_GUIDELINES.md` si afecta presentaciÃ³n visual o componentes.
5. `docs/UX_UI_GUIDELINES.md` si afecta navegaciÃ³n, organizaciÃ³n, responsive, formularios o un flujo de usuario.
6. El sprint o `../PDR.md` solo para aclarar reglas de producto o dependencias.

En caso de conflicto: la issue manda en alcance; el PDR y el sprint mandan en reglas del producto; arquitectura manda en dependencias; UX/UI manda en interacciÃ³n; marca manda en apariencia; este archivo manda en proceso y comandos.

## Fuente de verdad de la tarea

Leer la issue completa:

```bash
gh issue view <numero> --repo alejandrojsrvc/nutrihogar-react-webapp
```

La salida ya presenta el cuerpo Markdown. No convertirla a JSON ni guardarla en un archivo temporal.

DespuÃ©s:

1. Inspeccionar feature, rutas, componentes y pruebas directamente relacionados.
2. Identificar criterios de aceptaciÃ³n, exclusiones y dependencias explÃ­citas.
3. No ampliar el alcance ni implementar issues futuras silenciosamente.
4. Si falta una dependencia, informarla en vez de inventar una implementaciÃ³n.

## Arquitectura obligatoria

- Organizar por features y respetar la direcciÃ³n de dependencias documentada.
- Separar presentaciÃ³n, aplicaciÃ³n, dominio, esquemas y acceso a API.
- React pertenece solamente a presentaciÃ³n e integraciÃ³n de UI; no a dominio ni aplicaciÃ³n.
- Consumir contratos OpenAPI generados mediante adaptadores; no duplicar DTO ni editar cÃ³digo generado.
- No llamar el cliente OpenAPI desde pÃ¡ginas, componentes ni casos de uso.
- El backend es la fuente de verdad para autorizaciÃ³n, saldos, inventario y cÃ¡lculos nutricionales definitivos.
- Usar TanStack Query para estado remoto y React Hook Form con Zod para formularios.
- Mantener el estado local en el nivel mÃ¡s cercano que lo necesite.
- Evitar abstracciones, variantes o componentes genÃ©ricos sin reutilizaciÃ³n real.
- Mantener cambios offline como operaciones explÃ­citas y sincronizables; no simular confirmaciÃ³n del servidor.

## Reglas obligatorias de interfaz

Cuando una issue afecte interfaz:

- Aplicar `docs/FRONTEND_BRAND_GUIDELINES.md` y `docs/UX_UI_GUIDELINES.md`.
- DiseÃ±ar desde 360â€“390 px y definir adaptaciÃ³n para 768 px y 1440 px desde el cÃ³digo.
- Priorizar la tarea del usuario, no la cantidad de mÃ³dulos ni mÃ©tricas disponibles.
- Mantener una sola acciÃ³n primaria evidente por pantalla o secciÃ³n.
- Reutilizar tokens y componentes antes de crear estilos locales.
- No convertir cada secciÃ³n, fila o campo en una tarjeta.
- No introducir hexadecimales arbitrarios, sombras fuertes, gradientes decorativos o iconos innecesarios.
- Mantener controles tÃ¡ctiles de al menos 44 Ã— 44 px.
- No depender solo del color para comunicar estado, nutriente o prioridad.
- Usar lenguaje familiar, directo, no mÃ©dico y no culpabilizante.
- Considerar carga, vacÃ­o, error, Ã©xito, deshabilitado, offline, sincronizaciÃ³n pendiente y permisos cuando correspondan.
- No afirmar que la interfaz fue inspeccionada visualmente si no ocurriÃ³.

## Seguridad de ejecuciÃ³n

El agente no debe:

- Abrir, controlar ni automatizar navegadores.
- Iniciar `dev`, `preview`, servidores locales, puertos o procesos persistentes.
- Ejecutar tests frontend o build localmente.
- Ejecutar Docker o Docker Compose.
- Generar cÃ³digo que necesite iniciar el backend.
- Desplegar ni operar servicios compartidos.
- Ejecutar comandos fuera de los expresamente autorizados en este archivo.

Para cambios visuales, revisar responsive, jerarquÃ­a, estados y accesibilidad desde el cÃ³digo; escribir las pruebas necesarias sin ejecutarlas; incluir pasos manuales concretos en el PR; y marcar la inspecciÃ³n visual como pendiente.

## BÃºsqueda de cÃ³digo

- Buscar en el repositorio local con `rg` y `rg --files`, o herramientas equivalentes.
- Realizar como mÃ¡ximo dos bÃºsquedas dirigidas antes de leer los archivos relacionados.
- No usar `gh api search/code` para explorar implementaciones.
- GitHub se usa para issues y PRs, no para buscar cÃ³digo local.
- No consultar `git log`, `git show`, `git blame` ni commits anteriores salvo regresiÃ³n explÃ­cita o referencia histÃ³rica necesaria.
- Si una capacidad no existe localmente, detener la bÃºsqueda y declarar la dependencia.

## Inicio de trabajo

Ejecutar una sola vez:

```bash
git status --short
git branch --show-current
```

Preservar cambios ajenos. Si entran en conflicto directo con el alcance, detenerse y consultar.

Con un Ã¡rbol compatible:

```bash
git fetch origin main
git switch -c <tipo>/<issue-o-rango>-<slug> origin/main
```

Usar `feat`, `fix` o `chore`; minÃºsculas, ASCII y guiones.

## ImplementaciÃ³n

- Presentar un plan de hasta cinco puntos y no pedir aprobaciÃ³n si la issue es clara.
- Hacer el cambio mÃ­nimo correcto y completo.
- Preservar contratos y comportamiento ajenos al pedido.
- Antes de crear un componente, hook, esquema o adaptador, buscar uno equivalente.
- No extraer una abstracciÃ³n por anticipaciÃ³n; hacerlo por reutilizaciÃ³n real o consistencia necesaria.
- Preservar valores de formularios frente a errores de validaciÃ³n, red u offline.
- No ocultar funcionalidad esencial segÃºn el breakpoint.
- Actualizar `.env.example` y README solo cuando cambie configuraciÃ³n o uso pÃºblico.

## Pruebas

- Crear o actualizar Ãºnicamente pruebas necesarias para el comportamiento modificado.
- Elegir el nivel mÃ­nimo adecuado: dominio, aplicaciÃ³n, infraestructura, componente o flujo.
- Probar resultados observables, criterios de aceptaciÃ³n, validaciones, accesibilidad y estados relevantes.
- No probar detalles internos ni duplicar un comportamiento entre capas sin un resultado distinto.
- No eliminar, omitir ni debilitar pruebas para obtener verde.
- Evitar snapshots sin valor, mocks excesivos y assertions triviales.
- Reservar `renderRoute` para routing, autenticaciÃ³n o providers reales.
- Tras un render asÃ­ncrono, usar `findBy*` o `waitFor`; no `getBy*` como espera.
- Dominio y utilidades: pruebas unitarias puras.
- Casos de uso y hooks: Ã©xito, error y transiciones relevantes.
- Componentes: comportamiento visible, teclado y nombres accesibles.
- Formularios: validaciÃ³n, envÃ­o, error, doble envÃ­o y cambios pendientes.
- Flujos: navegaciÃ³n y estados exigidos por la issue.
- Escribir las pruebas, pero no ejecutar Vitest ni build localmente.

## ValidaciÃ³n autorizada

El Ãºnico comando local autorizado para validar es:

```bash
npm run lint
```

Ejecutarlo una sola vez al terminar todo el pedido. Si se necesita otro script, no ejecutarlo: verificar `package.json` y declararlo pendiente. GitHub Actions ejecuta lint, Vitest y build en el PR.

## Varias issues

- Una rama y un PR para todo el pedido.
- Rama: `<tipo>/<primera>-<ultima>-<slug>`.
- Un solo commit convencional.
- Una sola validaciÃ³n local al finalizar todas las implementaciones.
- Un `Closes #<numero>` por cada issue completamente resuelta.

## Commit y PR

Al terminar:

1. Revisar el diff una sola vez para confirmar que contiene Ãºnicamente archivos del pedido.
2. Preparar esos archivos.
3. Crear un Ãºnico commit convencional.
4. Hacer un solo push.
5. Abrir un Ãºnico PR contra `main`.

No repetir `git status`, consultar historial ni ejecutar revisiones redundantes sin un problema concreto. No usar comandos destructivos, force push, amend no solicitado o merge.

El PR debe incluir:

- Resumen por issue.
- Decisiones relevantes.
- Resultado del Ãºnico lint local.
- Tests y build pendientes en GitHub Actions.
- Pasos manuales en 390 px, 768 px y 1440 px cuando haya UI.
- Estados y escenarios que deben revisarse manualmente.
- Riesgos o limitaciones.
- Todos los `Closes #N` aplicables.

DespuÃ©s de abrirlo, devolver la URL y detenerse. No esperar GitHub Actions, hacer merge ni cerrar issues manualmente.

## DefiniciÃ³n de terminado

Una tarea estÃ¡ lista cuando:

- Cumple cada criterio de aceptaciÃ³n dentro del alcance.
- Respeta arquitectura, marca y UX/UI aplicables.
- Contiene las pruebas necesarias, aunque su ejecuciÃ³n quede para CI.
- `npm run lint` se ejecutÃ³ una sola vez y su resultado se informÃ³.
- El diff no contiene cambios ajenos.
- El PR declara con honestidad quÃ© se verificÃ³ y quÃ© quedÃ³ pendiente.
