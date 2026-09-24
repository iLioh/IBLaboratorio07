# TechBank Operations Center

Aplicación full-stack académica para el **Laboratorio 07 de IT for Banking**. Presenta un centro interno de operaciones bancarias moderno, con datos 100 % sintéticos y trazabilidad de versión integrada en el pipeline CI/CD.

> **Alcance actual:** producto containerizado v1.0.0 con CI completo y trazabilidad de runtime (Quality Hardening / Runtime Traceability). No es una plataforma bancaria productiva, no procesa operaciones reales y no representa cumplimiento regulatorio.

## Implementado

### Fases 1–2: Aplicación local

- Frontend React + TypeScript + Vite, responsive y accesible.
- Dashboard operativo con KPIs, gráficas Recharts, transacciones y estado de servicios.
- Módulos Transactions, Risk, Services, Releases y Audit.
- Backend Node.js 24 + TypeScript + Express con API REST.
- Consumo real de API con loading, timeout, errores y modo offline visible.
- Datos sintéticos sin PII, clientes, cuentas ni tarjetas reales.
- Metadata separada para aplicación, commit, build, pipeline y entorno.
- TypeScript estricto, ESLint, Prettier, Vitest y Supertest.
- Base de repositorio compatible con Git Flow (`main`, `develop`, `feature/*`, `fix/*`).

### Fase 3: Containerización de producción

- **Docker multi-stage** (4 etapas: dependencies → builder → prod-deps → runtime).
- **Imagen Node.js 24 Alpine** — runtime mínimo sin herramientas de desarrollo.
- **Express sirve el build estático de React** — un solo contenedor, un solo puerto.
- **SPA fallback** — rutas como `/transactions`, `/risk`, `/services` devuelven `index.html`.
- **Semántica API correcta** — `/api/*` inexistente devuelve JSON 404, nunca HTML.
- **HEALTHCHECK** real usando `node` + `fetch` (sin dependencia de curl/wget).
- **Usuario no-root** — el contenedor corre como `node`.
- **`NODE_ENV=production`**, **`PORT=3000`**, escucha en `0.0.0.0`.

### Fase 4A & Quality Hardening: CI & Runtime Traceability

- **Fuente de verdad para versión:** El archivo `VERSION` es la fuente principal de `APP_VERSION`.
- **Trazabilidad real de imagen Docker:** Soporte explícito de `CONTAINER_IMAGE` (`not-built` en dev local, `techbank:local` en Docker local, y `techbank:${GITHUB_SHA}` inmutable en CI).
- **Entorno dinámico:** Adaptación de Release Center, Services y Dashboard según el entorno real (`local`, `container`, `ci`, `qa`).
- **Workflow:** `.github/workflows/ci-cd.yml` — nombre: _TechBank CI/CD_.
- **Triggers:** `push` y `pull_request` a `develop` y `main`.
- **Job `quality`:** `npm ci` → `format:check` → `lint` → `test` → `build`.
- **Job `docker`:** `docker build` → `docker run` → inspección de `HEALTHCHECK` (`healthy`) → smoke tests con validación estricta de metadata.
- **Smoke tests:** `/health`, `/ready`, `/api/version`, `/api/releases`, `/` (HTML), `/api/not-found` (404).
- **Permisos mínimos:** `contents: read` — sin Azure, sin secretos, sin registry push.

## Modos de operación

### DEVELOPMENT — modo local

```text
Browser :5173
    │
    │ Vite proxy (/api, /health, /ready)
    ▼
Express API :3000
    └── datasets TypeScript sintéticos
```

```bash
npm install
npm run dev
```

### PRODUCTION CONTAINER — modo Docker

```text
Browser
    ↓
Container :3000
    ↓
Express
    ├── sirve React (build estático Vite)
    ├── /api/* → API REST
    ├── /health → JSON liveness
    └── /ready  → JSON readiness
```

```bash
# Build
docker build -t techbank:local .

# Run (con metadata de trazabilidad)
docker run \
  --name techbank-local \
  -e APP_VERSION=v1.0.0 \
  -e GIT_SHA=local-docker \
  -e BUILD_TIME=local-build \
  -e PIPELINE_VERSION=v1.0.0 \
  -e APP_ENV=container \
  -e CONTAINER_IMAGE=techbank:local \
  -p 3000:3000 \
  techbank:local

# Verificar contenedor y salud
docker ps
docker inspect techbank-local --format "{{json .State.Health}}"
docker logs techbank-local

# Detener
docker stop techbank-local
docker rm techbank-local
```

## Stack

| Capa      | Tecnología                                                 |
| --------- | ---------------------------------------------------------- |
| Web       | React 19, TypeScript, Vite, React Router, Recharts, Lucide |
| API       | Node.js 24 LTS, TypeScript, Express 5                      |
| Tests     | Vitest, Testing Library, Supertest                         |
| Calidad   | ESLint, Prettier, TypeScript strict                        |
| Datos     | Archivos TypeScript, exclusivamente sintéticos             |
| Container | Docker multi-stage, Node.js 24 Alpine, usuario no-root     |
| CI        | GitHub Actions — pipeline v1.0.0                           |

## Estructura

```text
apps/
├── web/
│   └── src/{components,hooks,pages,services,types}/
└── api/
    ├── src/{config,data,middleware,routes}/
    └── tests/
docs/
├── architecture/
├── evidence/
└── PIPELINE_CHANGELOG.md
.github/
└── workflows/
    └── ci-cd.yml
Dockerfile
.dockerignore
.gitattributes
VERSION
```

## Requisitos

- Node.js 24 LTS
- npm 11 o compatible
- Git
- Docker 24+ (para modo container)

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abrir `http://localhost:5173`. La API escucha en `http://localhost:3000`.

En Windows con una política de PowerShell restrictiva, usar `npm.cmd` en lugar de `npm`.

## Variables de entorno

Copiar `.env.example` a `.env` únicamente si se desean cambiar los defaults locales:

| Variable           | Default        | Propósito                                          |
| ------------------ | -------------- | -------------------------------------------------- |
| `APP_VERSION`      | (de `VERSION`) | Versión de aplicación                              |
| `GIT_SHA`          | `local-dev`    | Commit del build                                   |
| `BUILD_TIME`       | `local-build`  | Fecha/hora del build                               |
| `PIPELINE_VERSION` | `v1.0.0`       | Versión del pipeline, separada de la app           |
| `APP_ENV`          | `local`        | Entorno visible (`local`, `container`, `ci`, `qa`) |
| `CONTAINER_IMAGE`  | `not-built`    | Nombre exacto de la imagen de contenedor           |
| `PORT`             | `3000`         | Puerto de la API                                   |

No se requieren ni deben agregarse secretos.

## API

| Método | Endpoint            | Descripción                        |
| ------ | ------------------- | ---------------------------------- |
| GET    | `/health`           | Liveness: `{ "status": "ok" }`     |
| GET    | `/ready`            | Readiness: `{ "status": "ready" }` |
| GET    | `/api/version`      | Metadata del build                 |
| GET    | `/api/transactions` | Operaciones sintéticas             |
| GET    | `/api/metrics`      | KPIs, series y alertas sintéticas  |
| GET    | `/api/releases`     | Metadata del release y contenedor  |

## Comandos

```bash
npm run dev          # web y API en paralelo
npm run lint         # lint completo
npm run test         # tests frontend y backend
npm run build        # compila ambos workspaces
npm run format:check # valida formato
```

## Estrategia de ramas

El flujo previsto es `feature/*` / `fix/*` → pull request → `develop` → pull request → `main`. El pipeline se activa automáticamente con `push` y `pull_request` hacia `develop` y `main`.

## Roadmap — pendiente para siguientes ejecuciones

### v1.1.0 — DevSecOps

- CodeQL · Gitleaks · Trivy · SBOM · Dependabot

### v1.2.0 — Azure

- Azure Container Registry · Azure Container Apps · Bicep
- OIDC · Microsoft Entra ID · Managed Identity · RBAC

### v1.3.0 — Observabilidad cloud

- Application Insights · Log Analytics · Azure Monitor

### v1.4.0 — Resiliencia y escala

- k6 · autoscaling · canary deployment · rollback

## Datos y limitaciones

Todos los IDs, importes, métricas, alertas y eventos son ficticios. No hay PII, datos de clientes, números de cuenta o tarjeta, conexión con un core bancario ni persistencia. El módulo Audit está etiquetado como **Academic / Demo activity log** y no es una auditoría regulatoria.

## Objetivo académico

Esta fase demuestra el ciclo Source → CI → Docker → Smoke Tests con trazabilidad real de contenedores y metadatos de runtime. Las fases posteriores añadirán seguridad DevSecOps, despliegue Azure y observabilidad cloud.
