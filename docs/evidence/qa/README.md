# QA Deployment Evidence

## Checklist de evidencias para el Laboratorio 07 — Fase 3

El alumno debe capturar las siguientes pantallas / evidencias reales después de que el pipeline de GitHub Actions haya desplegado exitosamente en Azure.

---

## Recursos Azure creados

| #   | Recurso                    | Nombre                   | Región       | Estado                     |
| --- | -------------------------- | ------------------------ | ------------ | -------------------------- |
| 1   | Resource Group             | rg-techbank-brazilsouth  | Brazil South | ✅ Creado                  |
| 2   | Azure Container Registry   | acrtechbanks7brazilsouth | Brazil South | ✅ Creado                  |
| 3   | Container Apps Environment | cae-techbank-s7-qa       | Brazil South | ✅ Creado                  |
| 4   | Container App              | ca-techbank-s7-qa        | Brazil South | ⏳ Pendiente primer deploy |

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

### Secret 3: `AZURE_CREDENTIALS`

Crear un Service Principal con acceso limitado al Resource Group:

```bash
SUBSCRIPTION_ID="$(az account show --query id -o tsv)"
az ad sp create-for-rbac \
  --name "techbank-github-actions" \
  --role Contributor \
  --scopes "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/rg-techbank-brazilsouth" \
  --sdk-auth
```

> **Nota:** Este comando requiere permisos de directorio. Si falla con error de permisos,
> solicitar al administrador del tenant (UTP) que lo ejecute, o usar la Azure Portal
> para crear el Service Principal manualmente.

El JSON resultante debe pegarse completo como valor del secret `AZURE_CREDENTIALS`.

---

## URL QA

Una vez desplegado, la URL tendrá formato:

```
https://<qa-fqdn>
```

> La URL exacta se imprime al final del job `Deploy QA` en GitHub Actions.

---

## Estado de implementación

| Componente                                      | Estado                                                       |
| ----------------------------------------------- | ------------------------------------------------------------ |
| Resource Group `rg-techbank-brazilsouth`        | ✅ CONFIGURADO EN AZURE                                      |
| ACR `acrtechbanks7brazilsouth`                  | ✅ CONFIGURADO EN AZURE                                      |
| Container Apps Environment `cae-techbank-s7-qa` | ✅ CONFIGURADO EN AZURE                                      |
| Container App `ca-techbank-s7-qa`               | ⏳ SE CREA EN PRIMER PIPELINE RUN                            |
| Pipeline v1.1.0 con deploy QA                   | ✅ IMPLEMENTADO EN CÓDIGO                                    |
| GitHub Secrets                                  | ⚠️ REQUIERE INTERVENCIÓN MANUAL                              |
| OIDC / Federated Credentials                    | ⚠️ BLOQUEADO — requiere permisos de directorio en tenant UTP |
