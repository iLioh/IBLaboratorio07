# Pipeline Changelog

## v1.1.0 — 2026-09-24

Pipeline de despliegue automático QA para TechBank Operations Center. Esta versión está implementada como código y queda pendiente de su primera ejecución exitosa desde `develop` para producir evidencia de despliegue.

### Implementado

- **Azure Container Registry (ACR)** — imagen inmutable por SHA de commit: `acrtechbanks7brazilsouth.azurecr.io/techbank:<sha>`
- **Push automático a ACR** — solo en push/merge a `develop`, nunca en Pull Requests.
- **Deploy automático a Azure Container Apps** — el job crea el entorno QA público con ingress externo en `brazilsouth` durante el primer run y actualiza la imagen posteriormente.
- **Imagen trazable por SHA** — `CONTAINER_IMAGE` inyectada con el nombre exacto de la imagen desplegada.
- **Inyección de metadata de despliegue** — `APP_ENV=qa`, `PIPELINE_VERSION=v1.1.0`, `GIT_SHA`, `BUILD_TIME`, `APP_VERSION`.
- **Remote smoke tests** — validan `/health`, `/ready`, `/api/version` (environment=qa, pipelineVersion), `/api/releases` (releaseStatus=QA Environment), y `/` (HTTP 200) contra la URL real de Azure.
- **Comportamiento por rama:**
  - Pull Request → Quality Gate + Docker validation (sin deploy Azure)
  - Push a `develop` → Quality Gate + Docker validation + ACR push + Deploy QA + Remote smoke test
- **Autoscaling QA** — el workflow configura min 1 réplica y max 3 réplicas en la Container App.

### Arquitectura del pipeline v1.1.0

```
Source (develop)
  ↓
npm ci → format → lint → tests (16 tests) → build  [Quality Gate]
  ↓
Docker build → smoke tests locales                  [Docker Validation]
  ↓
ACR login → docker build → push <sha>               [ACR Push]
  ↓
az containerapp create/update                       [Deploy QA]
  ↓
Remote smoke: /health /ready /api/version /api/releases /  [Remote Validation]
```

### Recursos Azure

| Recurso            | Nombre                                        | Región       |
| ------------------ | --------------------------------------------- | ------------ |
| Resource Group     | rg-techbank-brazilsouth                       | Brazil South |
| Container Registry | acrtechbanks7brazilsouth                      | Brazil South |
| Container Apps Env | cae-techbank-s7-qa                            | Brazil South |
| Container App      | ca-techbank-s7-qa _(pendiente primer deploy)_ | Brazil South |

> **Nota:** `eastus` y `centralus` fueron rechazados por política de la suscripción Azure for Students (UTP).
> Se utilizó `brazilsouth` que sí fue autorizado por la política de la suscripción.

### Secrets requeridos en GitHub

| Secret              | Descripción                                                             |
| ------------------- | ----------------------------------------------------------------------- |
| `ACR_USERNAME`      | Usuario admin del ACR (obtenido de Azure Portal)                        |
| `ACR_PASSWORD`      | Password admin del ACR (obtenido de Azure Portal)                       |
| `AZURE_CREDENTIALS` | JSON de Service Principal con rol `Contributor` sobre el Resource Group |

Ver `docs/evidence/qa/README.md` para instrucciones de configuración.

### Versiones

| Concepto       | Versión       |
| -------------- | ------------- |
| Pipeline       | v1.1.0        |
| Aplicación     | v1.0.0        |
| Node.js        | 24 LTS        |
| GitHub Actions | ubuntu-latest |

### Permisos aplicados

- `contents: read` — mínimo privilegio.
- Sin OIDC en esta versión — la suscripción Azure for Students (UTP) no permite crear App Registrations ni federated credentials sin permisos de directorio. Se usa Service Principal con client secret en lugar de OIDC.
- **Próxima versión:** migrar a OIDC/federated credentials cuando se obtenga permiso de directorio del tenant.

### Deliberadamente excluido (próximas versiones)

- **v1.2.0 (DevSecOps):** CodeQL · Gitleaks · Trivy · SBOM · Dependabot · OIDC
- **v1.3.0 (Observabilidad):** Application Insights · Log Analytics · Azure Monitor
- **v1.4.0 (Resiliencia):** k6 · canary deployment · rollback · blue/green

---

## v1.0.0 — 2026-09-24

Pipeline inicial de integración continua para TechBank Operations Center.

### Implementado

- **Instalación reproducible** con `npm ci` — garantiza builds deterministas a partir del lockfile.
- **Validación de formato** con Prettier (`npm run format:check`) — el pipeline falla si hay archivos sin formatear.
- **Lint** con ESLint (`npm run lint`) — el pipeline falla ante cualquier error de calidad de código.
- **Tests automatizados** con Vitest y Supertest (`npm run test`) — 16 tests: 11 de backend y 5 de frontend.
- **Build de aplicación** con TypeScript + Vite (`npm run build`) — compila backend y frontend.
- **Build de imagen Docker** (`docker build`) — imagen multi-stage Node.js 24 Alpine.
- **Ejecución del contenedor** — contenedor único sirve React (build estático) y API REST en el mismo puerto.
- **Validación de salud del contenedor** — espera activa con retry hasta que `/health` responde HTTP 200.
- **Docker HEALTHCHECK** — verifica estado `healthy` oficial del contenedor antes de smoke tests.
- **Smoke tests** — valida `/health`, `/ready`, `/api/version`, `/api/releases`, `/` (HTML), y semántica 404 de `/api/not-found`.
- **Runtime traceability** — `APP_VERSION` leída de archivo `VERSION`, `CONTAINER_IMAGE` inyectada como env var.

### Arquitectura del pipeline

```
Source
  ↓
npm ci
  ↓
format:check
  ↓
lint
  ↓
tests (16 tests)
  ↓
build
  ↓
Docker build (multi-stage, Node 24 Alpine)
  ↓
Docker run (contenedor único :3000)
  ↓
Smoke tests (health · ready · version · releases · SPA · API 404)
```

### Versiones

| Concepto       | Versión       |
| -------------- | ------------- |
| Pipeline       | v1.0.0        |
| Aplicación     | v1.0.0        |
| Node.js        | 24 LTS        |
| GitHub Actions | ubuntu-latest |

### Permisos aplicados

- `contents: read` — mínimo privilegio necesario para checkout.
- Sin `id-token: write` — Azure/OIDC no aplica a esta fase.
