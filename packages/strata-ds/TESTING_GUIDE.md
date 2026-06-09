# 🧪 Guía de Testing - Strata DS Update System

## 📋 Tabla de Contenidos

1. [Preparación del Entorno](#preparación-del-entorno)
2. [Ejecución Automática](#ejecución-automática)
3. [Testing Manual por Rol](#testing-manual-por-rol)
4. [Registro de Resultados](#registro-de-resultados)
5. [Troubleshooting](#troubleshooting)

---

## Preparación del Entorno

### Paso 1: Configurar Variables de Entorno

```bash
# 1. Copiar template
cd api
cp .env.example .env

# 2. Editar .env con tus valores
nano .env  # o vim .env, o code .env
```

**Variables mínimas requeridas:**
```bash
PORT=3001
API_VERSION=v1
CORS_ORIGIN=http://localhost:5173
MASTER_API_KEY=sk_live_tu_api_key_aqui
FIGMA_WEBHOOK_SECRET=tu_webhook_secret_aqui
API_BASE_URL=http://localhost:3001
```

**Generar API key seguro:**
```bash
# Con openssl (macOS/Linux)
openssl rand -hex 32

# Con Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Paso 2: Instalar Dependencias

```bash
# Backend
cd api
npm install

# Frontend
cd ..
npm install
```

### Paso 3: Iniciar Servidores

**Terminal 1 - API:**
```bash
cd api
npm run dev
```

Verás:
```
🎨 Strata DS API Server
Port: 3001
- Health: http://localhost:3001/health
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Verás:
```
➜  Local: http://localhost:5173/
```

### Paso 4: Verificar que Todo Está Corriendo

```bash
# Verificar API
curl http://localhost:3001/health

# Verificar Frontend
curl http://localhost:5173
```

Ambos deben responder sin error.

---

## Ejecución Automática

### Opción 1: Script de Testing Completo

```bash
# Hacer ejecutable
chmod +x run-tests.sh

# Ejecutar
./run-tests.sh
```

Este script ejecutará **39 tests automáticos** y te dará un reporte completo.

**Resultado esperado:**
```
╔═══════════════════════════════════════════════════════════╗
║   🎉 ALL TESTS PASSED! System is production ready.      ║
╚═══════════════════════════════════════════════════════════╝

Total Tests: 39
Passed: 39 ✅
Failed: 0 ❌
Pass Rate: 100%
```

### Opción 2: Suite Automatizada del API

```bash
cd api
npm run test:flow
```

Este ejecutará **9 tests** del flujo completo:
1. ✅ Health Check
2. ✅ Manual Component Update
3. ✅ AI-Generated Component
4. ✅ Figma Webhook (simulated)
5. ✅ Event History
6. ✅ Version Creation
7. ✅ Version Retrieval
8. ✅ Notification Subscription
9. ✅ Update Check

---

## Testing Manual por Rol

### 👔 Como Technical Lead (Enfoque: APIs & Arquitectura)

#### Test 1: Verificar Health Check

```bash
curl http://localhost:3001/health
```

**Checklist:**
- [ ] Responde con status 200
- [ ] JSON contiene "status": "healthy"
- [ ] Responde en < 50ms

---

#### Test 2: Crear Componente Manualmente

```bash
# Reemplaza YOUR_API_KEY con tu API key del .env
curl -X POST http://localhost:3001/v1/webhooks/manual-update \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "componentId": "button-primary",
    "componentData": {
      "name": "Primary Button",
      "description": "Main action button",
      "version": "1.0.0",
      "category": "buttons",
      "variants": ["default", "hover", "active", "disabled"],
      "code": {
        "react": "export function PrimaryButton() { return <button>Click</button>; }",
        "html": "<button class=\"btn-primary\">Click</button>",
        "css": ".btn-primary { background: #000; color: #fff; }"
      }
    },
    "changeType": "create",
    "description": "Creating primary button component"
  }'
```

**Checklist:**
- [ ] Responde con "success": true
- [ ] Retorna eventId
- [ ] Event aparece en history

---

#### Test 3: Verificar Event History

```bash
curl http://localhost:3001/v1/webhooks/events?limit=10
```

**Checklist:**
- [ ] Muestra el componente recién creado
- [ ] Tiene todos los campos (id, type, source, timestamp, data)
- [ ] Está ordenado por timestamp (más reciente primero)

---

#### Test 4: Crear Versión

```bash
curl -X POST http://localhost:3001/v1/versions \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "version": "1.0.0",
    "changelog": [
      {
        "id": "cl_001",
        "type": "added",
        "componentName": "Primary Button",
        "description": "Added primary button component",
        "impact": "minor",
        "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
      }
    ],
    "breakingChanges": [],
    "deprecations": []
  }'
```

**Checklist:**
- [ ] Versión creada exitosamente
- [ ] Status es "draft"
- [ ] Changelog incluido

---

#### Test 5: Verificar Actualizaciones

```bash
curl -X POST http://localhost:3001/v1/versions/check-updates \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "currentVersion": "0.9.0",
    "components": ["button", "alert", "modal"]
  }'
```

**Checklist:**
- [ ] Indica si hay actualización disponible
- [ ] Muestra versión actual vs latest
- [ ] Indica tipo de cambio (major/minor/patch)
- [ ] Muestra si hay breaking changes

---

#### Test 6: Suscripción a Notificaciones

```bash
curl -X POST http://localhost:3001/v1/notifications/subscribe \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "userId": "tech-lead-123",
    "email": "techlead@example.com",
    "channels": ["email", "webhook"],
    "events": ["version.published", "component.updated", "breaking.change"],
    "minSeverity": "warning",
    "webhookUrl": "https://your-ci-cd.com/webhook"
  }'
```

**Checklist:**
- [ ] Suscripción creada
- [ ] Retorna subscriptionId
- [ ] Todos los canales configurados

---

### 🎨 Como Design Lead (Enfoque: UI/UX)

#### Test 1: Acceso al Admin Panel

**Pasos:**
1. Abrir: http://localhost:5173
2. En el sidebar, buscar "Admin Panel"
3. Click en "Admin Panel"

**Checklist:**
- [ ] Página carga sin errores
- [ ] Header muestra "Admin Panel" con badge
- [ ] Descripción visible y legible
- [ ] 4 stats cards visibles

---

#### Test 2: Dashboard Stats

**Pasos:**
1. Estar en Admin Panel
2. Observar las 4 stats cards

**Checklist:**
- [ ] **Current Version:** Muestra versión (ej: "1.0.0")
- [ ] **Total Components:** Muestra número (ej: "42")
- [ ] **Recent Updates:** Muestra contador de eventos
- [ ] **Active Users:** Muestra número (ej: "156")
- [ ] Cada card tiene icono correcto
- [ ] Colores diferenciados por stat

---

#### Test 3: Recent Updates Tab

**Pasos:**
1. Asegurarse de estar en tab "Recent Updates" (activo por defecto)
2. Observar la tabla

**Checklist:**
- [ ] Tabla tiene 5 columnas: Component, Source, Change Type, Status, Timestamp
- [ ] Si hay datos, se muestran en filas
- [ ] **Source badges:**
  - Figma = Purple con icono FileCode
  - Manual = Blue con icono Upload
  - AI = Green con icono Zap
- [ ] **Change Type badges:**
  - MAJOR = Red
  - MINOR = Amber
  - PATCH = Green
- [ ] Status muestra check verde
- [ ] Timestamp está formateado (ej: "12/18/2024, 10:30:00 AM")

---

#### Test 4: Figma Sync - Webhook Config

**Pasos:**
1. Click en tab "Figma Sync"
2. Buscar sección "Webhook Configuration"

**Checklist:**
- [ ] URL del webhook visible en input readonly
- [ ] Botón "Copy" funciona (click y verifica "Copied!")
- [ ] Botón "Docs" abre docs de Figma en nueva tab
- [ ] Box azul con instrucciones es legible
- [ ] 6 pasos numerados visibles

---

#### Test 5: Figma Sync - Manual Import

**Pasos:**
1. Aún en tab "Figma Sync"
2. Buscar sección "Manual Figma Import"
3. Pegar URL: `https://www.figma.com/file/test123/TestFile`
4. Click "Import from Figma"

**Checklist:**
- [ ] Input acepta texto
- [ ] Placeholder text visible
- [ ] Botón cambia a "Processing..." con spinner
- [ ] Después de procesado, muestra mensaje (success o error)
- [ ] Input se limpia después de éxito

---

#### Test 6: Versions Tab

**Pasos:**
1. Click en tab "Versions"

**Checklist:**
- [ ] Muestra versión actual
- [ ] Muestra número de breaking changes
- [ ] Botón "Publish New Version" visible
- [ ] Descripción de features disponibles
- [ ] Lista de funcionalidades bullet points

---

#### Test 7: Notifications Tab

**Pasos:**
1. Click en tab "Notifications"

**Checklist:**
- [ ] Icono de campana (Bell) visible
- [ ] Título "Real-time Notifications"
- [ ] Descripción legible
- [ ] 3 toggles:
  - Email Notifications
  - Webhook Notifications
  - Slack Integration
- [ ] Cada toggle tiene descripción
- [ ] Toggles funcionan visualmente (switch left/right)

---

#### Test 8: Dark Mode

**Pasos:**
1. Estar en Admin Panel
2. Click en icono de luna (top right)
3. Observar cambios

**Checklist:**
- [ ] Background cambia a oscuro
- [ ] Texto cambia a claro
- [ ] Stats cards tienen borde visible
- [ ] Tabla legible en dark mode
- [ ] Badges mantienen colores apropiados
- [ ] No hay problemas de contraste

---

#### Test 9: Responsive Design

**Pasos:**
1. Abrir DevTools (F12)
2. Click en icono de móvil
3. Seleccionar iPhone 12 (390x844)

**Checklist:**
- [ ] Stats cards en columna (no fila)
- [ ] Tabla tiene scroll horizontal
- [ ] Tabs siguen siendo clickeables
- [ ] Botones tienen tamaño apropiado
- [ ] Todo el contenido visible (no cortado)

---

#### Test 10: Export to Figma en Componente

**Pasos:**
1. Ir a página principal (Home)
2. Click en cualquier componente (ej: "Buttons")
3. Buscar botón morado "Export to Figma"
4. Click en el botón

**Checklist:**
- [ ] Botón visible y tiene color purple
- [ ] Modal abre al hacer click
- [ ] Modal tiene 4 tabs:
  - Copy & Paste
  - HTML to Figma Plugin
  - html.to.design
  - Download HTML
- [ ] Cada tab tiene instrucciones
- [ ] Links externos funcionan
- [ ] Botón "Close" cierra modal

---

### ✅ Como QA Senior (Enfoque: Quality & Edge Cases)

#### Test 1: Flow Completo - Crear Componente

**Pasos:**
1. Crear componente via API (ver Test TL-2)
2. Ir a Admin Panel → Recent Updates
3. Verificar componente aparece
4. Verificar via API: `curl http://localhost:3001/v1/webhooks/events`

**Checklist:**
- [ ] Componente creado exitosamente
- [ ] Aparece en UI (Recent Updates)
- [ ] Aparece en API (events)
- [ ] Datos coinciden (componentId, name, etc)
- [ ] Timestamp es reciente
- [ ] Source es "manual"

---

#### Test 2: Flow Completo - Lifecycle de Versión

**Pasos:**
1. Crear versión 1.0.0 (ver Test TL-4)
2. Verificar en Admin Panel → Versions
3. Publicar versión via API:
   ```bash
   curl -X POST http://localhost:3001/v1/versions/1.0.0/publish \
     -H "x-api-key: YOUR_API_KEY"
   ```
4. Verificar status cambió
5. Crear versión 1.1.0
6. Comparar: `curl http://localhost:3001/v1/versions/compare/1.0.0/1.1.0`

**Checklist:**
- [ ] Versión 1.0.0 creada con status "draft"
- [ ] Después de publish, status es "published"
- [ ] Versión 1.1.0 se puede crear
- [ ] Comparación muestra diferencias
- [ ] No se puede republicar misma versión

---

#### Test 3: Edge Case - API Key Inválido

```bash
curl -X POST http://localhost:3001/v1/versions \
  -H "x-api-key: invalid-key-12345" \
  -H "Content-Type: application/json" \
  -d '{"version": "1.0.0"}'
```

**Checklist:**
- [ ] Retorna status 401
- [ ] Mensaje de error apropiado
- [ ] No procesa la request
- [ ] Logs muestran intento fallido

---

#### Test 4: Edge Case - Campos Requeridos Faltantes

```bash
curl -X POST http://localhost:3001/v1/webhooks/manual-update \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Checklist:**
- [ ] Retorna status 400
- [ ] Mensaje indica campos faltantes
- [ ] No crea evento corrupto
- [ ] Error es descriptivo

---

#### Test 5: Edge Case - Formato de Versión Inválido

```bash
curl -X POST http://localhost:3001/v1/versions \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"version": "not-a-version"}'
```

**Checklist:**
- [ ] Retorna status 400
- [ ] Mensaje indica formato semver inválido
- [ ] No crea versión
- [ ] Sugiere formato correcto

---

#### Test 6: Edge Case - Versión Duplicada

```bash
# Crear versión 1.0.0 (si no existe)
curl -X POST http://localhost:3001/v1/versions \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"version": "1.0.0", "changelog": []}'

# Intentar crear de nuevo
curl -X POST http://localhost:3001/v1/versions \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"version": "1.0.0", "changelog": []}'
```

**Checklist:**
- [ ] Segunda request retorna 409
- [ ] Mensaje indica "Version already exists"
- [ ] Primera versión no se modifica
- [ ] Sistema mantiene integridad

---

#### Test 7: Performance - Response Time

```bash
# Medir tiempo de respuesta
time curl http://localhost:3001/health
```

**Checklist:**
- [ ] Health check responde en < 50ms
- [ ] Create component responde en < 200ms
- [ ] Get events responde en < 100ms
- [ ] No hay timeouts

---

#### Test 8: Seguridad - SQL Injection Attempt

```bash
curl -X POST http://localhost:3001/v1/webhooks/manual-update \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"componentId": "test OR 1=1 --"}'
```

**Checklist:**
- [ ] Request procesado normalmente
- [ ] String tratado como literal
- [ ] No hay error de base de datos
- [ ] No hay vulnerabilidad

---

#### Test 9: Seguridad - XSS Attempt

```bash
curl -X POST http://localhost:3001/v1/webhooks/manual-update \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "componentId": "test-xss",
    "componentData": {
      "name": "<script>alert(\"XSS\")</script>"
    },
    "changeType": "create"
  }'
```

Luego verificar en Admin Panel → Recent Updates

**Checklist:**
- [ ] Script NO se ejecuta en UI
- [ ] String escapado correctamente
- [ ] Muestra texto literal (no ejecuta JS)
- [ ] No hay vulnerabilidad XSS

---

#### Test 10: Concurrencia

```bash
# 10 requests simultáneos
for i in {1..10}; do
  curl -X POST http://localhost:3001/v1/webhooks/manual-update \
    -H "x-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"componentId\":\"test-$i\",\"componentData\":{},\"changeType\":\"create\"}" &
done
wait
```

Luego verificar events:
```bash
curl http://localhost:3001/v1/webhooks/events?limit=20
```

**Checklist:**
- [ ] Todos los requests procesan
- [ ] 10 eventos creados
- [ ] No hay race conditions
- [ ] Todos tienen IDs únicos
- [ ] No hay datos corruptos

---

## Registro de Resultados

### Opción 1: Usar Template

1. Abrir `/TEST_RESULTS_TEMPLATE.md`
2. Completar cada test con ✅ PASS o ❌ FAIL
3. Agregar comentarios y notas
4. Documentar issues encontrados
5. Firmar como cada rol

### Opción 2: Generar Reporte Automático

```bash
# El script run-tests.sh genera reporte automático
./run-tests.sh > test-results-$(date +%Y%m%d).txt
```

---

## Troubleshooting

### API No Responde

```bash
# Verificar si está corriendo
lsof -i :3001

# Si no aparece nada, iniciar API
cd api && npm run dev
```

### Frontend No Carga

```bash
# Verificar si está corriendo
lsof -i :5173

# Si no aparece nada, iniciar frontend
npm run dev
```

### Tests Fallan

```bash
# 1. Verificar .env existe
ls -la api/.env

# 2. Verificar API_KEY está configurado
grep MASTER_API_KEY api/.env

# 3. Reiniciar servidores
# Ctrl+C en cada terminal, luego reiniciar
```

### CORS Errors

Verificar en `api/.env`:
```bash
CORS_ORIGIN=http://localhost:5173
```

### Permission Denied en Scripts

```bash
chmod +x run-tests.sh
chmod +x start.sh
```

---

## 📊 Criterios de Éxito

Para considerar el testing exitoso:

- ✅ **Automated Tests:** 9/9 pasan (100%)
- ✅ **Manual Tests - Technical Lead:** > 11/13 pasan (>85%)
- ✅ **Manual Tests - Design Lead:** > 11/13 pasan (>85%)
- ✅ **Manual Tests - QA Senior:** > 11/13 pasan (>85%)
- ✅ **Overall Pass Rate:** > 90%
- ✅ **Critical Issues:** 0
- ✅ **High Priority Issues:** < 3

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa `/TROUBLESHOOTING.md` (si existe)
2. Revisa logs: `tail -f api.log` o `tail -f frontend.log`
3. Consulta `/SETUP_GUIDE.md` sección troubleshooting
4. Revisa documentación: `/ARCHITECTURE_STRATEGY.md`

---

**Happy Testing! 🧪**
