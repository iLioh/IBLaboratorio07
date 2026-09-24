# IT for Banking — Laboratorio 07
## Plan maestro end-to-end: TechBank DevSecOps Cloud Platform

> **Objetivo de este documento:** servir como guía de ejecución completa para construir, desplegar, demostrar, documentar y exponer el Laboratorio 07 de IT for Banking con un nivel superior al mínimo solicitado, sin desviarse del objetivo académico.
>
> **Caso:** TechBank  
> **Tema:** CI/CD, IaC, operaciones en la nube, DevSecOps, escalabilidad y resiliencia  
> **Cloud:** Microsoft Azure  
> **Repositorio propuesto:** `IBLaboratorio07`  
> **Aplicación demostrativa:** **TechBank Operations Center**  
> **Entorno obligatorio:** QA  
> **Fecha de referencia del plan:** septiembre de 2026

---

# 1. Qué pide exactamente el laboratorio

El laboratorio oficial exige implementar un pipeline CI/CD funcional basado en eventos de Git, automatizar el despliegue en un entorno de pruebas, controlar versiones del pipeline y evaluar la escalabilidad del sistema.

El caso establece que TechBank parte de cuatro problemas:

1. Despliegues manuales.
2. No existe integración continua.
3. No existe control sobre las versiones del pipeline.
4. El sistema no está preparado para escalar.

Las fases obligatorias son:

- **Fase 1:** configuración de repositorio y eventos de Git.
- **Fase 2:** configuración del pipeline CI/CD.
- **Fase 3:** automatización del despliegue en QA.
- **Fase 4:** gestión de versiones del pipeline.
- **Fase 5:** análisis de escalabilidad y capacidad.

Los entregables oficiales son:

1. Repositorio Git funcional.
2. Archivo CI/CD YAML operativo.
3. Evidencia de despliegue en QA.
4. Historial de versiones del pipeline.
5. Informe de escalabilidad de mínimo 1–2 páginas.

Este proyecto debe **cumplir literalmente esos cinco puntos** y, encima de ellos, agregar elementos de calidad, seguridad, observabilidad y demostración visual.

---

# 2. Qué vamos a construir

No se hará una API aislada sin interfaz.

Se construirá una aplicación web interna ficticia para TechBank llamada:

# TechBank Operations Center

Será un dashboard bancario moderno y visual para operaciones internas, basado únicamente en datos sintéticos.

La aplicación servirá para demostrar:

- cambios de código visibles;
- despliegues automáticos;
- versiones;
- commit SHA;
- entorno QA;
- estado de servicios;
- historial de releases;
- tráfico hacia revisiones;
- funcionamiento del pipeline;
- monitoreo;
- escalabilidad.

La aplicación será deliberadamente pequeña en lógica bancaria para no desviar el objetivo del laboratorio: **la pieza principal del laboratorio es el ciclo DevSecOps/Cloud, no la complejidad funcional del sistema bancario**.

---

# 3. Resultado final esperado

Al terminar deberá ser posible ejecutar esta demostración:

```text
Developer
   │
   │ crea feature/risk-alerts
   ▼
Commit → Push → Pull Request
                  │
                  ▼
          GitHub Actions
                  │
     ┌────────────┼────────────┐
     │            │            │
   Build        Tests       Security
     │            │            │
     └────────────┼────────────┘
                  ▼
            Docker Image
                  │
                  ▼
      Azure Container Registry
                  │
                  ▼
        Azure Container Apps
             QA revision
                  │
                  ▼
           Smoke Tests
                  │
                  ▼
       TechBank v1.1.0
                  │
                  ▼
           Canary 10 %
                  │
                  ▼
            k6 / Monitor
                  │
           ┌──────┴──────┐
           │             │
          OK            FAIL
           │             │
         100 %         rollback
```

La presentación debe poder mostrar un cambio real:

```text
ANTES
TechBank v1.0.0
No existe módulo "Risk Alerts"

DESPUÉS DEL PIPELINE
TechBank v1.1.0
Aparece módulo "Risk Alerts"

Environment: QA
Commit: f92aa71
Pipeline: v1.2.0
```

---

# 4. Principios de diseño

Se seguirán estas reglas durante todo el proyecto.

## 4.1 No sobrearquitecturar

No se agregará Kubernetes, Azure SQL, Service Bus, Redis, Front Door u otros servicios si no resuelven un requisito real del laboratorio.

## 4.2 Cada componente debe tener una razón demostrable

Ejemplos:

- GitHub Actions → automatización CI/CD.
- Docker → artefacto reproducible.
- ACR → registro privado.
- Azure Container Apps → QA, revisiones, tráfico y escalado.
- Bicep → infraestructura como código.
- OIDC → autenticación cloud sin credenciales Azure de larga duración.
- Managed Identity → acceso desde Container Apps a ACR.
- Application Insights → telemetría.
- Log Analytics → logs.
- k6 → prueba de capacidad.
- CodeQL/Gitleaks/Trivy → DevSecOps.

## 4.3 Todo debe ser demostrable

No basta con documentar que algo “podría hacerse”.

Siempre que el presupuesto y la suscripción lo permitan, debe existir evidencia real.

## 4.4 Los datos son sintéticos

No se usará PII, cuentas reales, tarjetas reales, nombres reales ni información bancaria sensible.

---

# 5. Stack tecnológico definitivo

| Área | Tecnología |
|---|---|
| Frontend | React + TypeScript + Vite |
| UI | CSS/Tailwind o CSS Modules |
| Gráficas | Recharts |
| Backend | Node.js 24 LTS + TypeScript + Express |
| API | REST |
| Tests | Vitest/Jest + Supertest |
| Lint | ESLint |
| Formato | Prettier |
| Versionamiento | Git + GitHub |
| Branching | main / develop / feature/* |
| CI/CD | GitHub Actions |
| Contenedores | Docker multi-stage |
| Registro | Azure Container Registry |
| Runtime | Azure Container Apps |
| IaC | Azure Bicep |
| CI → Azure | GitHub OIDC + Microsoft Entra ID |
| Runtime → ACR | Managed Identity + AcrPull |
| Observabilidad | Azure Monitor + Application Insights + Log Analytics |
| Seguridad código | GitHub CodeQL |
| Secret scanning | Gitleaks |
| Dependency scan | npm audit / Dependabot |
| Container scan | Trivy |
| SBOM | Syft o CycloneDX |
| Carga | k6 |
| Versionado | Semantic Versioning |
| Estrategia release | Canary + rollback |
| Entorno | QA |

---

# 6. Arquitectura objetivo

```text
┌──────────────────────────────────────────────────────────────┐
│                         DESARROLLADOR                        │
│ VS Code + Git + Node + Docker + Azure CLI                   │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              │ Git
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                            GITHUB                            │
│                                                              │
│ main                                                         │
│ develop                                                      │
│ feature/test                                                 │
│ feature/risk-alerts                                          │
│                                                              │
│ Pull Requests + Branch Protection + Tags                     │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              │ push / pull_request
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                     GITHUB ACTIONS                           │
│                                                              │
│ 1. Checkout                                                  │
│ 2. Install                                                   │
│ 3. Lint                                                      │
│ 4. Unit tests                                                │
│ 5. Build                                                     │
│ 6. CodeQL                                                    │
│ 7. Dependency scan                                           │
│ 8. Gitleaks                                                  │
│ 9. Docker build                                              │
│ 10. Trivy                                                    │
│ 11. SBOM                                                     │
│ 12. Bicep validate / what-if                                 │
│ 13. Azure login OIDC                                         │
│ 14. Push image                                               │
│ 15. Deploy QA                                                │
│ 16. Smoke tests                                              │
└─────────────┬───────────────────────────────┬────────────────┘
              │                               │
              │ OIDC                          │ image
              ▼                               ▼
┌────────────────────────┐       ┌─────────────────────────────┐
│ Microsoft Entra ID     │       │ Azure Container Registry    │
│ Workload Federation    │       │                             │
└────────────────────────┘       │ techbank:<git-sha>          │
                                 │ techbank:v1.x.x             │
                                 └──────────────┬──────────────┘
                                                │
                                                │ AcrPull
                                                ▼
                                ┌───────────────────────────────┐
                                │ Azure Container Apps         │
                                │                               │
                                │ TechBank QA                  │
                                │ revision 1                   │
                                │ revision 2                   │
                                │ HTTP ingress                 │
                                │ autoscaling                  │
                                │ health probes                │
                                └───────────────┬───────────────┘
                                                │
                 ┌──────────────────────────────┼──────────────────────────┐
                 │                              │                          │
                 ▼                              ▼                          ▼
        Application Insights              Log Analytics                   k6
        requests / failures              console/system                load test
        latency / traces                 HTTP logs                    p95/errors
```

---

# 7. Convenciones de nombres

Usar nombres consistentes desde el inicio.

## 7.1 Azure

```text
Resource Group
rg-techbank-s7-qa

Container Registry
acrtechbanks7<suffix>

Container Apps Environment
cae-techbank-s7-qa

Container App
ca-techbank-web-qa

Log Analytics
law-techbank-s7-qa

Application Insights
appi-techbank-s7-qa

Managed Identity
id-techbank-s7-qa
```

`<suffix>` será una combinación corta y única porque ACR exige un nombre globalmente único.

Ejemplo:

```text
acrtechbanks7ev26
```

## 7.2 Git

```text
main
develop
feature/test
feature/risk-alerts
feature/release-center
fix/health-endpoint
chore/pipeline-security
```

## 7.3 Docker

Nunca usar solamente `latest` como identificador de despliegue.

Usar:

```text
acrtechbanks7ev26.azurecr.io/techbank:<commit-sha>
```

Ejemplo:

```text
acrtechbanks7ev26.azurecr.io/techbank:f92aa718
```

Opcionalmente agregar tag semántico:

```text
techbank:v1.1.0
```

---

# 8. Estructura definitiva del repositorio

```text
IBLaboratorio07/
│
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Transactions.tsx
│   │   │   │   ├── Risk.tsx
│   │   │   │   ├── Services.tsx
│   │   │   │   ├── Releases.tsx
│   │   │   │   └── Audit.tsx
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── data/
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── api/
│       ├── src/
│       │   ├── routes/
│       │   │   ├── health.ts
│       │   │   ├── ready.ts
│       │   │   ├── version.ts
│       │   │   ├── transactions.ts
│       │   │   ├── metrics.ts
│       │   │   └── releases.ts
│       │   ├── middleware/
│       │   ├── config/
│       │   ├── app.ts
│       │   └── server.ts
│       ├── tests/
│       ├── package.json
│       └── tsconfig.json
│
├── infra/
│   ├── main.bicep
│   ├── modules/
│   │   ├── registry.bicep
│   │   ├── monitoring.bicep
│   │   ├── identity.bicep
│   │   ├── environment.bicep
│   │   └── container-app.bicep
│   └── parameters/
│       └── qa.bicepparam
│
├── load-tests/
│   ├── smoke.js
│   └── qa-load.js
│
├── scripts/
│   ├── smoke-test.sh
│   ├── verify-qa.sh
│   ├── canary.sh
│   ├── rollback.sh
│   └── destroy-qa.sh
│
├── docs/
│   ├── architecture/
│   │   ├── architecture.drawio
│   │   └── architecture.png
│   ├── evidence/
│   ├── scalability/
│   │   └── scalability-report.md
│   ├── demo/
│   │   └── demo-script.md
│   └── PIPELINE_CHANGELOG.md
│
├── .github/
│   ├── workflows/
│   │   └── ci-cd.yml
│   ├── pull_request_template.md
│   └── dependabot.yml
│
├── .gitleaks.toml
├── .dockerignore
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── README.md
└── VERSION
```

---

# 9. Fase 0 — Preflight antes de programar

Esta fase evita perder tiempo después.

## 9.1 Instalar herramientas

Comprobar:

```bash
git --version
node --version
npm --version
docker --version
az version
```

Además:

```bash
az bicep version
```

Si Bicep no está disponible:

```bash
az bicep install
```

Para k6:

```bash
k6 version
```

## 9.2 Login Azure

```bash
az login
```

Ver suscripciones:

```bash
az account list -o table
```

Seleccionar la correcta:

```bash
az account set --subscription "<SUBSCRIPTION_ID_O_NAME>"
```

Verificar:

```bash
az account show -o table
```

## 9.3 Revisar proveedores

```bash
az provider show -n Microsoft.App --query registrationState
az provider show -n Microsoft.ContainerRegistry --query registrationState
az provider show -n Microsoft.OperationalInsights --query registrationState
az provider show -n Microsoft.Insights --query registrationState
az provider show -n Microsoft.ManagedIdentity --query registrationState
```

Si alguno está disponible pero no registrado:

```bash
az provider register -n Microsoft.App
az provider register -n Microsoft.ContainerRegistry
az provider register -n Microsoft.OperationalInsights
az provider register -n Microsoft.Insights
az provider register -n Microsoft.ManagedIdentity
```

## 9.4 Preflight de región

Como las suscripciones académicas pueden tener restricciones de SKU o región, **no se debe asumir una región antes de comprobarla**.

Candidatas:

```text
eastus
eastus2
centralus
westus2
brazilsouth
```

Primero comprobar recursos permitidos y cuotas.

El parámetro de región debe quedar configurable en Bicep:

```bicep
param location string = resourceGroup().location
```

No hardcodear una región en múltiples archivos.

## 9.5 Crear repositorio

Nombre recomendado:

```text
IBLaboratorio07
```

Agregar README inicial y `.gitignore`.

---

# 10. Fase 1 — Git y estrategia de ramas

El laboratorio exige específicamente:

```text
main
develop
feature/test
```

Deben existir y utilizarse.

## 10.1 Crear `develop`

```bash
git checkout -b develop
git push -u origin develop
```

## 10.2 Crear `feature/test`

```bash
git checkout -b feature/test
git push -u origin feature/test
```

## 10.3 Flujo obligatorio

```text
feature/*
   │
   ├── commit
   ├── push
   │
   ▼
Pull Request
   │
   ▼
develop
   │
   ▼
QA deployment
```

Después:

```text
develop
   │
   ▼
Pull Request
   │
   ▼
main
```

## 10.4 Commits

Usar Conventional Commits.

Ejemplos:

```text
feat: add operations dashboard
feat: add release center
test: add health endpoint tests
ci: add docker security scan
ci: automate QA deployment
fix: correct readiness probe
docs: add scalability results
chore: configure dependabot
```

## 10.5 Branch protection

En GitHub → Settings → Rules / Branch protection:

Para `main`:

- Require a pull request before merging.
- Require status checks.
- No direct push.
- Require branch to be up to date cuando sea viable.
- Requerir `CI / quality`.
- Requerir `CI / security`.

Para `develop`:

- Require PR.
- Require CI.
- Permitir despliegue automático a QA tras merge.

---

# 11. Fase 2 — Construcción de la aplicación visual

# 11.1 Dashboard

Debe mostrar:

- Total procesado hoy.
- Operaciones.
- % aprobadas.
- Alertas de riesgo.
- Gráfica de volumen.
- Tabla de transacciones.
- Estado de servicios.
- versión actual.

Ejemplo:

```text
TechBank Operations Center                    QA ● Healthy

S/ 1.84 M        2,481          98.7 %         11
Procesado        Operaciones     Aprobadas      Alertas

[ Gráfica de volumen de operaciones ]

Transacciones recientes
TRX-5001 | Transferencia | S/ 900   | Aprobada
TRX-5002 | Pago           | S/ 80    | Aprobada
TRX-5003 | Transferencia | S/ 4,200 | Revisar

QA | app v1.1.0 | commit f92aa71 | pipeline v1.2.0
```

## 11.2 Transactions

Tabla con:

```text
transactionId
timestamp
type
amount
currency
channel
status
riskLevel
```

Todos sintéticos.

## 11.3 Risk

Esta será la feature ideal para la demo.

Versión inicial:

```text
Risk
Feature not enabled
```

Versión siguiente:

```text
Risk Alerts

HIGH      3
MEDIUM    8
LOW      42

Top alerts
...
```

## 11.4 Services

Mostrar:

```text
Frontend        Healthy
API             Healthy
Readiness       Ready
Environment     QA
Revision        techbank--000004
```

## 11.5 Releases

Esta pantalla es clave.

Mostrar:

```text
Environment
QA

App version
v1.1.0

Commit
f92aa71

Build
2026-09-23T18:42:00Z

Pipeline
v1.2.0

Container image
techbank:f92aa71
```

Opcional:

```text
Stable revision      90 %
Candidate revision   10 %
```

## 11.6 Audit

Datos de ejemplo:

```text
18:42 Deployment completed
18:41 Security gates passed
18:40 Image pushed to ACR
18:39 Tests passed
18:38 Pull request merged
```

No afirmar que son logs regulatorios reales. Es una representación académica de actividad.

---

# 12. Variables de build y trazabilidad

El frontend/backend debe mostrar metadatos generados por el pipeline.

Variables recomendadas:

```text
APP_VERSION
GIT_SHA
BUILD_TIME
PIPELINE_VERSION
APP_ENV
```

Ejemplo:

```text
APP_VERSION=v1.1.0
GIT_SHA=f92aa718
BUILD_TIME=2026-09-23T18:42:00Z
PIPELINE_VERSION=v1.2.0
APP_ENV=qa
```

El endpoint:

```text
GET /api/version
```

debe retornar:

```json
{
  "appVersion": "v1.1.0",
  "gitSha": "f92aa718",
  "buildTime": "2026-09-23T18:42:00Z",
  "pipelineVersion": "v1.2.0",
  "environment": "qa"
}
```

Esto convierte la trazabilidad en evidencia visual.

---

# 13. API mínima

Endpoints:

```text
GET /health
GET /ready
GET /api/version
GET /api/transactions
GET /api/metrics
GET /api/releases
```

## `/health`

Debe indicar que el proceso vive.

```json
{
  "status": "ok"
}
```

Código HTTP:

```text
200
```

## `/ready`

Debe indicar que la aplicación está lista para recibir tráfico.

```json
{
  "status": "ready"
}
```

## `/api/metrics`

Retornar datos sintéticos del dashboard.

---

# 14. Calidad de código

Antes de cloud, el proyecto debe pasar localmente.

Scripts raíz sugeridos:

```json
{
  "scripts": {
    "dev": "...",
    "lint": "...",
    "test": "...",
    "test:coverage": "...",
    "build": "...",
    "start": "..."
  }
}
```

Orden mínimo:

```bash
npm ci
npm run lint
npm run test
npm run build
```

No desplegar si cualquiera falla.

---

# 15. Tests mínimos

## Backend

Pruebas:

```text
GET /health returns 200
GET /health returns status ok
GET /ready returns 200
GET /api/version returns required fields
GET /api/transactions returns array
```

## Frontend

Pruebas:

```text
Dashboard renders
Version badge renders
Risk cards render
Service state renders
```

## Objetivo académico

No perseguir 100 % de coverage.

Meta razonable:

```text
>= 70 % en código crítico
```

Más importante que una cifra artificial:

- endpoints críticos probados;
- componentes críticos probados;
- pipeline falla si los tests fallan.

---

# 16. Docker

Se utilizará un **multi-stage build**.

Objetivo:

```text
Stage 1
Build React/API

Stage 2
Runtime mínimo
```

No copiar dependencias de desarrollo innecesarias al runtime.

## Dockerfile conceptual

```dockerfile
# build
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps ./apps

RUN npm ci
RUN npm run build

# runtime
FROM node:24-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/<runtime-artifacts> ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
```

El Dockerfile final dependerá de la estructura exacta elegida.

## Validación local

```bash
docker build -t techbank:local .
```

Ejecutar:

```bash
docker run --rm -p 3000:3000 techbank:local
```

Probar:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/version
```

Abrir:

```text
http://localhost:3000
```

No avanzar a Azure si esta etapa falla.

---

# 17. Pipeline CI/CD

Archivo oficial principal:

```text
.github/workflows/ci-cd.yml
```

## Eventos

PR hacia:

```text
develop
main
```

Push hacia:

```text
develop
main
```

La lógica:

```text
pull_request
   → validation only

push develop
   → validation + security + build + QA deploy

push main
   → validation + build + release artifact
```

No desplegar QA desde cualquier feature branch.

---

# 18. Jobs del pipeline

Orden recomendado:

```text
quality
  ↓
test
  ↓
security
  ↓
docker
  ↓
iac
  ↓
deploy-qa
  ↓
smoke
```

## Job `quality`

```text
checkout
setup node
npm ci
lint
build
```

## Job `test`

```text
unit tests
integration tests
coverage
```

## Job `security`

```text
CodeQL
dependency audit
Gitleaks
```

## Job `docker`

```text
docker build
Trivy image scan
generate SBOM
```

## Job `iac`

```text
bicep build
bicep lint
Azure what-if cuando exista autenticación
```

## Job `deploy-qa`

Solo:

```text
github.ref == refs/heads/develop
```

## Job `smoke`

Después del deploy:

```text
GET /health
GET /ready
GET /
```

---

# 19. Política de fallos del pipeline

El pipeline debe bloquear despliegue ante:

```text
lint failure
test failure
build failure
secret detected
high/critical container vulnerability no aceptada
Bicep invalid
deployment failure
health check failure
```

No ocultar fallos con:

```text
|| true
```

salvo herramientas informativas expresamente documentadas.

---

# 20. Demo controlada de DevSecOps

Crear una rama:

```text
demo/security-gate
```

Introducir **un secreto falso de laboratorio**, por ejemplo:

```text
FAKE_DEMO_SECRET_123456789
```

Configurar Gitleaks para detectarlo si fuera necesario.

Objetivo:

```text
Build            ✓
Tests            ✓
Secret scanning  ✗
Deploy           SKIPPED
```

Captura obligatoria.

Luego eliminarlo y mostrar:

```text
Secret scanning  ✓
```

Nunca usar una credencial real para esta demostración.

---

# 21. GitHub Environments

Crear:

```text
qa
```

En GitHub:

```text
Settings
→ Environments
→ New environment
→ qa
```

Opciones recomendadas:

- deployment branch: `develop`;
- protection rules si el plan/repositorio las permite;
- variables específicas del entorno.

Variables:

```text
AZURE_CLIENT_ID
AZURE_TENANT_ID
AZURE_SUBSCRIPTION_ID
AZURE_RESOURCE_GROUP
AZURE_CONTAINER_APP
AZURE_ACR_NAME
```

Los identificadores no secretos pueden almacenarse como variables.

No almacenar una contraseña permanente de service principal si usamos OIDC.

---

# 22. Autenticación GitHub → Azure con OIDC

Objetivo:

```text
GitHub Actions
    │
    │ OIDC JWT temporal
    ▼
Microsoft Entra ID
    │
    ▼
Azure access token temporal
```

Esto evita guardar `client secret` Azure de larga duración.

## 22.1 Crear aplicación / service principal

El nombre puede ser:

```text
sp-techbank-s7-github
```

Crear mediante CLI o Portal.

Guardar:

```text
client id
tenant id
subscription id
```

## 22.2 Federated Credential

Configurar la relación entre el repositorio GitHub y Microsoft Entra.

**Importante para septiembre de 2026:** GitHub modificó el `sub` OIDC por defecto para repositorios creados después del 15 de julio de 2026. Por eso no se debe copiar ciegamente una plantilla antigua de subject. Se debe verificar el claim vigente del repositorio y configurar la federación con la modalidad recomendada por GitHub/Entra.

Preferimos vincular el despliegue al entorno:

```text
qa
```

Así solo el workflow autorizado para QA puede obtener el token.

## 22.3 Permisos GitHub Actions

El workflow requiere:

```yaml
permissions:
  contents: read
  id-token: write
```

`id-token: write` permite solicitar un token OIDC; no significa por sí mismo permiso de escritura sobre Azure.

## 22.4 Login

Conceptualmente:

```yaml
- name: Azure login
  uses: azure/login@<pinned-version>
  with:
    client-id: ${{ vars.AZURE_CLIENT_ID }}
    tenant-id: ${{ vars.AZURE_TENANT_ID }}
    subscription-id: ${{ vars.AZURE_SUBSCRIPTION_ID }}
```

En el proyecto final se deben **pinnear versiones revisadas** de Actions.

---

# 23. RBAC de la identidad CI/CD

No asignar Owner salvo que sea estrictamente necesario.

El pipeline necesita como mínimo permisos para:

- leer estado;
- desplegar sobre el Resource Group del laboratorio;
- enviar imagen a ACR si el flujo lo hace mediante Azure;
- modificar Container App.

Mantener el scope limitado a:

```text
rg-techbank-s7-qa
```

No asignar permisos de toda la suscripción si no son necesarios.

Documentar cualquier excepción.

---

# 24. Infraestructura como Código con Bicep

## Recursos a crear

```text
Resource Group                bootstrap
Log Analytics Workspace       Bicep
Application Insights          Bicep
Azure Container Registry      Bicep
Managed Identity              Bicep
Container Apps Environment    Bicep
Container App                 Bicep
RBAC AcrPull                  Bicep
```

## Archivo `main.bicep`

Debe orquestar módulos.

```text
main.bicep
 ├── monitoring
 ├── registry
 ├── identity
 ├── environment
 └── container-app
```

## Parámetros

```text
location
environment
appName
acrName
containerImage
minReplicas
maxReplicas
```

## Outputs

```text
containerAppFqdn
acrLoginServer
containerAppName
```

---

# 25. Validación de Bicep

Local:

```bash
az bicep build --file infra/main.bicep
```

Luego:

```bash
az deployment group what-if \
  --resource-group rg-techbank-s7-qa \
  --template-file infra/main.bicep \
  --parameters infra/parameters/qa.bicepparam
```

`what-if` debe formar parte de la narrativa:

> Antes de modificar la infraestructura real, revisamos los cambios propuestos.

Esto permite demostrar gobernanza IaC.

---

# 26. Bootstrap del Resource Group

Puede crearse una única vez:

```bash
az group create \
  --name rg-techbank-s7-qa \
  --location <REGION_VALIDADA>
```

A partir de ese punto, la infraestructura de aplicación debe ser declarativa.

---

# 27. Azure Container Registry

## Configuración

SKU académico sugerido:

```text
Basic
```

si está permitido.

Admin user:

```text
disabled
```

No necesitamos credenciales administrativas permanentes.

Repositorio:

```text
techbank
```

Tags:

```text
<git-sha>
v1.0.0
v1.1.0
```

---

# 28. Managed Identity: Container Apps → ACR

La Container App debe usar Managed Identity para descargar la imagen desde ACR.

Flujo:

```text
Container App
    │
    │ Managed Identity
    ▼
Azure RBAC
    │
    │ AcrPull
    ▼
ACR
```

Rol:

```text
AcrPull
```

Scope:

```text
solo el ACR del laboratorio
```

No habilitar usuario/contraseña de ACR solo para resolver rápido el problema.

---

# 29. Azure Container Apps

Configuración objetivo:

```text
External HTTP ingress: enabled
Target port: 3000
Revision mode: multiple
Min replicas: 1 durante demo
Max replicas: 5
```

Después de la demo puede reducirse el mínimo para optimizar costo si la configuración y el objetivo lo permiten.

## Health

Configurar:

```text
liveness → /health
readiness → /ready
```

## Revisions

Cada cambio de imagen debe generar una nueva revisión.

Ejemplos:

```text
techbank--v100
techbank--v110
```

o sufijo basado en SHA corto.

---

# 30. Canary deployment

Container Apps soporta múltiples revisiones activas y reparto porcentual de tráfico.

Demo:

```text
stable     100 %
candidate    0 %
```

Luego:

```text
stable      90 %
candidate   10 %
```

Tras validación:

```text
stable       0 %
candidate  100 %
```

Si falla:

```text
stable     100 %
candidate    0 %
```

Esto es más valioso para la exposición que simplemente reemplazar el contenedor anterior.

---

# 31. Condiciones de promoción del canary

Antes de pasar de 10 % a 100 %:

```text
/health = 200
/ready = 200
smoke test = PASS
error rate < threshold académico
p95 < threshold académico
no critical security finding
```

Thresholds propuestos para la práctica:

```text
http_req_failed < 1 %
p95 < 500 ms
```

Estos valores son objetivos académicos definidos por el equipo para la prueba; no representan un SLA real de un banco.

---

# 32. Rollback

Debe existir script:

```text
scripts/rollback.sh
```

Lógica:

1. identificar revisión estable;
2. asignarle 100 % de tráfico;
3. quitar tráfico a candidate;
4. comprobar `/health`;
5. registrar evidencia.

La exposición debe explicar:

> El rollback no requiere reconstruir el release anterior; conservamos una revisión estable y redirigimos tráfico hacia ella.

---

# 33. Observabilidad

## Log Analytics

Recolectar:

- console logs;
- system logs;
- HTTP logs si se habilitan.

## Application Insights

Medir:

- requests;
- duration;
- failed requests;
- dependencies si aplica;
- availability;
- traces.

## Azure Monitor

Usar para:

- métricas;
- alertas;
- gráficas;
- réplicas;
- CPU/memoria cuando la métrica esté disponible para el recurso.

---

# 34. Instrumentación de aplicación

Agregar correlation/request id si es viable.

Log recomendado:

```json
{
  "level": "info",
  "requestId": "...",
  "method": "GET",
  "path": "/api/metrics",
  "status": 200,
  "durationMs": 23,
  "environment": "qa",
  "version": "v1.1.0"
}
```

No loggear:

- tokens;
- contraseñas;
- datos sensibles;
- información personal.

---

# 35. Escalabilidad

El laboratorio exige estudiar:

```text
CPU
Memoria
Latencia
```

Además se evaluará:

```text
throughput
error rate
p95
p99
réplicas
```

---

# 36. Escalabilidad vertical vs. horizontal

## Vertical

```text
1 réplica
0.5 CPU → 1 CPU
1 GiB → 2 GiB
```

Ventajas:

- simple.

Limitaciones:

- techo físico;
- puede requerir cambios de capacidad;
- no elimina el punto único de capacidad.

## Horizontal

```text
1 réplica → 2 → 3 → 5
```

Ventajas:

- elasticidad;
- reparto de tráfico;
- mejor adaptación a picos.

Para TechBank QA se demostrará horizontal.

---

# 37. Autoescalado

Configuración académica inicial:

```text
minReplicas = 1
maxReplicas = 5
```

Regla HTTP con concurrencia suficientemente baja para que la prueba pueda provocar scaling.

El valor exacto se debe calibrar tras una prueba inicial.

No usar un threshold tan alto que k6 nunca genere una réplica adicional.

---

# 38. Prueba k6

Archivo:

```text
load-tests/qa-load.js
```

Escenario sugerido:

```text
0 → 20 VUs      30 s
20 → 50 VUs     60 s
50 → 100 VUs    60 s
100 → 0         30 s
```

No iniciar con 1000 usuarios sin conocer la capacidad y límites de la suscripción.

Ejemplo conceptual:

```javascript
export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '60s', target: 50 },
    { duration: '60s', target: 100 },
    { duration: '30s', target: 0 }
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500']
  }
};
```

URL se pasa como variable:

```bash
k6 run -e BASE_URL=https://<qa-url> load-tests/qa-load.js
```

---

# 39. Evidencias de escalabilidad

Capturar antes:

```text
Replicas: 1
CPU: ...
Memory: ...
p95 baseline: ...
```

Durante:

```text
VUs: 50 / 100
Replicas: 2 / 3 / ...
CPU: ...
Memory: ...
p95: ...
```

Después:

```text
Replicas reduce
```

Las conclusiones deben basarse en mediciones reales.

No inventar números.

---

# 40. Gráficas del informe

Crear al menos:

## Gráfica 1

```text
VUs vs p95 latency
```

## Gráfica 2

```text
tiempo vs replicas
```

## Gráfica 3

Opcional:

```text
requests/s vs error rate
```

Cada gráfica debe incluir:

- título;
- unidad;
- periodo;
- interpretación de una o dos oraciones.

---

# 41. Versionado del pipeline

El requisito oficial incluye SemVer.

Crear:

```text
docs/PIPELINE_CHANGELOG.md
```

Ejemplo:

```md
# Pipeline Changelog

## v1.0.0
- CI inicial.
- Install, build y tests.
- Docker build.

## v1.1.0
- CodeQL.
- Gitleaks.
- Trivy.
- SBOM.

## v1.2.0
- Azure OIDC.
- Deploy QA.
- Smoke tests.

## v1.3.0
- Canary.
- Rollback.
- k6 validation.
```

Tags:

```text
pipeline-v1.0.0
pipeline-v1.1.0
pipeline-v1.2.0
```

---

# 42. Versionado de aplicación

Archivo:

```text
VERSION
```

Ejemplo:

```text
1.1.0
```

Tags:

```text
app-v1.0.0
app-v1.1.0
```

No mezclar:

```text
pipeline version
app version
```

En UI deben aparecer por separado.

---

# 43. Supply-chain security

## Imagen inmutable

Desplegar:

```text
techbank:<git-sha>
```

No:

```text
techbank:latest
```

## SBOM

Generar:

```text
artifacts/sbom.json
```

El SBOM permite responder:

> ¿Qué componentes forman exactamente este release?

## Trivy

Política inicial:

```text
CRITICAL → fail
HIGH → revisar / definir política
```

Si una imagen base genera falsos positivos o vulnerabilidades sin fix, documentar el hallazgo y la decisión; no ocultarlo.

---

# 44. Dependabot

Archivo:

```text
.github/dependabot.yml
```

Frecuencia académica:

```text
weekly
```

Ecosistemas:

```text
npm
github-actions
```

La finalidad es demostrar mantenimiento continuo.

---

# 45. Pull Request template

`.github/pull_request_template.md`

```md
## Change
Describe the change.

## Type
- [ ] Feature
- [ ] Fix
- [ ] CI/CD
- [ ] Infrastructure
- [ ] Documentation

## Validation
- [ ] Lint
- [ ] Tests
- [ ] Docker
- [ ] Security checks

## Risk
Describe potential impact.

## Evidence
Attach screenshot if applicable.
```

---

# 46. Release visible para la demo

La mejora ideal será:

```text
feature/risk-alerts
```

## v1.0.0

No muestra cards de riesgo.

## v1.1.0

Agrega:

```text
High risk
Medium risk
Low risk
```

Durante la exposición:

1. abrir QA v1.0.0;
2. mostrar PR;
3. ejecutar/mostrar pipeline;
4. desplegar;
5. refrescar navegador;
6. mostrar v1.1.0.

---

# 47. Estrategia para no depender de Internet durante la exposición

Tener evidencia preparada.

Guardar en:

```text
docs/evidence/
```

Capturas:

```text
01-branches.png
02-pr.png
03-ci-success.png
04-security-failure.png
05-acr.png
06-container-app.png
07-qa-v100.png
08-qa-v110.png
09-canary.png
10-k6.png
11-autoscale.png
12-appinsights.png
13-tags.png
```

Si Azure o GitHub falla durante la clase, se puede mostrar la ejecución grabada/capturada y explicar el flujo sin perder la presentación.

---

# 48. Informe de escalabilidad

Archivo:

```text
docs/scalability/scalability-report.md
```

Estructura:

## 1. Objetivo

Qué se evaluó.

## 2. Ambiente

```text
Azure Container Apps
QA
min/max replicas
CPU/memory
versión app
```

## 3. Metodología

Escenario k6.

## 4. Métricas

```text
CPU
memory
latency p95/p99
error rate
throughput
replicas
```

## 5. Resultados

Tabla real.

## 6. Análisis

Interpretación.

## 7. Escalabilidad vertical

Alternativa.

## 8. Escalabilidad horizontal

Implementación.

## 9. Resiliencia

Health, revisions, rollback.

## 10. Conclusiones

Basadas en datos.

---

# 49. Relación con conceptos de resiliencia

En el informe explicar:

## RTO

Tiempo máximo aceptable para recuperar servicio.

En este laboratorio se puede medir de manera aproximada durante rollback.

## RPO

Como esta demo no persiste transacciones reales, el RPO no se valida de forma equivalente a un sistema transaccional productivo.

Esto debe decirse claramente.

## MTTR

Podemos estimar cuánto demora recuperar la versión estable.

## MTBF

No se puede establecer un MTBF real con una prueba académica corta; solo explicar el concepto.

No inventar valores.

---

# 50. FinOps

Aplicar:

- SKU mínimo necesario;
- QA únicamente;
- autoscaling;
- borrar recursos al terminar;
- tags;
- revisar costo antes/después.

Tags:

```text
project=ITForBanking-S7
environment=QA
managedBy=Bicep
owner=team-techbank
course=ITForBanking
```

---

# 51. Plan de costos

Antes de desplegar:

```bash
az consumption budget ...
```

si la suscripción y permisos lo permiten.

Como mínimo:

- revisar Cost Management;
- documentar recursos;
- apagar/eliminar tras obtener evidencias.

No mantener recursos innecesarios hasta el final del mes.

---

# 52. Evidencias por fase

## Fase 1

- repositorio;
- ramas;
- commit;
- push;
- PR;
- merge.

## Fase 2

- `ci-cd.yml`;
- ejecución verde;
- ejecución roja controlada.

## Fase 3

- Docker local;
- Container App;
- URL QA;
- `/health`.

## Fase 4

- tags;
- changelog;
- PR que cambia pipeline.

## Fase 5

- k6;
- gráficas;
- métricas Azure;
- informe.

---

# 53. README profesional

Debe contener:

```text
1. Project overview
2. Problem statement
3. Architecture
4. Tech stack
5. Repository structure
6. Local setup
7. Branch strategy
8. CI/CD
9. DevSecOps controls
10. IaC
11. Azure deployment
12. QA
13. Versioning
14. Load testing
15. Observability
16. Evidence
17. Limitations
18. Cleanup
19. Academic disclaimer
```

---

# 54. Limitaciones que debemos reconocer

No presentar el laboratorio como plataforma bancaria productiva.

Indicar:

- datos sintéticos;
- un solo entorno cloud demostrativo;
- QA académico;
- sin core bancario real;
- sin PII;
- sin cumplimiento regulatorio certificado;
- thresholds de carga académicos;
- arquitectura enfocada en CI/CD y operaciones.

Esto demuestra criterio técnico.

---

# 55. Presentación — estructura propuesta

## Slide 1 — Portada

```text
TechBank
DevSecOps Cloud Platform

CI/CD + IaC + Autoscaling + Observability
Microsoft Azure
```

Visual: dashboard + arquitectura cloud.

## Slide 2 — Problema

```text
Manual deployments
No CI
No pipeline versioning
No scalability
```

## Slide 3 — Objetivo

Una sola frase:

> Automatizar de extremo a extremo la entrega de TechBank hacia QA con trazabilidad, controles DevSecOps y capacidad elástica.

## Slide 4 — Aplicación

Screenshot grande.

Poco texto.

## Slide 5 — Arquitectura

Diagrama.

## Slide 6 — Git Flow

```text
feature → PR → develop → QA
                    ↓
                   main
```

## Slide 7 — Pipeline

```text
BUILD → TEST → SECURITY → IMAGE → QA → VALIDATE
```

## Slide 8 — DevSecOps

Mostrar herramientas y gate rojo.

## Slide 9 — IaC

Bicep / what-if.

## Slide 10 — Release

v1.0.0 → v1.1.0.

## Slide 11 — Canary

90/10 → 100/0.

## Slide 12 — Escalabilidad

k6 + replicas + p95.

## Slide 13 — Observabilidad

Application Insights / Monitor.

## Slide 14 — Resultado

Antes vs. después.

## Slide 15 — Conclusiones

4 ideas cortas.

---

# 56. Demo en vivo — guion operativo

Duración ideal:

```text
4–6 minutos
```

## Paso 1

Abrir TechBank QA.

Decir:

> Actualmente tenemos la versión 1.0.0 desplegada en QA.

Mostrar:

```text
v1.0.0
commit
environment
```

## Paso 2

Mostrar GitHub:

```text
feature/risk-alerts
```

Explicar:

> El desarrollador no despliega manualmente. Propone un cambio mediante Pull Request.

## Paso 3

Abrir Actions.

Explicar:

```text
quality
tests
security
container
iac
deploy
```

## Paso 4

Mostrar security gate.

> Si falla seguridad, el despliegue no existe.

## Paso 5

Mostrar merge `develop`.

> El merge constituye el evento que dispara el despliegue de QA.

## Paso 6

Mostrar ACR.

> La imagen está identificada por el commit SHA; no dependemos de `latest`.

## Paso 7

Mostrar nueva revisión Container Apps.

## Paso 8

Refrescar TechBank.

Mostrar:

```text
v1.1.0
Risk Alerts
nuevo commit
```

## Paso 9

Mostrar traffic split.

```text
stable 90
candidate 10
```

## Paso 10

Mostrar k6 / Monitor.

> La carga incrementa y el runtime puede escalar horizontalmente dentro de los límites definidos.

## Cierre

> El resultado no es únicamente una aplicación desplegada. Es un ciclo de entrega reproducible, auditable, seguro y observable.

---

# 57. Lo que NO debemos hacer durante la demo

No:

- leer YAML línea por línea;
- explicar cada servicio Azure durante cinco minutos;
- abrir veinte pestañas sin orden;
- ejecutar un despliegue largo sin tener backup;
- improvisar el significado de una métrica;
- afirmar compliance real;
- inventar resultados de carga.

---

# 58. Definition of Done

No considerar terminado hasta cumplir:

## Aplicación

- [ ] Dashboard visual.
- [ ] Risk.
- [ ] Transactions.
- [ ] Services.
- [ ] Releases.
- [ ] Audit.
- [ ] `/health`.
- [ ] `/ready`.
- [ ] `/api/version`.

## Git

- [ ] `main`.
- [ ] `develop`.
- [ ] `feature/test`.
- [ ] PR real.
- [ ] merge real.
- [ ] Conventional Commits.

## CI

- [ ] lint.
- [ ] tests.
- [ ] build.
- [ ] Docker.

## Security

- [ ] CodeQL.
- [ ] dependency scan.
- [ ] Gitleaks.
- [ ] Trivy.
- [ ] SBOM.

## Azure

- [ ] Resource Group.
- [ ] ACR.
- [ ] Managed Identity.
- [ ] Log Analytics.
- [ ] Application Insights.
- [ ] Container Apps Environment.
- [ ] Container App.

## IaC

- [ ] Bicep.
- [ ] parameter file.
- [ ] outputs.
- [ ] what-if.

## CD

- [ ] OIDC.
- [ ] push ACR.
- [ ] deploy QA.
- [ ] smoke test.

## Release

- [ ] app SemVer.
- [ ] pipeline SemVer.
- [ ] changelog.
- [ ] Git tags.

## Advanced

- [ ] canary.
- [ ] rollback.
- [ ] k6.
- [ ] scaling evidence.

## Documentation

- [ ] README.
- [ ] architecture.
- [ ] evidence.
- [ ] scalability report.
- [ ] demo script.

## Presentation

- [ ] screenshots.
- [ ] slides.
- [ ] demo rehearsed.
- [ ] fallback screenshots/video.

---

# 59. Orden exacto recomendado para ejecutar el proyecto

No alterar este orden sin motivo.

```text
01. Preflight herramientas
02. Crear GitHub repo
03. Crear ramas obligatorias
04. Scaffold React
05. Scaffold Express
06. Dashboard v1
07. Endpoints health/ready/version
08. Tests
09. Lint
10. Docker local
11. PR feature/test
12. CI básico v1.0.0
13. Security gates v1.1.0
14. Bicep
15. Azure region preflight
16. Azure RG
17. Deploy IaC
18. ACR + identity
19. OIDC
20. CD QA v1.2.0
21. Smoke tests
22. Observability
23. Risk feature v1.1.0
24. Canary
25. Rollback
26. k6
27. Metrics
28. Scaling report
29. Screenshots
30. README
31. PPT
32. Rehearsal
33. Cleanup after evaluation
```

---

# 60. Roadmap de trabajo sugerido

## Bloque 1 — Producto

Objetivo:

```text
TechBank funciona localmente.
```

No cloud todavía.

## Bloque 2 — Container

Objetivo:

```text
docker run → TechBank visual.
```

## Bloque 3 — CI

Objetivo:

```text
PR → checks.
```

## Bloque 4 — IaC

Objetivo:

```text
Bicep reproduce QA.
```

## Bloque 5 — CD

Objetivo:

```text
merge develop → Azure.
```

## Bloque 6 — Observabilidad

Objetivo:

```text
vemos requests y logs.
```

## Bloque 7 — Escalabilidad

Objetivo:

```text
k6 → réplica adicional.
```

## Bloque 8 — Demo

Objetivo:

```text
feature visible → automated release.
```

---

# 61. Troubleshooting

## ACR no disponible en región

No cambiar toda la arquitectura inmediatamente.

Pasos:

1. verificar policy/error exacto;
2. probar región permitida;
3. mantener `location` parametrizado;
4. redeploy.

Plan alternativo académico si ACR estuviera bloqueado por política de la suscripción:

```text
GitHub Container Registry → Azure Container Apps
```

Solo utilizar este fallback si existe una restricción real y documentarla.

## Container App no descarga imagen

Revisar:

```text
Managed Identity
AcrPull
ACR scope
registry server
image tag
```

## OIDC falla

Revisar:

```text
client id
tenant id
subscription id
federated credential
repository/environment claims
id-token: write
GitHub environment
```

Especial cuidado con el formato de subject vigente en GitHub desde julio de 2026.

## Health falla

Probar dentro/local:

```bash
curl /health
```

Revisar:

```text
port
targetPort
host binding
probe path
```

Node debe escuchar en:

```text
0.0.0.0
```

no solamente `localhost`.

## k6 no provoca scaling

Revisar:

```text
autoscale threshold
test duration
concurrency
max replicas
metrics delay
```

Aumentar progresivamente, no de golpe.

---

# 62. Cleanup

Al finalizar el laboratorio y conservar evidencias:

```bash
az group delete \
  --name rg-techbank-s7-qa \
  --yes \
  --no-wait
```

Antes:

- guardar capturas;
- guardar resultados k6;
- guardar arquitectura;
- verificar README;
- comprobar que la evidencia no dependa del recurso vivo.

---

# 63. Checklist de auditoría final contra el laboratorio

| Requisito | Evidencia |
|---|---|
| Repositorio Git | URL GitHub |
| main | Branch |
| develop | Branch |
| feature/test | Branch |
| Commit | Git history |
| Push | GitHub history |
| PR | Pull Request |
| Merge | PR merged |
| Pipeline YAML | `.github/workflows/ci-cd.yml` |
| Evento automático | Actions run |
| Tests | CI job |
| Docker | CI + local |
| QA | Azure Container Apps |
| Navegador/curl | URL + screenshot |
| Health check | `/health` |
| Versionar YAML | Git history |
| SemVer | Tags |
| `feat:` / `fix:` | Commits |
| revisión por PR | GitHub PR |
| CPU | Azure metric |
| Memoria | Azure metric |
| Latencia | k6/App Insights |
| Vertical | análisis |
| Horizontal | ACA replicas |
| Balanceo | ingress/revisions |
| Autoscaling | scale rule |
| k6 | test report |
| Informe 1–2 páginas | PDF/MD |
| Trazabilidad avanzada | SHA/version UI |
| DevSecOps | Security gates |
| IaC | Bicep |
| Observabilidad | App Insights/Logs |
| Canary | traffic split |
| Rollback | evidencia |

Si una fila obligatoria no tiene evidencia, el laboratorio no está listo.

---

# 64. Auditoría técnica del diseño

Antes de darlo por finalizado, responder:

## Simplicidad

¿Existe algún servicio Azure que no aporta una evidencia o requisito?

Si sí:

```text
eliminarlo.
```

## Seguridad

¿Guardamos secretos permanentes Azure en GitHub?

Debe ser:

```text
NO
```

## Reproducibilidad

¿Podemos recrear QA desde Git + Bicep?

Debe ser:

```text
SÍ
```

## Trazabilidad

¿Podemos responder qué commit produjo la versión que vemos?

Debe ser:

```text
SÍ
```

## Rollback

¿Podemos volver a stable sin recompilar?

Ideal:

```text
SÍ
```

## Escalabilidad

¿Tenemos mediciones reales?

Debe ser:

```text
SÍ
```

## Presentación

¿Existe una diferencia visual clara entre v1.0.0 y v1.1.0?

Debe ser:

```text
SÍ
```

---

# 65. Qué hará que este laboratorio destaque

El diferencial no será “usar Azure”.

Será demostrar una cadena completa:

```text
IDEA
 ↓
CODE
 ↓
GIT
 ↓
PR
 ↓
QUALITY
 ↓
SECURITY
 ↓
BUILD
 ↓
CONTAINER
 ↓
REGISTRY
 ↓
QA
 ↓
OBSERVABILITY
 ↓
SCALABILITY
 ↓
CANARY
 ↓
ROLLBACK
```

Y poder responder en vivo:

```text
¿Qué versión corre?
¿Qué commit la generó?
¿Qué pipeline la desplegó?
¿Qué controles pasó?
¿Qué imagen Docker corresponde?
¿Qué revisión recibe tráfico?
¿Qué ocurre si falla?
¿Cómo escala?
¿Qué evidencias tenemos?
```

---

# 66. Resultado académico que buscamos

El laboratorio básico demostraría:

```text
"sé ejecutar GitHub Actions"
```

Nuestra entrega debe demostrar:

```text
"entiendo el ciclo de vida de software cloud para un entorno financiero:
automatización, seguridad, trazabilidad, infraestructura, despliegue,
observabilidad, capacidad, resiliencia y costo."
```

Sin afirmar que el laboratorio equivale a un entorno bancario productivo.

---

# 67. Referencias oficiales para implementación

## Material del curso

- `S7-Laboratorio.pdf` — Laboratorio oficial Semana 07.
- `S7-Teoria.pdf` — CI/CD, DevSecOps, IaC, automatización cloud, escalabilidad y resiliencia.

## GitHub

- OpenID Connect con Azure:
  https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-azure

## Microsoft Azure

- Azure Container Apps — revisions:
  https://learn.microsoft.com/en-us/azure/container-apps/revisions

- Azure Container Apps — traffic splitting:
  https://learn.microsoft.com/en-us/azure/container-apps/traffic-splitting

- Azure Container Apps — scaling:
  https://learn.microsoft.com/en-us/azure/container-apps/scale-app

- Container Apps — pull desde ACR con Managed Identity:
  https://learn.microsoft.com/en-us/azure/container-apps/managed-identity-image-pull

- Container Apps — GitHub Actions:
  https://learn.microsoft.com/en-us/azure/container-apps/github-actions

- Container Apps — Log Analytics:
  https://learn.microsoft.com/en-us/azure/container-apps/log-monitoring

- Azure Bicep what-if:
  https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-what-if

- Deploy Bicep con Azure CLI:
  https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-cli

---

# 68. Decisión final

La implementación definitiva será:

```text
TechBank Operations Center
         +
React / TypeScript
         +
Node.js / Express
         +
Docker
         +
GitHub / GitHub Actions
         +
DevSecOps gates
         +
Azure Bicep
         +
GitHub OIDC / Entra
         +
Azure Container Registry
         +
Managed Identity / RBAC
         +
Azure Container Apps
         +
Application Insights
         +
Log Analytics
         +
k6
         +
Canary / Rollback
```

La prioridad será siempre:

```text
1. cumplir el laboratorio;
2. tener evidencia real;
3. hacerlo visual;
4. poder explicarlo;
5. mantener una arquitectura defendible;
6. evitar tecnología innecesaria.
```

---

# 69. Regla de cierre del proyecto

**No presentar hasta poder ejecutar o mostrar evidencia de este flujo completo:**

```text
feature
  → PR
  → CI
  → security
  → Docker
  → ACR
  → QA
  → nueva versión visible
  → observabilidad
  → k6
  → autoscaling
  → canary / rollback
```

Cuando esa cadena funcione y exista evidencia de cada paso, el Laboratorio 07 estará realmente terminado.
