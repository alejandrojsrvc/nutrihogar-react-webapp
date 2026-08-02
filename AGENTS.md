# AGENTS.md

Instrucciones para trabajar exclusivamente en `alejandrojsrvc/nutrihogar-react-webapp`.

## Producto y arquitectura

Cliente React, TypeScript y PWA, mobile-first, calido, simple y preciso.

- Organizar por features y respetar la direccion de dependencias documentada.
- Separar presentacion, aplicacion, dominio, esquemas y acceso a API.
- React no pertenece a dominio ni aplicacion.
- Consumir contratos OpenAPI generados mediante adaptadores; no duplicar DTO ni editar codigo generado.
- El backend es la fuente de verdad para autorizacion y calculos nutricionales definitivos.
- Usar TanStack Query para estado remoto y React Hook Form con Zod para formularios.
- Mantener estados de carga, vacio, error y exito requeridos.
- Evitar abstracciones o componentes genericos sin reutilizacion real.
- Mantener una accion primaria clara y no convertir la interfaz en un ERP, una app hospitalaria o un contador obsesivo.

## Fuente de verdad y contexto

1. Leer la issue completa:

```bash
gh issue view <numero> --repo alejandrojsrvc/nutrihogar-react-webapp
```

La salida ya presenta el cuerpo Markdown de la issue. No convertirla a JSON ni guardarla en un archivo temporal.

2. Inspeccionar feature, rutas, componentes y pruebas directamente relacionados.
3. Leer `doc/arquitecture.md` solo para decisiones arquitectonicas o modulos desconocidos.
4. Leer `doc/FRONTEND_BRAND_GUIDELINES.md` cuando exista trabajo visual.
5. Consultar el sprint o `../PDR.md` solo para aclarar dependencias o producto.

La issue define objetivo, alcance, criterios, pruebas y exclusiones. No ampliar el alcance.

## Busqueda de codigo

- Buscar siempre en el repositorio local mediante Glob y Grep.
- No usar `gh api search/code` para explorar codigo.
- GitHub se usa para leer issues y gestionar PRs, no para buscar implementaciones.
- Realizar como maximo dos busquedas dirigidas antes de leer los archivos relacionados.
- No consultar `git log`, `git show`, `git blame` ni commits anteriores salvo que la issue describa una regresion, cite un commit o requiera contexto historico.
- Si una capacidad no existe localmente, informar la dependencia en lugar de seguir buscando remotamente.

## Flujo rapido

### Inicio

```bash
git status --short
git branch --show-current
```

Preservar cambios ajenos. Si entran en conflicto directo, detenerse y consultar.

Con un arbol compatible:

```bash
git fetch origin main
git switch -c <tipo>/<issue-o-rango>-<slug> origin/main
```

Usar `feat`, `fix` o `chore`, en minusculas, ASCII y con guiones.

### Implementacion

- Presentar un plan de hasta cinco puntos y no pedir aprobacion si la issue es clara.
- Hacer el cambio minimo correcto.
- Crear o actualizar tests Vitest que verifiquen comportamiento observable, criterios de aceptacion, validaciones, estados y accesibilidad.
- Cubrir el camino correcto y errores relevantes; evitar tests triviales, snapshots sin valor, mocks excesivos o assertions que siempre pasan.
- No eliminar, omitir ni debilitar pruebas existentes para conseguir un resultado verde.
- Preservar valores de formularios y cubrir accesibilidad y responsive cuando aplique.
- Actualizar `.env.example` y README solo si cambia configuracion.
- No implementar dependencias o issues futuras de forma silenciosa.

## Comandos

Permitidos para validar:

```bash
npm run lint
```

Reglas:

- Ejecutar solamente lint local una vez, al terminar todo el pedido.
- Escribir los tests requeridos, pero no ejecutar tests frontend localmente.
- No ejecutar build localmente.
- GitHub Actions ejecuta lint, la suite Vitest completa y build en el PR.
- Si se necesita otro script, verificar primero `package.json`; no inventarlo.
- La instalacion de paquetes esta permitida solo si la issue la necesita.

Prohibido ejecutar:

- Build, `dev`, `preview` o procesos persistentes.
- Tests frontend locales; su ejecucion corresponde a GitHub Actions.
- Docker o Docker Compose.
- Generacion que necesite iniciar el backend.
- Despliegues u operaciones contra servicios compartidos.
- Comandos Git destructivos, force push, amend no solicitado o merge.

## Varias issues en un pedido

- Una rama y un PR para todo el pedido.
- Rama: `<tipo>/<primera>-<ultima>-<slug>`.
- Un solo commit convencional para todo el pedido.
- Una sola validacion al terminar todas las implementaciones.
- Un `Closes #<numero>` por cada issue completamente resuelta en el PR.

## Commit y PR

Al terminar, revisar el diff una sola vez para confirmar que solo contiene archivos del pedido. Preparar esos archivos, crear un unico commit convencional, hacer un solo push y abrir un solo PR.

No repetir `git status`, no consultar `git log` ni ejecutar revisiones redundantes salvo que exista un problema real de Git.

El PR contra `main` debe incluir resumen por issue, decisiones relevantes, resultado de lint local, tests y build marcados como pendientes en GitHub, pasos manuales en movil y escritorio, riesgos y todos los `Closes #N` aplicables.

Despues de abrirlo, devolver la URL y detenerse. No esperar GitHub Actions, hacer merge ni cerrar issues manualmente.

## Pruebas

- Crear o actualizar unicamente las pruebas necesarias para el comportamiento modificado y los criterios de aceptacion.
- Elegir el nivel minimo adecuado: dominio, aplicacion, infraestructura, componente o flujo.
- No duplicar el mismo comportamiento entre capas salvo que cada prueba compruebe un resultado diferente.
- Reservar `renderRoute` para comportamientos que dependan realmente de routing, autenticacion o providers.
- Despues de un render asincrono, usar `findBy*` o `waitFor`; no usar `getBy*` como mecanismo de espera.
- Probar resultados observables, accesibilidad, validaciones y estados relevantes; no detalles internos.
- El agente debe escribir las pruebas necesarias, pero no ejecutar Vitest ni build localmente.
- La verificacion completa de lint, tests y build corresponde a GitHub Actions.
- Dominio y utilidades: unitarias puras.
- Casos de uso y hooks: exito, error y transiciones relevantes.
- Componentes: comportamiento observable y accesibilidad.
- Formularios: validacion, envio, errores y cambios pendientes.
- Flujos: navegacion y estados exigidos por la issue.
- Probar resultados visibles para el usuario, no detalles internos de implementacion.
