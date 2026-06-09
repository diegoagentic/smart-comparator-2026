# 📝 Comandos de Referencia Rápida

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Recomendado)
```bash
chmod +x start.sh
./start.sh
```

### Opción 2: Manual
```bash
# Terminal 1 - API
cd api
npm run dev

# Terminal 2 - Frontend  
npm run dev

# Terminal 3 - Tests (opcional)
cd api
npm run test:flow
```

---

## 🔧 API - Comandos NPM

### Desarrollo
```bash
npm run dev              # Iniciar servidor dev con hot reload
npm run build           # Build para producción
npm start              # Iniciar servidor producción
```

### Figma Webhooks
```bash
npm run webhook:setup   # Setup automático de webhooks
npm run webhook:verify  # Verificar configuración
npm run webhook:list    # Listar webhooks existentes
npm run webhook delete <webhook-id>  # Eliminar webhook específico
```

### Testing
```bash
npm run test:flow      # Test completo del flujo de actualización
npm test              # Ejecutar tests unitarios
npm run test:watch    # Tests en modo watch
```

### Código
```bash
npm run lint          # Lint TypeScript
npm run format        # Formatear código con Prettier
```

---

## 🎨 Frontend - Comandos NPM

```bash
npm run dev           # Iniciar dev server (puerto 5173)
npm run build         # Build para producción
npm run preview       # Preview del build de producción
```

---

## 🌐 API Endpoints - cURL Examples

### Health Check
```bash
curl http://localhost:3001/health
```

### Manual Component Update
```bash
curl -X POST http://localhost:3001/v1/webhooks/manual-update \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "componentId": "button-primary",
    "componentData": {
      "name": "Primary Button",
      "version": "1.0.0",
      "category": "buttons"
    },
    "changeType": "create",
    "description": "Creating primary button component"
  }'
```

### AI-Generated Component
```bash
curl -X POST http://localhost:3001/v1/webhooks/ai-update \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "prompt": "Create a success alert component with green theme",
    "generatedComponent": {
      "name": "SuccessAlert",
      "react": "export function SuccessAlert() { ... }",
      "html": "<div class=\"alert-success\">...</div>",
      "css": ".alert-success { background: #dcfce7; }"
    }
  }'
```

### Get Event History
```bash
# Últimos 10 eventos
curl http://localhost:3001/v1/webhooks/events?limit=10

# Solo eventos de Figma
curl http://localhost:3001/v1/webhooks/events?source=figma

# Solo eventos manuales
curl http://localhost:3001/v1/webhooks/events?source=manual

# Solo eventos de IA
curl http://localhost:3001/v1/webhooks/events?source=ai-prompt
```

### Version Management
```bash
# Listar todas las versiones
curl http://localhost:3001/v1/versions

# Obtener versión específica
curl http://localhost:3001/v1/versions/1.0.0

# Obtener última versión
curl http://localhost:3001/v1/versions/latest/info

# Comparar versiones
curl http://localhost:3001/v1/versions/compare/1.0.0/2.0.0

# Obtener guía de migración
curl http://localhost:3001/v1/versions/migrate/1.0.0/2.0.0

# Crear nueva versión
curl -X POST http://localhost:3001/v1/versions \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "version": "1.1.0",
    "changelog": [
      {
        "type": "added",
        "componentName": "New Button",
        "description": "Added new button variant",
        "impact": "minor"
      }
    ]
  }'

# Publicar versión
curl -X POST http://localhost:3001/v1/versions/1.1.0/publish \
  -H "x-api-key: YOUR_API_KEY"

# Verificar actualizaciones
curl -X POST http://localhost:3001/v1/versions/check-updates \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "currentVersion": "1.0.0",
    "components": ["button", "alert", "modal"]
  }'
```

### Notifications
```bash
# Suscribirse a notificaciones
curl -X POST http://localhost:3001/v1/notifications/subscribe \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "userId": "user-123",
    "email": "developer@example.com",
    "channels": ["email", "webhook"],
    "events": ["version.published", "breaking.change"],
    "minSeverity": "warning"
  }'

# Obtener notificaciones de usuario
curl http://localhost:3001/v1/notifications/user-123 \
  -H "x-api-key: YOUR_API_KEY"

# Obtener solo no leídas
curl http://localhost:3001/v1/notifications/user-123?unreadOnly=true \
  -H "x-api-key: YOUR_API_KEY"

# Marcar como leídas
curl -X POST http://localhost:3001/v1/notifications/mark-read \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "notificationIds": ["notif_123", "notif_456"]
  }'

# Actualizar suscripción
curl -X PATCH http://localhost:3001/v1/notifications/subscriptions/sub_123 \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "events": ["version.published"],
    "minSeverity": "critical"
  }'

# Eliminar suscripción
curl -X DELETE http://localhost:3001/v1/notifications/subscriptions/sub_123 \
  -H "x-api-key: YOUR_API_KEY"
```

---

## 🔐 Generar API Keys Seguros

### OpenSSL (macOS/Linux)
```bash
# API Key
openssl rand -hex 32

# Webhook Secret  
openssl rand -hex 32
```

### Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Online (para testing)
```bash
# Usar: https://randomkeygen.com/
# Seleccionar: "CodeIgniter Encryption Keys"
```

---

## 🗂️ Gestión de Archivos

### Logs
```bash
# Ver logs de API en tiempo real
tail -f api.log

# Ver logs de Frontend
tail -f frontend.log

# Limpiar logs
rm api.log frontend.log
```

### Environment Variables
```bash
# Copiar template
cp api/.env.example api/.env

# Editar .env
nano api/.env
# o
vim api/.env
# o
code api/.env  # Si usas VS Code
```

### Base de datos (si usas PostgreSQL)
```bash
# Crear base de datos
createdb strata_ds

# Conectar
psql -d strata_ds

# Backup
pg_dump strata_ds > backup.sql

# Restore
psql strata_ds < backup.sql
```

---

## 🐳 Docker

### Development
```bash
# Iniciar con Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Rebuild
docker-compose up -d --build
```

### Production
```bash
# Build
docker-compose -f docker-compose.prod.yml build

# Iniciar
docker-compose -f docker-compose.prod.yml up -d

# Escalar API
docker-compose -f docker-compose.prod.yml up -d --scale api=3
```

---

## 🔍 Debugging

### Verificar puertos en uso
```bash
# macOS/Linux
lsof -i :3001  # API
lsof -i :5173  # Frontend

# Windows
netstat -ano | findstr :3001
netstat -ano | findstr :5173
```

### Matar proceso en puerto
```bash
# macOS/Linux
kill -9 $(lsof -ti:3001)

# Windows
# Usar el PID del comando anterior
taskkill /PID <PID> /F
```

### Verificar variables de entorno
```bash
# Ver todas las variables
cat api/.env

# Ver variable específica (en bash)
source api/.env && echo $FIGMA_ACCESS_TOKEN
```

### Test endpoints manualmente
```bash
# Test health
curl -v http://localhost:3001/health

# Test con headers
curl -v -H "x-api-key: YOUR_KEY" http://localhost:3001/v1/versions

# Test POST con datos
curl -v -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_KEY" \
  -d '{"test": "data"}' \
  http://localhost:3001/v1/webhooks/manual-update
```

---

## 📊 Monitoring

### API Health Check (con watch)
```bash
# Verificar cada 2 segundos
watch -n 2 curl -s http://localhost:3001/health
```

### Ver requests en tiempo real
```bash
# Con httpie (instalar: brew install httpie)
http --stream http://localhost:3001/health

# Con curl
while true; do
  curl -s http://localhost:3001/health | jq
  sleep 2
done
```

---

## 🧹 Mantenimiento

### Limpiar node_modules
```bash
# Frontend
rm -rf node_modules
npm install

# Backend
rm -rf api/node_modules
cd api && npm install && cd ..

# Ambos
rm -rf node_modules api/node_modules
npm install && cd api && npm install && cd ..
```

### Limpiar builds
```bash
# Frontend
rm -rf dist

# Backend
rm -rf api/dist

# Ambos
rm -rf dist api/dist
```

### Reset completo
```bash
# ⚠️ CUIDADO: Esto borra TODO
rm -rf node_modules api/node_modules dist api/dist
rm -rf api/.env .env
rm -rf *.log

# Reinstalar desde cero
npm install
cd api && npm install && cd ..
cp api/.env.example api/.env
# Editar .env manualmente
```

---

## 🚀 Deployment

### Vercel (Frontend)
```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Railway (Backend)
```bash
# Instalar CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Heroku (Backend)
```bash
# Crear app
heroku create strata-ds-api

# Deploy
git push heroku main

# Ver logs
heroku logs --tail

# Escalar
heroku ps:scale web=2
```

---

## 🔧 Git Workflow

### Setup inicial
```bash
git init
git add .
git commit -m "feat: initial implementation of update system"
```

### Crear feature branch
```bash
git checkout -b feature/figma-webhooks
# ... hacer cambios
git add .
git commit -m "feat: implement figma webhook integration"
git push origin feature/figma-webhooks
```

### Tags para versiones
```bash
# Crear tag
git tag -a v1.0.0 -m "Version 1.0.0 - Initial release"

# Push tags
git push --tags

# Listar tags
git tag -l
```

---

## 📚 Comandos de Documentación

### Ver documentación en terminal
```bash
# Quickstart
cat QUICKSTART.md

# Setup guide
cat SETUP_GUIDE.md

# Arquitectura
cat ARCHITECTURE_STRATEGY.md

# Este archivo
cat COMMANDS_REFERENCE.md
```

### Abrir en navegador (macOS)
```bash
open http://localhost:3001/api-docs  # Swagger docs
open http://localhost:5173           # Frontend
```

---

## ⚡ Atajos Útiles

### Restart completo
```bash
# Parar todo (Ctrl+C en cada terminal)
# Luego:
./start.sh
```

### Test rápido
```bash
cd api && npm run test:flow && cd ..
```

### Ver todo funcionando
```bash
# Terminal 1
cd api && npm run dev

# Terminal 2  
npm run dev

# Terminal 3
cd api && npm run test:flow

# Abrir navegador
open http://localhost:5173
```

---

## 🆘 Comandos de Emergencia

### Si nada funciona
```bash
# 1. Parar todo
pkill -f node

# 2. Limpiar
rm -rf node_modules api/node_modules
rm -rf dist api/dist
rm -rf *.log

# 3. Reinstalar
npm install
cd api && npm install && cd ..

# 4. Verificar .env
cat api/.env

# 5. Reiniciar
./start.sh
```

### Ver qué está corriendo
```bash
# Procesos Node
ps aux | grep node

# Puertos en uso
lsof -i -P | grep LISTEN

# Todo junto
ps aux | grep node && lsof -i -P | grep LISTEN
```

---

## 📋 Checklist Rápido

```bash
# ✅ Verificar instalación
node --version  # Debe ser 18+
npm --version   # Debe ser 9+

# ✅ Verificar archivos
ls api/.env     # Debe existir
ls .env         # Debe existir

# ✅ Verificar servidores
curl http://localhost:3001/health  # Debe retornar 200
curl http://localhost:5173         # Debe retornar HTML

# ✅ Verificar tests
cd api && npm run test:flow  # Debe pasar 9/9
```

---

**Tip:** Guarda este archivo como referencia rápida. Todos estos comandos están probados y funcionan. 🚀
