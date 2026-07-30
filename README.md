# NutriHogar Web

Cliente web responsive y PWA para la plataforma de control nutricional familiar.

## Requisitos

- Node.js 24 LTS (24.15 o superior).
- npm 10 o superior.

## Estructura

```text
nutrition-clients/
├── apps/
│   └── web/
└── packages/
    ├── api-client/
    ├── design-tokens/
    ├── domain/
    ├── nutrition-engine/
    └── schemas/
```

La aplicacion React vive en `apps/web`. Los paquetes reservan las fronteras para contratos de API, dominio compartible, esquemas, calculos nutricionales y tokens visuales.

## Configuracion

Instalar dependencias desde la raiz:

```bash
npm install
```

Crear la configuracion local de la aplicacion:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Variables disponibles:

| Variable       | Descripcion                                                                     |
| -------------- | ------------------------------------------------------------------------------- |
| `VITE_API_URL` | Origen de la API para el cliente web. El prefijo `/api` forma parte de las rutas OpenAPI. |
| `OPENAPI_URL`  | URL del documento JSON usado por `npm run api:generate`.                        |

## Comandos

```bash
# Iniciar desarrollo
npm run dev

# Ejecutar lint
npm run lint

# Ejecutar pruebas
npm run test

# Regenerar el cliente desde NestJS/OpenAPI
npm run api:generate

# Comprobar formato
npm run format:check

# Compilar para produccion
npm run build
```

`npm run api:generate` usa por defecto `http://localhost:3000/api/docs-json`. Puede recibir otro documento sin modificar archivos:

```bash
OPENAPI_URL=https://api.example.com/api/docs-json npm run api:generate
```

## Rutas iniciales

- `/login`: acceso publico provisional.
- `/onboarding`: recorrido privado provisional.
- `/app`: inicio privado vacio.
- Cualquier otra URL muestra la pagina 404.

Los layouts publico y privado estan separados. La autenticacion y la proteccion efectiva de rutas se incorporaran en su issue dedicada.

## Verificar la PWA

La instalacion PWA debe comprobarse sobre el resultado de produccion y en un navegador compatible:

1. Ejecutar `npm run build`.
2. Servir localmente `apps/web/dist` mediante un servidor HTTPS o `localhost`.
3. Abrir las herramientas del navegador y revisar el manifiesto y el service worker.
4. Usar la accion **Instalar NutriHogar** disponible en el navegador.

El manifiesto define nombre, colores, modo `standalone`, URL inicial e icono adaptable. El service worker se genera mediante `vite-plugin-pwa`.

## Pruebas manuales

1. Abrir `/login` y verificar la pantalla provisional.
2. Pulsar **Continuar** y comprobar el layout privado en `/onboarding`.
3. Abrir `/app` y verificar el estado vacio.
4. Abrir una URL inexistente y comprobar la pagina 404.
5. Repetir el recorrido a 320 px de ancho y en escritorio.
