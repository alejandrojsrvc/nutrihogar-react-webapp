# AGENTS.md

Instrucciones para cualquier agente que trabaje en `nutrihogar-react-webapp`.

## Proyecto

NutriHogar Web es el cliente React, TypeScript y PWA de una plataforma de control nutricional familiar. La experiencia es mobile-first y debe sentirse cálida, simple, cercana y precisa.

Repositorio: `alejandrojsrvc/nutrihogar-react-webapp`

## Fuentes de verdad

Antes de implementar una tarea, leer en este orden:

1. La issue completa en GitHub mediante `gh issue view`.
2. `doc/arquitecture.md`.
3. `doc/FRONTEND_BRAND_GUIDELINES.md`.
4. El código, rutas, componentes y pruebas de la feature afectada.
5. `PDR.md`, `BACKLOG.md` y el sprint correspondiente desde el directorio padre cuando sean necesarios para aclarar producto.
6. Las instrucciones más recientes del usuario.

La issue de GitHub define el alcance de implementación. No usar el sprint como sustituto de la issue.

## Flujo obligatorio por issue

### 1. Leer la issue

```bash
gh issue view <numero> --repo alejandrojsrvc/nutrihogar-react-webapp \
  --json number,title,body,labels,milestone,state,url
```

Extraer objetivo, alcance, criterios de aceptación, pruebas, dependencias y exclusiones. Confirmar que la issue esté abierta.

### 2. Revisar Git y actualizar local

Antes de cambiar ramas:

```bash
git status --short
git branch -vv
git remote -v
git log --oneline -10
```

No sobrescribir, revertir ni guardar en stash cambios ajenos. Si un cambio existente entra en conflicto directo con la tarea, detenerse y consultar al usuario.

Con el árbol limpio o sin conflictos:

```bash
git switch main
git pull --ff-only origin main
```

### 3. Crear rama

Crear una rama desde `main` actualizado:

```text
feat/<issue>-<descripcion-corta>
fix/<issue>-<descripcion-corta>
chore/<issue>-<descripcion-corta>
```

Usar minúsculas, ASCII y guiones.

### 4. Revisar arquitectura, diseño y planificar

Antes de editar:

- Identificar la feature y las capas afectadas.
- Revisar dependencias backend y frontend de la issue.
- Inspeccionar componentes, contratos y pruebas relacionados.
- Revisar las reglas visuales para las pantallas afectadas.
- Presentar un plan corto, asociado a los criterios de aceptación.
- Indicar explícitamente qué queda fuera de alcance.

No pedir aprobación del plan cuando la issue sea clara. Preguntar solo ante una decisión funcional, visual o arquitectónica ambigua.

### 5. Implementar solo el alcance solicitado

- No agregar funcionalidades de issues futuras.
- No resolver dependencias pendientes de forma silenciosa.
- Preferir el cambio mínimo correcto.
- Crear o actualizar las pruebas exigidas.
- Usar contratos generados desde OpenAPI; no duplicar manualmente respuestas de la API.
- No editar clientes generados manualmente.
- Actualizar `.env.example` y README cuando cambie la configuración.
- No añadir compatibilidad retroactiva sin una necesidad concreta.

### 6. Validar únicamente con lint y tests

Se permite ejecutar:

```bash
npm run lint
npm run test -- --runInBand
npm run test:e2e -- --runInBand
```

Adaptar los comandos a los scripts existentes. Se permiten pruebas unitarias, de integración y e2e que se ejecuten en proceso y terminen automáticamente.

No ejecutar:

- `npm run build` ni otros comandos de compilación.
- `npm run dev`, `start`, `preview` o servidores persistentes.
- Docker o Docker Compose.
- Generación que requiera iniciar el backend.
- Despliegues.
- Operaciones contra servicios o bases de datos compartidas.

La instalación de paquetes sí está permitida cuando sea necesaria para la issue.

Si lint o tests fallan, corregir los fallos causados por la tarea. No debilitar reglas ni eliminar pruebas para hacerlos pasar. Si permanece un bloqueo, no presentar la tarea como completada ni abrir un PR normal.

### 7. Revisar, crear commit y push

Antes del commit:

```bash
git status --short
git diff
git log --oneline -10
```

Preparar solo los archivos de la issue y verificar:

```bash
git diff --cached --check
git diff --cached --stat
```

Usar un commit convencional y conciso. No hacer amend salvo solicitud explícita. No usar force push.

### 8. Abrir PR contra main

Antes del PR:

```bash
git status --short
git branch -vv
git log --oneline --decorate -10
git diff main...HEAD --check
git diff main...HEAD --stat
```

Crear el PR con `gh pr create`, usando `main` como base. El cuerpo debe incluir:

- Resumen de cambios.
- Decisiones arquitectónicas o visuales relevantes.
- Lint y tests realmente ejecutados.
- Build y verificaciones manuales no ejecutadas.
- Instrucciones exactas para probar en escritorio y móvil.
- Riesgos o limitaciones conocidas.
- `Closes #<issue>` solo cuando todos los criterios estén cubiertos.

Después de abrir el PR, detenerse. Nunca hacer merge ni cerrar manualmente la issue.

## Reglas de arquitectura frontend

- Organizar el código por features y mantener la dirección de dependencias documentada.
- Separar presentación, estado, acceso a API, esquemas y lógica de dominio.
- No colocar cálculos nutricionales definitivos en componentes visuales.
- El backend es la fuente de verdad para calorías, nutrientes y autorización.
- Usar TanStack Query para estado remoto y caché.
- Usar React Hook Form y Zod para formularios cuando corresponda.
- Usar el cliente generado desde OpenAPI para contratos del backend.
- Mantener estados de carga, vacío, error y éxito requeridos por la issue.
- Evitar abstracciones y componentes genéricos sin reutilización real.

## Reglas de experiencia y marca

- Diseñar mobile-first y verificar también escritorio.
- Mantener una acción principal clara por pantalla.
- Usar tamaños táctiles adecuados y navegación comprensible.
- Evitar apariencia hospitalaria, fitness extrema, ERP, delivery o contador obsesivo de calorías.
- No encerrar todo en tarjetas ni abusar de sombras.
- Seguir colores, tipografía, espaciado y componentes definidos en `doc/FRONTEND_BRAND_GUIDELINES.md`.
- Preservar datos ingresados cuando el usuario abre selectores, drawers o vuelve a un formulario.
- Mostrar validaciones y errores en contexto.

## Pruebas

- Utilidades y dominio: pruebas unitarias puras.
- Hooks y estado: probar éxito, error y transiciones relevantes.
- Componentes: comportamiento observable y accesibilidad.
- Formularios: validaciones, envío, errores y cambios pendientes.
- Flujos: navegación y estados indicados por la issue.

## Entrega al usuario

La respuesta final debe incluir:

1. URL del PR.
2. Resumen de archivos o áreas modificadas.
3. Resultado de lint y tests.
4. Declaración explícita de que no se ejecutó build ni se inició la aplicación.
5. Comandos para instalar, compilar e iniciar.
6. Pasos manuales numerados para verificar en móvil y escritorio.
7. Riesgos o validaciones pendientes.
