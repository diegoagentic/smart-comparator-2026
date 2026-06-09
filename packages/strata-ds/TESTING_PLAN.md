# 🧪 Plan de Pruebas Completo - Strata DS Update System

## Equipo de Testing

### 👔 Technical Lead (Arquitectura & APIs)
**Responsabilidades:**
- Verificar arquitectura de APIs
- Probar endpoints REST
- Validar seguridad y autenticación
- Verificar performance y escalabilidad
- Probar integración de webhooks

### 🎨 Design Lead (UX/UI & Design System)
**Responsabilidades:**
- Verificar Admin Panel UI/UX
- Probar flujo de actualización de componentes
- Validar exportación a Figma
- Verificar consistencia visual
- Probar dark mode y responsiveness

### ✅ QA Senior (Quality Assurance)
**Responsabilidades:**
- Crear test cases completos
- Ejecutar tests funcionales
- Verificar edge cases
- Documentar bugs y issues
- Validar user flows end-to-end

---

## 📋 Test Cases por Rol

### 🔷 TECHNICAL LEAD - API & Architecture Tests

#### TC-TL-001: Health Check API
**Objetivo:** Verificar que el API responde correctamente
```bash
curl http://localhost:3001/health
```
**Expected Result:**
```json
{
  "status": "healthy",
  "uptime": "99.98%",
  "version": "1.0.0"
}
```
**Pass/Fail:** [ ]

---

#### TC-TL-002: CORS Configuration
**Objetivo:** Verificar que CORS está configurado correctamente
```bash
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS http://localhost:3001/v1/versions
```
**Expected Result:** Headers CORS presentes
**Pass/Fail:** [ ]

---

#### TC-TL-003: API Authentication
**Objetivo:** Verificar que la autenticación por API key funciona
```bash
# Sin API key (debe fallar)
curl -X POST http://localhost:3001/v1/webhooks/manual-update

# Con API key (debe funcionar)
curl -X POST http://localhost:3001/v1/webhooks/manual-update \
     -H "x-api-key: YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"componentId":"test"}'
```
**Expected Result:** 401 sin key, 200/400 con key
**Pass/Fail:** [ ]

---

#### TC-TL-004: Manual Component Update
**Objetivo:** Crear componente via webhook manual
```bash
curl -X POST http://localhost:3001/v1/webhooks/manual-update \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "componentId": "test-button-primary",
    "componentData": {
      "name": "Primary Button",
      "description": "A primary action button",
      "version": "1.0.0",
      "category": "buttons"
    },
    "changeType": "create",
    "description": "Creating primary button"
  }'
```
**Expected Result:** Event created successfully
**Pass/Fail:** [ ]

---

#### TC-TL-005: AI Component Generation
**Objetivo:** Generar componente con AI
```bash
curl -X POST http://localhost:3001/v1/webhooks/ai-update \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "prompt": "Create a success alert component",
    "generatedComponent": {
      "name": "SuccessAlert",
      "code": {
        "react": "export function SuccessAlert() { return <div>Success!</div>; }",
        "html": "<div class=\"alert-success\">Success!</div>"
      }
    }
  }'
```
**Expected Result:** AI component created
**Pass/Fail:** [ ]

---

#### TC-TL-006: Figma Webhook Simulation
**Objetivo:** Simular evento de Figma
```bash
# Generar signature
PAYLOAD='{"event_type":"FILE_UPDATE","file_key":"test123"}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "YOUR_WEBHOOK_SECRET" | cut -d' ' -f2)

curl -X POST http://localhost:3001/v1/webhooks/figma \
  -H "Content-Type: application/json" \
  -H "x-figma-signature: $SIGNATURE" \
  -d "$PAYLOAD"
```
**Expected Result:** Webhook processed
**Pass/Fail:** [ ]

---

#### TC-TL-007: Event History Retrieval
**Objetivo:** Obtener historial de eventos
```bash
# Todos los eventos
curl http://localhost:3001/v1/webhooks/events?limit=10

# Solo Figma
curl http://localhost:3001/v1/webhooks/events?source=figma

# Solo manuales
curl http://localhost:3001/v1/webhooks/events?source=manual
```
**Expected Result:** Lista de eventos filtrada
**Pass/Fail:** [ ]

---

#### TC-TL-008: Version Creation
**Objetivo:** Crear nueva versión
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
        "componentName": "Button",
        "description": "Initial button component",
        "impact": "minor"
      }
    ]
  }'
```
**Expected Result:** Version created
**Pass/Fail:** [ ]

---

#### TC-TL-009: Version Comparison
**Objetivo:** Comparar dos versiones
```bash
curl http://localhost:3001/v1/versions/compare/1.0.0/1.1.0
```
**Expected Result:** Diff entre versiones
**Pass/Fail:** [ ]

---

#### TC-TL-010: Update Check
**Objetivo:** Verificar actualizaciones disponibles
```bash
curl -X POST http://localhost:3001/v1/versions/check-updates \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "currentVersion": "0.9.0",
    "components": ["button", "alert"]
  }'
```
**Expected Result:** Info de actualización
**Pass/Fail:** [ ]

---

#### TC-TL-011: Notification Subscription
**Objetivo:** Suscribirse a notificaciones
```bash
curl -X POST http://localhost:3001/v1/notifications/subscribe \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "userId": "test-user",
    "email": "test@example.com",
    "channels": ["email"],
    "events": ["version.published"],
    "minSeverity": "info"
  }'
```
**Expected Result:** Subscription created
**Pass/Fail:** [ ]

---

#### TC-TL-012: Rate Limiting
**Objetivo:** Verificar límite de requests
```bash
# Hacer 101 requests rápidos
for i in {1..101}; do
  curl http://localhost:3001/health
done
```
**Expected Result:** 429 Too Many Requests después del límite
**Pass/Fail:** [ ]

---

#### TC-TL-013: API Documentation
**Objetivo:** Verificar Swagger docs
```bash
curl http://localhost:3001/api-docs
```
**Expected Result:** Swagger UI HTML
**Pass/Fail:** [ ]

---

### 🔷 DESIGN LEAD - UI/UX & Design System Tests

#### TC-DL-001: Admin Panel Access
**Objetivo:** Verificar acceso al Admin Panel
**Steps:**
1. Abrir http://localhost:5173
2. Buscar "Admin Panel" en sidebar
3. Click en "Admin Panel"
**Expected Result:** Dashboard carga correctamente
**Pass/Fail:** [ ]

---

#### TC-DL-002: Dashboard Stats Display
**Objetivo:** Verificar métricas del dashboard
**Steps:**
1. En Admin Panel, verificar 4 cards de stats
2. Verificar "Current Version" muestra versión
3. Verificar "Total Components" muestra número
4. Verificar "Recent Updates" muestra contador
5. Verificar "Active Users" muestra número
**Expected Result:** Todas las stats visibles y correctas
**Pass/Fail:** [ ]

---

#### TC-DL-003: Recent Updates Tab
**Objetivo:** Verificar tabla de actualizaciones
**Steps:**
1. Click en tab "Recent Updates"
2. Verificar tabla con columnas: Component, Source, Change Type, Status, Timestamp
3. Verificar badges de color para source (Figma=purple, Manual=blue, AI=green)
4. Verificar badges de change type (Major=red, Minor=amber, Patch=green)
**Expected Result:** Tabla formateada correctamente
**Pass/Fail:** [ ]

---

#### TC-DL-004: Figma Sync - Webhook Config
**Objetivo:** Verificar configuración de webhooks
**Steps:**
1. Click en tab "Figma Sync"
2. Verificar URL del webhook es visible
3. Click en botón "Copy"
4. Verificar mensaje "Copied!"
5. Click en botón "Docs" abre nueva pestaña
**Expected Result:** Copy funciona, link abre docs de Figma
**Pass/Fail:** [ ]

---

#### TC-DL-005: Figma Sync - Manual Import
**Objetivo:** Probar importación manual
**Steps:**
1. En tab "Figma Sync", buscar sección "Manual Figma Import"
2. Pegar URL: https://www.figma.com/file/test123/TestFile
3. Click "Import from Figma"
4. Verificar botón muestra "Processing..."
5. Esperar respuesta
**Expected Result:** Import se procesa (puede fallar por URL inválida, pero UI debe responder)
**Pass/Fail:** [ ]

---

#### TC-DL-006: Versions Tab
**Objetivo:** Verificar gestión de versiones
**Steps:**
1. Click en tab "Versions"
2. Verificar muestra versión actual
3. Verificar muestra breaking changes count
4. Verificar botón "Publish New Version" está visible
**Expected Result:** Info de versión visible
**Pass/Fail:** [ ]

---

#### TC-DL-007: Notifications Tab
**Objetivo:** Verificar configuración de notificaciones
**Steps:**
1. Click en tab "Notifications"
2. Verificar 3 toggles: Email, Webhook, Slack
3. Intentar activar/desactivar cada toggle
**Expected Result:** Toggles funcionan visualmente
**Pass/Fail:** [ ]

---

#### TC-DL-008: Dark Mode Consistency
**Objetivo:** Verificar dark mode en Admin Panel
**Steps:**
1. Click en toggle de dark mode (luna/sol)
2. Verificar Admin Panel cambia a dark
3. Verificar todos los elementos son legibles
4. Verificar stats cards tienen borde visible
5. Verificar tabla tiene contraste adecuado
**Expected Result:** Dark mode funcional en todo el panel
**Pass/Fail:** [ ]

---

#### TC-DL-009: Responsive Design
**Objetivo:** Verificar responsiveness
**Steps:**
1. Abrir DevTools
2. Cambiar a mobile view (375px)
3. Verificar Admin Panel se adapta
4. Verificar stats en columna (no fila)
5. Verificar tabla tiene scroll horizontal si necesario
**Expected Result:** Admin Panel responsive
**Pass/Fail:** [ ]

---

#### TC-DL-010: Export to Figma Button
**Objetivo:** Verificar botón en componentes
**Steps:**
1. Ir a cualquier componente (ej: Buttons)
2. Buscar botón morado "Export to Figma"
3. Click en botón
4. Verificar modal abre con 4 métodos
5. Verificar tabs: HTML, React, CSS, Prompt
**Expected Result:** Modal de exportación funcional
**Pass/Fail:** [ ]

---

#### TC-DL-011: Code Viewer Functionality
**Objetivo:** Verificar CodeViewer
**Steps:**
1. En componente, verificar 4 tabs de código
2. Click en cada tab (HTML, React, CSS, Prompt)
3. Click en botón "Copy Code"
4. Verificar feedback visual
**Expected Result:** Tabs cambian, copy funciona
**Pass/Fail:** [ ]

---

#### TC-DL-012: Typography Consistency
**Objetivo:** Verificar sistema tipográfico
**Steps:**
1. Verificar headings usan Inter font
2. Verificar tamaños son consistentes
3. Verificar hierarchy visual (h1 > h2 > h3)
**Expected Result:** Tipografía del design system aplicada
**Pass/Fail:** [ ]

---

#### TC-DL-013: Color System
**Objetivo:** Verificar paleta Zinc greyscale
**Steps:**
1. Inspeccionar elementos con DevTools
2. Verificar backgrounds usan zinc-*
3. Verificar text colors usan zinc-*
4. Verificar accent colors (purple para Figma, blue para manual, green para AI)
**Expected Result:** Color system consistente
**Pass/Fail:** [ ]

---

### 🔷 QA SENIOR - Quality Assurance Tests

#### TC-QA-001: Complete User Flow - Create Component
**Objetivo:** Flow completo de creación de componente
**Steps:**
1. Iniciar API y Frontend
2. Navegar a Admin Panel
3. Ir a Figma Sync → Manual Import
4. Pegar URL de Figma
5. Click Import
6. Verificar aparece en Recent Updates
7. Verificar event en API: `curl http://localhost:3001/v1/webhooks/events`
**Expected Result:** Componente creado y visible
**Pass/Fail:** [ ]

---

#### TC-QA-002: Complete User Flow - Version Lifecycle
**Objetivo:** Ciclo completo de versión
**Steps:**
1. Crear versión 1.0.0 via API
2. Verificar aparece en Admin Panel → Versions
3. Publicar versión via API
4. Verificar status cambia a "published"
5. Crear versión 1.1.0
6. Comparar versiones via API
**Expected Result:** Lifecycle completo funciona
**Pass/Fail:** [ ]

---

#### TC-QA-003: Complete User Flow - Notifications
**Objetivo:** Flow de notificaciones
**Steps:**
1. Suscribirse via API
2. Crear nueva versión
3. Publicar versión
4. Verificar notificación creada via API
**Expected Result:** Notificación enviada
**Pass/Fail:** [ ]

---

#### TC-QA-004: Edge Case - Invalid API Key
**Objetivo:** Validar manejo de API key inválida
```bash
curl -X POST http://localhost:3001/v1/versions \
  -H "x-api-key: invalid-key" \
  -H "Content-Type: application/json"
```
**Expected Result:** 401 Unauthorized
**Pass/Fail:** [ ]

---

#### TC-QA-005: Edge Case - Missing Required Fields
**Objetivo:** Validar validación de campos
```bash
curl -X POST http://localhost:3001/v1/webhooks/manual-update \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```
**Expected Result:** 400 Bad Request con mensaje de error
**Pass/Fail:** [ ]

---

#### TC-QA-006: Edge Case - Invalid Version Format
**Objetivo:** Validar formato semver
```bash
curl -X POST http://localhost:3001/v1/versions \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"version": "invalid"}'
```
**Expected Result:** 400 Bad Request
**Pass/Fail:** [ ]

---

#### TC-QA-007: Edge Case - Duplicate Version
**Objetivo:** Evitar versiones duplicadas
```bash
# Crear versión 1.0.0
curl -X POST http://localhost:3001/v1/versions \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"version": "1.0.0"}'

# Intentar crear de nuevo
curl -X POST http://localhost:3001/v1/versions \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"version": "1.0.0"}'
```
**Expected Result:** Segunda request retorna 409 Conflict
**Pass/Fail:** [ ]

---

#### TC-QA-008: Performance - Multiple Concurrent Requests
**Objetivo:** Probar carga concurrente
```bash
# 10 requests simultáneos
for i in {1..10}; do
  curl http://localhost:3001/health &
done
wait
```
**Expected Result:** Todos responden en <100ms
**Pass/Fail:** [ ]

---

#### TC-QA-009: Data Consistency - Event History
**Objetivo:** Verificar consistencia de datos
**Steps:**
1. Crear 3 componentes diferentes
2. Obtener event history
3. Verificar que los 3 eventos aparecen
4. Verificar orden cronológico correcto
5. Verificar campos completos en cada evento
**Expected Result:** Datos consistentes y ordenados
**Pass/Fail:** [ ]

---

#### TC-QA-010: Error Handling - Server Down
**Objetivo:** Verificar manejo cuando API no responde
**Steps:**
1. Parar API server
2. En frontend, intentar acciones
3. Verificar mensajes de error apropiados
4. Reiniciar API
5. Verificar frontend se reconecta
**Expected Result:** Errores manejados gracefully
**Pass/Fail:** [ ]

---

#### TC-QA-011: Security - SQL Injection Attempt
**Objetivo:** Probar inyección SQL
```bash
curl -X POST http://localhost:3001/v1/webhooks/manual-update \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"componentId": "test OR 1=1"}'
```
**Expected Result:** Request procesado sin vulnerabilidad
**Pass/Fail:** [ ]

---

#### TC-QA-012: Security - XSS Attempt
**Objetivo:** Probar Cross-Site Scripting
```bash
curl -X POST http://localhost:3001/v1/webhooks/manual-update \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"componentData": {"name": "<script>alert(1)</script>"}}'
```
**Expected Result:** Script escapado correctamente
**Pass/Fail:** [ ]

---

#### TC-QA-013: Automated Test Suite
**Objetivo:** Ejecutar suite automatizada
```bash
cd api
npm run test:flow
```
**Expected Result:** 9/9 tests pasan
**Pass/Fail:** [ ]

---

## 📊 Test Execution Report Template

### Test Summary

| Category | Total | Passed | Failed | Blocked | Pass Rate |
|----------|-------|--------|--------|---------|-----------|
| Technical Lead (API) | 13 | | | | % |
| Design Lead (UI/UX) | 13 | | | | % |
| QA Senior (Quality) | 13 | | | | % |
| **TOTAL** | **39** | | | | **%** |

### Critical Issues Found
1. Issue #001: [Description]
   - Severity: Critical/High/Medium/Low
   - Steps to Reproduce:
   - Expected vs Actual:

### Non-Critical Issues
1. Issue #002: [Description]

### Recommendations
1. [Recommendation 1]
2. [Recommendation 2]

### Sign-Off

- **Technical Lead:** [ ] Approved [ ] Rejected
  - Comments: 
  
- **Design Lead:** [ ] Approved [ ] Rejected
  - Comments:
  
- **QA Senior:** [ ] Approved [ ] Rejected
  - Comments:

---

## 🚀 Next Steps After Testing

1. **Fix Critical Issues** - P0 priority
2. **Fix High Priority Issues** - P1 priority
3. **Update Documentation** - Reflejar cambios
4. **Re-test Failed Cases** - Validar fixes
5. **Prepare for Production** - Si todo pasa

---

**Testing Date:** [DATE]
**Tested By:** Technical Lead + Design Lead + QA Senior
**Environment:** Development (localhost)
**API Version:** v1
**Frontend Version:** Current
