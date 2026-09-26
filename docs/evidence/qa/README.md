# QA Deployment Evidence

## Checklist de evidencias para el Laboratorio 07 — Fase 3

El alumno debe capturar las siguientes pantallas / evidencias reales después de que el pipeline de GitHub Actions haya desplegado exitosamente en Azure.

---

## Recursos Azure creados

| #   | Recurso                    | Nombre                   | Región       | Estado     |
| --- | -------------------------- | ------------------------ | ------------ | ---------- |
| 1   | Resource Group             | rg-techbank-brazilsouth  | Brazil South | ✅ Creado  |
| 2   | Azure Container Registry   | acrtechbanks7brazilsouth | Brazil South | ✅ Creado  |
| 3   | Container Apps Environment | cae-techbank-s7-qa       | Brazil South | ✅ Creado  |
| 4   | Container App              | ca-techbank-s7-qa        | Brazil South | ✅ Running |

El deployment QA fue validado por GitHub Actions run #14 con App v1.0.0, Pipeline v1.1.0 y commit `8f60360a51aac04dbf4425a6c7584a40bec274e8`.

---

## Capturas requeridas

### 1. Resource Group

- **Ruta:** Azure Portal → Resource Groups → `rg-techbank-brazilsouth`
- **Mostrar:** lista de recursos dentro del grupo (ACR, CAE, Container App)
- **Archivo sugerido:** `01-resource-group.png`

### 2. Azure Container Registry

- **Ruta:** Azure Portal → Container Registries → `acrtechbanks7brazilsouth`
- **Mostrar:** overview del registro (login server, SKU, región)
- **Archivo sugerido:** `02-acr-overview.png`

### 3. Imagen con SHA en ACR

- **Ruta:** Azure Portal → ACR → `acrtechbanks7brazilsouth` → Repositories → `techbank`
- **Mostrar:** tag de la imagen con el SHA del commit (ej: `54738f8a04...`)
- **Archivo sugerido:** `03-acr-image-sha.png`

### 4. Container App

- **Ruta:** Azure Portal → Container Apps → `ca-techbank-s7-qa`
- **Mostrar:** overview (estado Running, URL pública, región, revision)
- **Archivo sugerido:** `04-container-app-overview.png`

### 5. URL QA pública

- **Mostrar:** FQDN del Container App (ej: `ca-techbank-s7-qa.victoriousdesert-e29e6577.brazilsouth.azurecontainerapps.io`)
- **Archivo sugerido:** `05-qa-url.png`

### 6. Dashboard TechBank en QA

- **Ruta:** Abrir la URL QA en el navegador → pantalla principal
- **Mostrar:** Dashboard con `environment: qa`, versión correcta, SHA del commit
- **Archivo sugerido:** `06-dashboard-qa.png`

### 7. Endpoint /health

- **URL:** `https://<qa-fqdn>/health`
- **Respuesta esperada:** `{"status":"ok"}`
- **Archivo sugerido:** `07-health-endpoint.png`

### 8. Endpoint /api/version

- **URL:** `https://<qa-fqdn>/api/version`
- **Respuesta esperada:**
  ```json
  {
    "appVersion": "v1.0.0",
    "gitSha": "<commit-sha>",
    "buildTime": "...",
    "pipelineVersion": "v1.1.0",
    "environment": "qa"
  }
  ```
- **Archivo sugerido:** `08-api-version-qa.png`

### 9. GitHub Actions deploy verde

- **Ruta:** GitHub → Actions → último workflow run → job `Deploy QA — Azure Container Apps`
- **Mostrar:** todos los steps en verde, incluyendo remote smoke tests
- **Archivo sugerido:** `09-github-actions-deploy-green.png`

## Capturas finales requeridas

Guardar las capturas manuales en este directorio con estos nombres. No se incluyen imágenes generadas ni placeholders.

| Archivo                                | Qué debe mostrar                                                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `01-github-actions-deploy-success.png` | Run #14 terminado en verde.                                                                             |
| `02-github-actions-deploy-steps.png`   | Job Deploy QA y sus pasos OIDC, ACR y smoke tests en verde.                                             |
| `03-azure-container-app-overview.png`  | Overview de `ca-techbank-s7-qa`: Running, región y FQDN.                                                |
| `04-azure-container-app-replicas.png`  | Réplicas/revisión activa y configuración min 1, max 3.                                                  |
| `05-acr-techbank-image.png`            | Repositorio `techbank` y tag SHA en ACR.                                                                |
| `06-qa-web-running.png`                | Dashboard TechBank en la URL QA pública.                                                                |
| `07-qa-health.png`                     | Respuesta 200 de `/health`.                                                                             |
| `08-qa-version.png`                    | Metadata de `/api/version` con App v1.0.0 y Pipeline v1.1.0.                                            |
| `09-k6-results.png`                    | El resumen final de `k6-output.txt`: 1227 requests, 0.00 % fallos, p95 613.09 ms y thresholds en verde. |
| `10-scaling-replicas.png`              | Azure Portal o CLI con la revisión activa y las muestras `1 → 3`; indicar que se observó autoscaling.   |

---

## Configuración de GitHub Secrets (paso manual requerido)

Antes de que el pipeline pueda hacer push a ACR y deploy a Azure, el alumno debe configurar estos secrets en GitHub:

**Ruta:** GitHub → Repository Settings → Secrets and variables → Actions → New repository secret

### Secret 1: `ACR_USERNAME`

```
Valor: acrtechbanks7brazilsouth
```

(Usuario admin del ACR — también visible en Azure Portal → ACR → Access keys)

### Secret 2: `ACR_PASSWORD`

```
Valor: <password del admin del ACR>
```

Obtener de: Azure Portal → Container Registries → `acrtechbanks7brazilsouth` → Access keys → password

### Secret 3: `AZURE_CLIENT_ID`

Client ID de la User Assigned Managed Identity `id-techbank-s7-github`.

### Secret 4: `AZURE_TENANT_ID`

Tenant ID de Azure correspondiente a la federación OIDC.

### Secret 5: `AZURE_SUBSCRIPTION_ID`

Subscription ID que contiene `rg-techbank-brazilsouth`.

### Azure Login con OIDC

El job `deploy-qa` recibe un token OIDC temporal de GitHub Actions y Azure lo intercambia mediante la User Assigned Managed Identity `id-techbank-s7-github`. No existe client secret ni JSON de credenciales estáticas para el login de Azure.

La credencial federada restringe la confianza a:

```text
issuer:   https://token.actions.githubusercontent.com
audience: api://AzureADTokenExchange
subject:  repo:iLioh@108911528/IBLaboratorio07@1384369787:ref:refs/heads/develop
```

---

## URL QA

URL QA verificada:

```
https://ca-techbank-s7-qa.victoriousdesert-e29e6577.brazilsouth.azurecontainerapps.io
```

La revisión activa usa la imagen `acrtechbanks7brazilsouth.azurecr.io/techbank:8f60360a51aac04dbf4425a6c7584a40bec274e8`.

---

## Estado de implementación

| Componente                                      | Estado                                       |
| ----------------------------------------------- | -------------------------------------------- |
| Resource Group `rg-techbank-brazilsouth`        | ✅ CONFIGURADO EN AZURE                      |
| ACR `acrtechbanks7brazilsouth`                  | ✅ CONFIGURADO EN AZURE                      |
| Container Apps Environment `cae-techbank-s7-qa` | ✅ CONFIGURADO EN AZURE                      |
| Container App `ca-techbank-s7-qa`               | ✅ RUNNING Y HEALTHY                         |
| Pipeline v1.1.0 con deploy QA                   | ✅ EJECUTADO CORRECTAMENTE EN RUN #14        |
| GitHub Secrets                                  | ✅ CINCO SECRETS REQUERIDOS PARA EL WORKFLOW |
| OIDC / Federated Credentials                    | ✅ CONFIGURADO PARA `develop`                |
| Prueba k6 moderada                              | ✅ 1227 REQUESTS, THRESHOLDS APROBADOS       |
| Autoscaling horizontal                          | ✅ OBSERVADO: 1 → 3 RÉPLICAS                 |
