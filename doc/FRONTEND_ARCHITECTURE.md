# Frontend Architecture — NutriHogar

Este documento define la arquitectura del frontend React/TypeScript/PWA de NutriHogar. Su objetivo es mantener reglas de negocio independientes de React y del cliente OpenAPI, permitir pruebas por capa y sostener módulos como comidas, recetas, inventario, planificación, salud, reportes, IA y notificaciones.

## 1. Principios

1. Organización principal por feature, no por tipo técnico global.
2. Dependencias dirigidas desde infraestructura y presentación hacia aplicación y dominio.
3. Dominio y aplicación no importan React, router, TanStack Query ni cliente OpenAPI.
4. El cliente OpenAPI generado es infraestructura y nunca se edita manualmente.
5. DTO remotos no se propagan a toda la UI; los adaptadores traducen contratos.
6. Backend es fuente de verdad para permisos, saldos y cálculos nutricionales definitivos.
7. Estado remoto, estado de formulario, estado de UI y estado offline se modelan por separado.
8. Las abstracciones se crean por reutilización real o frontera arquitectónica, no por anticipación.

## 2. Dirección de dependencias

```text
presentation ─┐
              ├──> application ───> domain
infrastructure┘          │
                         └──> ports (definidos por application/domain)
```

- `domain`: entidades, value objects, reglas puras y tipos de negocio.
- `application`: casos de uso, puertos y coordinación independiente del framework.
- `infrastructure`: implementaciones de gateways, OpenAPI, IndexedDB, storage y push.
- `presentation`: rutas, páginas, componentes, hooks de integración y formularios.

Está prohibido:

- `domain -> application|infrastructure|presentation`.
- `application -> infrastructure|presentation|React`.
- Componentes o páginas llamando directamente al cliente OpenAPI.
- Casos de uso importando hooks, JSX o APIs del navegador sin un puerto.
- Infraestructura decidiendo reglas visuales o de navegación.

## 3. Estructura recomendada

Adaptar nombres a la estructura existente; no hacer una migración masiva por este documento.

```text
src/
├── app/
│   ├── providers/
│   ├── router/
│   ├── shell/
│   └── query-client/
├── features/
│   └── <feature>/
│       ├── domain/
│       ├── application/
│       │   ├── ports/
│       │   └── use-cases/
│       ├── infrastructure/
│       │   ├── api/
│       │   └── persistence/
│       ├── presentation/
│       │   ├── components/
│       │   ├── forms/
│       │   ├── hooks/
│       │   └── routes/
│       ├── schemas/
│       └── index.ts
├── shared/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   ├── ui/
│   └── utils/
├── generated/
│   └── openapi/
└── styles/
    └── tokens.css
```

`shared` solo contiene capacidades verdaderamente transversales. Un componente usado una vez permanece en su feature.

## 4. Features del producto

Límites orientativos:

- `auth`: sesión, protección de rutas y logout.
- `households`: hogar activo, integrantes y permisos.
- `adult-profiles`: datos de adultos y preferencias.
- `nutrition-goals`: metas versionadas y revisiones.
- `food-catalog`: búsqueda, alimentos, porciones y equivalencias.
- `meal-tracking`: registro y resumen diario.
- `recipes`: recetas, preparaciones, porciones y sobrantes.
- `inventory`: existencias, movimientos, snapshot local y sincronización.
- `purchases`: compras y lista compartida.
- `meal-planning`: semana, comidas, participantes, disponibilidad y ejecución.
- `health-tracking`: peso, medidas y síntomas.
- `reports`: reportes nutricionales y operativos, exportación.
- `ai-recommendations`: propuestas asistidas, revisión y aplicación.
- `notifications`: recordatorios, push y centro de notificaciones.

Los límites reflejan capacidades del producto. No crear dependencia circular para reutilizar una vista; extraer solo el concepto transversal correcto o coordinar mediante aplicación.

## 5. Dominio

Puede contener:

- Entidades y value objects.
- Tipos de cantidades, unidades y estados.
- Reglas puras que no sean responsabilidad definitiva del backend.
- Errores de dominio y funciones deterministas.

No contiene:

- DTO de API.
- React, hooks, JSX o traducciones visuales.
- `fetch`, IndexedDB, localStorage o service worker.
- TanStack Query, Zod de formularios o router.
- Cálculos definitivos que el PDR asigna al backend.

## 6. Aplicación

Los casos de uso expresan intenciones: `RegisterMeal`, `CreatePurchase`, `AdjustInventory`, `GenerateWeeklyProposal`.

- Reciben datos de entrada propios, no eventos de React.
- Dependen de puertos (`InventoryRepository`, `WeeklyPlanGateway`, etc.).
- Devuelven resultados o errores tipados adecuados para la presentación.
- Coordinan reglas y gateways sin decidir toasts, rutas o estilos.
- Mantienen idempotencia o identificadores de operación cuando el flujo offline lo requiere.

No crear una clase de caso de uso si una función pura o una operación directa tras un gateway mantiene mejor la claridad.

## 7. Infraestructura y OpenAPI

- El código generado vive aislado y no se edita.
- Un adaptador por capacidad traduce DTO remoto a modelos de aplicación y viceversa.
- Autenticación, headers, base URL y tratamiento técnico común se configuran centralmente.
- Los componentes no conocen endpoints, códigos HTTP ni forma cruda de DTO.
- Los errores técnicos se traducen a errores de aplicación; conservar información diagnóstica sin exponerla al usuario.
- No aceptar como definitivo un cálculo nutricional o saldo producido solo en cliente.
- Los cambios de contrato requieren regenerar cliente mediante el flujo documentado, no duplicar tipos a mano.

## 8. Estado

### Estado remoto

TanStack Query administra caché, carga, error, invalidación y revalidación.

- Query keys centralizadas por feature y compuestas con hogar, adulto, fecha o filtros relevantes.
- Invalidar con precisión después de mutaciones.
- Evitar copiar respuestas remotas a estado local sin necesidad.
- `select` puede adaptar para lectura, pero no reemplaza un caso de uso o gateway.
- Conservar datos anteriores durante recarga cuando mejora continuidad y no induce a error.

### Estado de formulario

React Hook Form + Zod para captura y validación de interfaz.

- El esquema de formulario representa lo que el usuario introduce, no el DTO completo.
- Transformar a input de aplicación al enviar.
- Errores de servidor se asignan a campos o al formulario.
- Preservar valores ante error y bloquear doble envío.

### Estado de UI

Selección temporal, expansión, sheet abierto y filtros locales permanecen cerca de la vista. No llevar a store global lo que solo usa una ruta.

### Contexto persistente

Hogar activo, tema y preferencias explícitamente persistibles se centralizan. El adulto activo debe formar parte de la URL o del contexto cuando compartir/volver requiera reproducibilidad.

## 9. Offline e IndexedDB

El MVP permite consultar inventario y registrar operaciones compatibles offline.

- IndexedDB almacena snapshots versionados y cola de operaciones.
- La implementación concreta, por ejemplo Dexie, vive en infraestructura.
- Cada operación pendiente tiene identificador estable, fecha, hogar, payload, versión y estado.
- Estados: `pending`, `syncing`, `synced`, `conflict`, `failed`.
- La UI distingue snapshot local de dato confirmado.
- Reintentos son idempotentes y no duplican movimientos.
- Conflictos se exponen a aplicación/presentación; no se resuelven silenciosamente con “último en escribir”.
- La cola sobrevive a recarga y se procesa cuando el entorno lo permite.
- Service worker no contiene reglas de negocio.

## 10. Routing

- Separar rutas públicas y privadas.
- Proteger rutas en frontend para experiencia; backend sigue siendo autoridad.
- Cada feature exporta sus rutas o configuración mediante una frontera pública.
- Lazy load por ruta cuando aporta tamaño y no complica el flujo.
- Parámetros representan recursos estables; búsqueda, filtros, adulto y periodo deben ir en URL cuando el estado necesita ser restaurable o compartible.
- Acciones breves pueden usar estado de navegación; formularios importantes tienen ruta estable.
- Redirecciones conservan destino previsto después de autenticación cuando sea seguro.
- Las rutas provenientes de notificaciones se validan contra una allowlist.

## 11. Presentación

### Páginas/rutas

- Componen casos de uso, queries, layout y estados de página.
- No llaman OpenAPI.
- No contienen cálculos nutricionales definitivos.
- Deciden qué componente aparece, no implementan toda su lógica visual en un archivo monolítico.

### Componentes

- Presentacionales por defecto: props claras, callbacks de intención y estados visibles.
- Evitar componentes “universales” con decenas de flags.
- Preferir composición sobre variantes especulativas.
- Mantener acceso remoto fuera de componentes base de UI.

### Hooks

- Hooks de query/mutation adaptan TanStack Query a un caso de uso o gateway.
- Hooks de UI encapsulan comportamiento reutilizado que depende de React.
- No esconder flujos completos en hooks difíciles de probar o rastrear.

## 12. Sistema de diseño

- Tokens centralizados en `styles/tokens.css` o paquete existente.
- Componentes compartidos viven en `shared/ui` solo si tienen uso transversal.
- Componentes específicos, como una fila de ingrediente, viven en su feature.
- Variantes se limitan a diferencias semánticas reales (`primary`, `danger`, estados), no preferencias locales.
- Marca y UX/UI son fuentes normativas para apariencia y comportamiento responsive.

## 13. Errores y feedback

- Infraestructura captura el error técnico.
- Aplicación lo transforma a una categoría comprensible.
- Presentación elige mensaje, ubicación y acción según contexto.
- No mostrar stack traces, códigos internos ni mensajes crudos del backend.
- No convertir todos los errores en toast: errores de campo van al campo; errores de sección quedan en la sección; fallos globales usan feedback global.
- Errores offline y conflictos tienen tratamiento distinto a errores de red genéricos.

## 14. Autenticación y autorización

- La sesión se integra centralmente con el cliente API.
- Nunca incluir service-role keys ni secretos en frontend.
- Las variables expuestas al bundle se consideran públicas.
- Ocultar o deshabilitar acciones mejora UX, pero no sustituye autorización backend.
- Un cambio de hogar invalida o separa cachés dependientes.
- Evitar fuga de datos entre hogares por query keys incompletas o persistencia local sin namespace.

## 15. PWA y notificaciones

- Manifest, instalación y service worker pertenecen a infraestructura/app shell.
- Push subscription se maneja mediante gateway.
- Pedir permiso de notificaciones después de explicar el beneficio y por acción del usuario; no al cargar la app.
- iOS/PWA puede tener capacidades distintas; aplicar feature detection.
- Payloads de notificaciones no incluyen secretos ni datos sensibles innecesarios.
- Navegación desde push usa rutas permitidas y valida contexto.

## 16. IA

- No incluir SDK ni API key del proveedor en frontend.
- La IA es una capacidad backend detrás de contratos propios.
- El frontend representa propuestas, advertencias, validación y decisión humana.
- Una propuesta no modifica el plan hasta confirmación explícita.
- Feature flag desactivado conserva los flujos manuales.
- No recalcular ni “corregir” silenciosamente una propuesta en React.

## 17. Imports y API pública de features

- Importar desde el `index.ts` público de otra feature cuando exista.
- No importar archivos internos profundos de otra feature para eludir su frontera.
- Imports relativos dentro de la misma carpeta; alias consistentes entre features según configuración existente.
- Evitar barrels circulares.
- Dependencias compartidas se mueven a `shared` solo cuando su semántica es transversal.

## 18. Pruebas por capa

| Capa | Qué probar |
|---|---|
| Dominio | reglas y transformaciones puras |
| Aplicación | éxito, errores y coordinación de puertos |
| Infraestructura | mapeo DTO/modelo, errores, persistencia y sincronización |
| Hooks | transiciones observables e invalidación relevante |
| Componentes | interacción, accesibilidad y estados visibles |
| Formularios | validación, envío, error, persistencia y doble envío |
| Rutas/flujos | providers, autenticación, navegación y contexto |

- Mockear en la frontera del puerto, no cada función interna.
- No duplicar la misma expectativa entre capas.
- No probar clases CSS salvo que representen un resultado contractual indispensable.
- Las restricciones de ejecución local se definen en `AGENTS.md`.

## 19. Decisiones de implementación

Antes de agregar una abstracción, responder:

1. ¿Es una frontera de arquitectura o ya tiene dos usos reales?
2. ¿Reduce decisiones y duplicación o solo mueve complejidad?
3. ¿Su nombre pertenece al producto?
4. ¿Puede probarse sin React o infraestructura cuando corresponde?
5. ¿Respeta la dirección de dependencias?

Si la respuesta es no, mantener la implementación local y simple.

## 20. Checklist arquitectónico de PR

- [ ] El cambio vive en la feature correcta.
- [ ] Dominio y aplicación no importan React ni infraestructura.
- [ ] OpenAPI se consume únicamente mediante adaptadores.
- [ ] No se duplicaron DTO ni cálculos definitivos del backend.
- [ ] Query keys incluyen hogar/adulto/periodo cuando aplica.
- [ ] Formularios separan esquema de UI e input de aplicación.
- [ ] Offline diferencia local, pendiente, sincronizado y conflicto.
- [ ] No se creó estado global o abstracción sin necesidad.
- [ ] Rutas y notificaciones validan contexto y permisos.
- [ ] Las pruebas cubren la capa mínima adecuada.
