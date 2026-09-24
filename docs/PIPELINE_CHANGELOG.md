# Pipeline Changelog

## v1.0.0 — 2026-09-24

Pipeline inicial de integración continua para TechBank Operations Center.

### Implementado

- **Instalación reproducible** con `npm ci` — garantiza builds deterministas a partir del lockfile.
- **Validación de formato** con Prettier (`npm run format:check`) — el pipeline falla si hay archivos sin formatear.
- **Lint** con ESLint (`npm run lint`) — el pipeline falla ante cualquier error de calidad de código.
- **Tests automatizados** con Vitest y Supertest (`npm run test`) — 14 tests: 11 de backend (API, salud, SPA fallback, semántica 404) y 3 de frontend (páginas críticas).
- **Build de aplicación** con TypeScript + Vite (`npm run build`) — compila backend y frontend.
- **Build de imagen Docker** (`docker build`) — imagen multi-stage Node.js 24 Alpine.
- **Ejecución del contenedor** — contenedor único sirve React (build estático) y API REST en el mismo puerto.
- **Validación de salud del contenedor** — espera activa con retry hasta que `/health` responde HTTP 200.
- **Smoke tests** — valida `/health`, `/ready`, `/api/version`, `/` (HTML), y semántica 404 de `/api/not-found`.

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
tests (14 tests)
  ↓
build
  ↓
Docker build (multi-stage, Node 24 Alpine)
  ↓
Docker run (contenedor único :3000)
  ↓
Smoke tests (health · ready · version · SPA · API 404)
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

### Deliberadamente excluido (próximas versiones)

Las siguientes capacidades están planificadas pero no implementadas en v1.0.0:

- **v1.1.0 (DevSecOps):** CodeQL · Gitleaks · Trivy · SBOM · Dependabot
- **v1.2.0 (Azure):** ACR · Container Apps · Bicep · OIDC · Managed Identity · RBAC
- **v1.3.0 (Observabilidad):** Application Insights · Log Analytics · Azure Monitor
- **v1.4.0 (Resiliencia):** k6 · autoscaling · canary deployment · rollback
