# TechBank Operations Center

Aplicación full-stack académica para el **Laboratorio 07 de IT for Banking**. Presenta un centro interno de operaciones bancarias moderno, con datos 100 % sintéticos y trazabilidad de versión integrada en el pipeline CI/CD.

> **Alcance actual:** producto containerizado v1.0.0 con CI/CD y trazabilidad de runtime. El pipeline v1.1.0 desplegó correctamente QA desde `develop` mediante OIDC. No es una plataforma bancaria productiva, no procesa operaciones reales y no representa cumplimiento regulatorio.

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

### Fase 3 QA (Pipeline v1.1.0): Despliegue automático a Azure, validado

- **Azure Container Registry (ACR):** `acrtechbanks7brazilsouth.azurecr.io` (Brazil South).
- **Imagen inmutable por SHA:** `acrtechbanks7brazilsouth.azurecr.io/techbank:<GITHUB_SHA>`.
- **Azure Container Apps:** `ca-techbank-s7-qa` está desplegada con ingress externo y escalado automático (min 1 / max 3 réplicas).
- **Deploy solo en `develop`:** Pull Requests solo corren Quality Gate + Docker validation. No despliegan a Azure.
- **Remote smoke tests:** pipeline valida `/health`, `/ready`, `/api/version` (environment=qa), `/api/releases` (releaseStatus=QA Environment) y `/` (HTML 200) contra la URL pública real.
- **`CONTAINER_IMAGE` trazable:** el endpoint `/api/releases` retorna exactamente la imagen ACR desplegada.

## Arquitectura QA

```
GitHub (feat/* → develop)
        ↓
GitHub Actions
        ↓
Quality Gate (npm ci · format · lint · tests · build)
        ↓
Docker Validation (build · run · healthcheck · smoke tests locales)
        ↓
ACR Push (acrtechbanks7brazilsouth.azurecr.io/techbank:<sha>)
        ↓
Azure Container Apps Deploy (ca-techbank-s7-qa)
        ↓
Remote Smoke Tests (/health · /ready · /api/version · /api/releases · /)
        ↓
QA público: https://ca-techbank-s7-qa.victoriousdesert-e29e6577.brazilsouth.azurecontainerapps.io
```

## Recursos Azure

| Recurso                    | Nombre                      | Región       |
| -------------------------- | --------------------------- | ------------ |
| Resource Group             | rg-techbank-brazilsouth     | Brazil South |
| Azure Container Registry   | acrtechbanks7brazilsouth    | Brazil South |
| Container Apps Environment | cae-techbank-s7-qa          | Brazil South |
| Container App              | ca-techbank-s7-qa (Running) | Brazil South |

> **Nota:** `eastus` y `centralus` fueron rechazados por política de la suscripción Azure for Students (UTP). Se utiliza `brazilsouth` autorizado por la política de la suscripción.

## GitHub Secrets requeridos

Los siguientes secrets deben configurarse en **GitHub → Repository Settings → Secrets and variables → Actions** para que el job `deploy-qa` funcione:

| Secret                  | Descripción                                                      |
| ----------------------- | ---------------------------------------------------------------- |
| `ACR_USERNAME`          | `acrtechbanks7brazilsouth` (usuario admin del ACR)               |
| `ACR_PASSWORD`          | Password del admin del ACR (Azure Portal → ACR → Access keys)    |
| `AZURE_CLIENT_ID`       | Client ID de la User Assigned Managed Identity de GitHub Actions |
| `AZURE_TENANT_ID`       | Tenant ID de Azure para la federación OIDC                       |
| `AZURE_SUBSCRIPTION_ID` | Subscription ID de Azure para el deployment QA                   |

Azure Login usa OIDC con un token temporal emitido por GitHub Actions; no se usa ni se almacena un client secret. Azure acepta únicamente el subject `repo:iLioh@108911528/IBLaboratorio07@1384369787:ref:refs/heads/develop` de `https://token.actions.githubusercontent.com`.

Ver `docs/evidence/qa/README.md` para la configuración y evidencias académicas.

## Trigger de despliegue

| Evento                      | Quality | Docker | ACR Push | Deploy QA |
| --------------------------- | ------- | ------ | -------- | --------- |
| Pull Request → develop/main | ✅      | ✅     | ❌       | ❌        |
| Push/merge a `develop`      | ✅      | ✅     | ✅       | ✅        |
| Push/merge a `main`         | ✅      | ✅     | ❌       | ❌        |

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

### PRODUCTION CONTAINER — modo Docker local

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
  -e PIPELINE_VERSION=v1.1.0 \
  -e APP_ENV=container \
  -e CONTAINER_IMAGE=techbank:local \
  -p 3000:3000 \
  techbank:local
```

### QA — Azure Container Apps

El pipeline v1.1.0 desplegó correctamente el commit `8f60360a51aac04dbf4425a6c7584a40bec274e8` con App v1.0.0. Los siguientes pushes a `develop` actualizan QA automáticamente después de Quality Gate y Docker smoke tests.

```
https://ca-techbank-s7-qa.victoriousdesert-e29e6577.brazilsouth.azurecontainerapps.io
```

Endpoints de validación:

- `GET /health` → `{"status":"ok"}`
- `GET /ready` → `{"status":"ready"}`
- `GET /api/version` → `{environment:"qa", pipelineVersion:"v1.1.0", ...}`
- `GET /api/releases` → `{releaseStatus:"QA Environment", containerImage:"<acr>/<image>:<sha>", ...}`

## Stack

| Capa      | Tecnología                                                 |
| --------- | ---------------------------------------------------------- |
| Web       | React 19, TypeScript, Vite, React Router, Recharts, Lucide |
| API       | Node.js 24 LTS, TypeScript, Express 5                      |
| Tests     | Vitest, Testing Library, Supertest                         |
| Calidad   | ESLint, Prettier, TypeScript strict                        |
| Datos     | Archivos TypeScript, exclusivamente sintéticos             |
| Container | Docker multi-stage, Node.js 24 Alpine, usuario no-root     |
| Registry  | Azure Container Registry (Brazil South)                    |
| Deploy    | Azure Container Apps QA (deployment validado)              |
| CI/CD     | GitHub Actions — pipeline v1.1.0                           |

## Estructura

```text
apps/
├── web/
│   └── src/{components,hooks,pages,services,types}/
└── api/
    ├── src/{config,data,middleware,routes}/
    └── tests/
docs/
├── evidence/
│   └── qa/
│       └── README.md   ← checklist de evidencias Azure
├── architecture/
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
- Azure CLI 2.x (para gestión de recursos)

## Variables de entorno

| Variable           | Default        | Propósito                                          |
| ------------------ | -------------- | -------------------------------------------------- |
| `APP_VERSION`      | (de `VERSION`) | Versión de aplicación                              |
| `GIT_SHA`          | `local-dev`    | Commit del build                                   |
| `BUILD_TIME`       | `<timestamp>`  | Fecha/hora del build                               |
| `PIPELINE_VERSION` | `v1.0.0`       | Versión del pipeline, separada de la app           |
| `APP_ENV`          | `local`        | Entorno visible (`local`, `container`, `ci`, `qa`) |
| `CONTAINER_IMAGE`  | `not-built`    | Nombre exacto de la imagen de contenedor           |
| `PORT`             | `3000`         | Puerto de la API                                   |

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

El deploy QA se activa únicamente en `push` a `develop`. El primer run QA ya finalizó en verde; los cinco secrets documentados continúan siendo necesarios para deploys posteriores.

## Datos y limitaciones

Todos los IDs, importes, métricas, alertas y eventos son ficticios. No hay PII, datos de clientes, números de cuenta o tarjeta, conexión con un core bancario ni persistencia. El módulo Audit está etiquetado como **Academic / Demo activity log** y no es una auditoría regulatoria.

## Objetivo académico

Esta fase demuestra el ciclo Source → CI → Docker → ACR → Azure Container Apps → Remote Smoke Tests con evidencia de un deployment QA exitoso. La evaluación de escalabilidad académica está documentada en `docs/scalability/scalability-report.md`.
