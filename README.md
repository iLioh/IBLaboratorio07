# TechBank Operations Center

Aplicación full-stack académica para el **Laboratorio 07 de IT for Banking**. Presenta un centro interno de operaciones bancarias moderno, con datos 100 % sintéticos y trazabilidad de versión preparada para las fases posteriores de CI/CD y cloud.

> **Alcance actual:** producto local v1.0.0. No es una plataforma bancaria productiva, no procesa operaciones reales y no representa cumplimiento regulatorio.

## Implementado ahora

- Frontend React + TypeScript + Vite, responsive y accesible.
- Dashboard operativo con KPIs, gráficas Recharts, transacciones y estado de servicios.
- Módulos Transactions, Risk, Services, Releases y Audit.
- Backend Node.js 24 + TypeScript + Express con API REST.
- Consumo real de API con loading, timeout, errores y modo offline visible.
- Datos sintéticos sin PII, clientes, cuentas ni tarjetas reales.
- Metadata separada para aplicación, commit, build, pipeline y entorno.
- TypeScript estricto, ESLint, Prettier, Vitest y Supertest.
- Base de repositorio compatible con Git Flow (`main`, `develop`, `feature/*`).

## Arquitectura local

```text
Browser :5173
    │
    │ Vite proxy (/api, /health, /ready)
    ▼
Express API :3000
    │
    └── datasets TypeScript sintéticos (sin base de datos)
```

El frontend nunca asume que la API está sana: `Services` consulta `/health` y `/ready`, y presenta `Offline/Degraded` cuando no hay respuesta.

## Stack

| Capa    | Tecnología                                                 |
| ------- | ---------------------------------------------------------- |
| Web     | React 19, TypeScript, Vite, React Router, Recharts, Lucide |
| API     | Node.js 24 LTS, TypeScript, Express                        |
| Tests   | Vitest, Testing Library, Supertest                         |
| Calidad | ESLint, Prettier, TypeScript strict                        |
| Datos   | Archivos TypeScript, exclusivamente sintéticos             |

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
└── evidence/
```

## Requisitos

- Node.js 24 LTS
- npm 11 o compatible
- Git

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abrir `http://localhost:5173`. La API escucha en `http://localhost:3000`.

En Windows con una política de PowerShell restrictiva, usar `npm.cmd` en lugar de `npm`.

## Variables de entorno

Copiar `.env.example` a `.env` únicamente si se desean cambiar los defaults locales:

| Variable           | Default       | Propósito                                |
| ------------------ | ------------- | ---------------------------------------- |
| `APP_VERSION`      | `v1.0.0`      | Versión de aplicación                    |
| `GIT_SHA`          | `local-dev`   | Commit del build                         |
| `BUILD_TIME`       | `local-build` | Fecha/hora del build                     |
| `PIPELINE_VERSION` | `v1.0.0`      | Versión del pipeline, separada de la app |
| `APP_ENV`          | `local`       | Entorno visible                          |
| `PORT`             | `3000`        | Puerto de la API                         |

No se requieren ni deben agregarse secretos.

## API

| Método | Endpoint            | Descripción                        |
| ------ | ------------------- | ---------------------------------- |
| GET    | `/health`           | Liveness: `{ "status": "ok" }`     |
| GET    | `/ready`            | Readiness: `{ "status": "ready" }` |
| GET    | `/api/version`      | Metadata del build                 |
| GET    | `/api/transactions` | Operaciones sintéticas             |
| GET    | `/api/metrics`      | KPIs, series y alertas sintéticas  |
| GET    | `/api/releases`     | Metadata del release local         |

## Comandos

```bash
npm run dev          # web y API en paralelo
npm run lint         # lint completo
npm run test         # tests frontend y backend
npm run build        # compila ambos workspaces
npm run format:check # valida formato
```

## Estrategia de ramas

El flujo previsto es `feature/* → pull request → develop → pull request → main`. En esta fase se preparan las ramas locales requeridas; los pushes, reglas de protección y PR reales se realizarán cuando se autorice trabajo remoto.

## Roadmap — no implementado todavía

Las siguientes capacidades pertenecen deliberadamente a ejecuciones posteriores:

- GitHub Actions y pipeline CI/CD.
- Docker e imágenes de contenedor.
- Azure, ACR, Container Apps y Bicep.
- OIDC, Microsoft Entra ID, Managed Identity y RBAC.
- CodeQL, Gitleaks, Trivy, SBOM y Dependabot.
- Application Insights, Log Analytics y observabilidad cloud.
- k6, autoscaling, canary deployment y rollback.
- Evidencias cloud, informe de escalabilidad y presentación final.

## Datos y limitaciones

Todos los IDs, importes, métricas, alertas y eventos son ficticios. No hay PII, datos de clientes, números de cuenta o tarjeta, conexión con un core bancario ni persistencia. El módulo Audit está etiquetado como **Academic / Demo activity log** y no es una auditoría regulatoria.

## Objetivo académico

Esta fase entrega una base visual y técnica defendible sobre la cual se demostrará, en etapas siguientes, el ciclo Git → CI/CD → seguridad → contenedor → QA → observabilidad → escalabilidad, sin afirmar que esas capacidades ya existen.
