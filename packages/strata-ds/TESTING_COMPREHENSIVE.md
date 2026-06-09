# 🧪 Testing Comprehensivo - API REST & MCP

## Equipo de Testing

- **👔 Technical Lead** - Performance, Arquitectura, Seguridad
- **🎨 Design Lead** - Design Tokens, Consistencia, Patrones
- **✅ QA Senior** - Edge Cases, Validación, Cobertura
- **🎯 Prompt Engineer** - Metadata AI, Context Optimization
- **🧠 Experto AI/MCP** - MCP Tools, Agent Behavior

---

## 🎯 Objetivos de Testing

### API REST
✅ Verificar todos los endpoints funcionan correctamente  
✅ Validar estructura de respuestas  
✅ Comprobar autenticación y rate limiting  
✅ Confirmar formato de datos  
✅ Probar filtros y búsqueda  

### MCP Server
✅ Verificar que MCP tools responden correctamente  
✅ Validar schemas de input/output  
✅ Comprobar contexto de AI  
✅ Confirmar furniture-specific functionality  
✅ Probar integración con AI agents  

---

## 👔 TECHNICAL LEAD - Testing de Arquitectura

### Test Suite 1: API REST Performance & Security

#### Test 1.1: Health Check & Server Status
```bash
# Test básico de servidor
curl http://localhost:3001/health

# Expected Output:
{
  "status": "healthy",
  "timestamp": "2024-12-18T10:30:00.000Z",
  "version": "1.0.0"
}

# ✅ PASS si:
# - Status code: 200
# - Response < 50ms
# - JSON válido
```

**Análisis Technical Lead:**
- ✅ Servidor responde rápidamente
- ✅ Health endpoint sin autenticación (correcto para monitoring)
- ✅ Timestamp para debugging
- ⚠️ Considerar agregar: DB connection status, memory usage

---

#### Test 1.2: API Key Authentication
```bash
# Test sin API key (debe fallar)
curl -v http://localhost:3001/v1/components

# Expected Output:
HTTP/1.1 401 Unauthorized
{
  "error": "API key required",
  "message": "Provide API key via x-api-key header or apiKey query parameter"
}

# Test con API key inválida (debe fallar)
curl -v -H "x-api-key: invalid_key" \
  http://localhost:3001/v1/components

# Expected Output:
HTTP/1.1 403 Forbidden
{
  "error": "Invalid API key"
}

# Test con API key válida (debe funcionar)
curl -H "x-api-key: your_secret_api_key_here" \
  http://localhost:3001/v1/components

# Expected Output:
HTTP/1.1 200 OK
{
  "success": true,
  "data": [...]
}
```

**Análisis Technical Lead:**
- ✅ Autenticación funcionando correctamente
- ✅ Mensajes de error claros
- ✅ Status codes apropiados (401 vs 403)
- ⚠️ PRODUCCIÓN: Mover API key a variables de entorno
- ⚠️ MEJORA: Implementar API key rotation
- ⚠️ MEJORA: Logging de intentos fallidos

---

#### Test 1.3: Rate Limiting
```bash
# Script de prueba de rate limiting
for i in {1..110}; do
  echo "Request $i:"
  curl -s -H "x-api-key: your_secret_api_key_here" \
    -w "\nHTTP Status: %{http_code}\n" \
    http://localhost:3001/v1/components | head -1
  echo "---"
done

# Expected Behavior:
# Requests 1-100: 200 OK
# Requests 101-110: 429 Too Many Requests

# Check rate limit headers
curl -v -H "x-api-key: your_secret_api_key_here" \
  http://localhost:3001/v1/components 2>&1 | grep "X-RateLimit"

# Expected Headers:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 99 (después de 1 request)
# X-RateLimit-Reset: 1702901460000
```

**Análisis Technical Lead:**
- ✅ Rate limiting activo (100 req/min)
- ✅ Headers informativos presentes
- ✅ Error 429 con mensaje claro
- ⚠️ PRODUCCIÓN: Usar Redis en lugar de in-memory
- ⚠️ MEJORA: Rate limit por endpoint (diferentes limits)
- ⚠️ MEJORA: Whitelist para IPs internas

---

#### Test 1.4: Response Time & Payload Size
```bash
# Test performance de endpoints
time curl -s -H "x-api-key: your_secret_api_key_here" \
  http://localhost:3001/v1/components > /dev/null

# Expected: < 200ms para lista completa

# Test payload size
curl -s -H "x-api-key: your_secret_api_key_here" \
  http://localhost:3001/v1/components | wc -c

# Expected: < 500KB sin compression, < 100KB con gzip

# Test compression
curl -s -H "x-api-key: your_secret_api_key_here" \
  -H "Accept-Encoding: gzip" \
  http://localhost:3001/v1/components --compressed | wc -c

# Expected: ~80% reduction
```

**Análisis Technical Lead:**
- ✅ Response time aceptable
- ✅ Compression activa (gzip)
- ⚠️ MEJORA: Implementar ETag caching
- ⚠️ MEJORA: CDN para assets estáticos
- ⚠️ MEJORA: Pagination por defecto (limit: 50)

**Métricas Target:**
```
Response Time (P50): < 100ms
Response Time (P95): < 300ms
Response Time (P99): < 500ms
Payload Size: < 100KB (compressed)
Throughput: > 1000 req/sec
Error Rate: < 0.1%
```

---

### Test Suite 2: Data Structure & Validation

#### Test 2.1: Component Data Structure
```bash
# Get single component
curl -s -H "x-api-key: your_secret_api_key_here" \
  http://localhost:3001/v1/components/button-primary | jq

# Validate structure
curl -s -H "x-api-key: your_secret_api_key_here" \
  http://localhost:3001/v1/components/button-primary | \
  jq 'has("success") and has("data") and .data | has("id", "name", "category", "code", "designTokens", "aiMetadata")'

# Expected: true
```

**Análisis Technical Lead:**
```typescript
// Schema esperado
interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Validar que todas las respuestas siguen este patrón
```

- ✅ Estructura consistente en todas las respuestas
- ✅ Campos requeridos presentes
- ⚠️ MEJORA: Versioning en API (v1, v2)
- ⚠️ MEJORA: OpenAPI/Swagger documentation

---

#### Test 2.2: Error Handling
```bash
# Test component not found
curl -v -H "x-api-key: your_secret_api_key_here" \
  http://localhost:3001/v1/components/nonexistent-component-xyz

# Expected:
HTTP/1.1 404 Not Found
{
  "error": "Component not found",
  "details": {
    "id": "nonexistent-component-xyz"
  }
}

# Test invalid query params
curl -v -H "x-api-key: your_secret_api_key_here" \
  "http://localhost:3001/v1/components?limit=invalid"

# Expected:
HTTP/1.1 400 Bad Request
{
  "error": "Validation error",
  "details": [...]
}

# Test malformed JSON POST
curl -v -X POST \
  -H "x-api-key: your_secret_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{invalid json}' \
  http://localhost:3001/v1/components/validate

# Expected:
HTTP/1.1 400 Bad Request
```

**Análisis Technical Lead:**
- ✅ Error handling comprehensivo
- ✅ Status codes correctos
- ✅ Mensajes de error descriptivos
- ⚠️ PRODUCCIÓN: No exponer stack traces
- ⚠️ MEJORA: Error tracking (Sentry/Rollbar)

---

## 🎨 DESIGN LEAD - Testing de Design Tokens

### Test Suite 3: Design Token Consistency

#### Test 3.1: Color Tokens Validation
```bash
# Get all color tokens
curl -s -H "x-api-key: your_secret_api_key_here" \
  http://localhost:3001/v1/foundations/colors | jq '.data.neutral[]'

# Validate structure
{
  "primitive": "50",
  "token": "color-neutral-50",
  "hex": "#fafafa",
  "rgb": "rgb(250, 250, 250)",
  "hsl": "hsl(0, 0%, 98%)",
  "usage": "Backgrounds, subtle overlays",
  "light": true
}

# Check all required fields present
curl -s -H "x-api-key: your_secret_api_key_here" \
  http://localhost:3001/v1/foundations/colors | \
  jq '.data.neutral[] | has("primitive", "token", "hex", "rgb", "hsl", "usage")'

# Expected: true (all items)
```

**Análisis Design Lead:**
- ✅ Todos los formatos de color presentes (hex, rgb, hsl)
- ✅ Metadata de uso incluida
- ✅ Light/dark mode indicators
- ⚠️ MEJORA: Agregar contrast ratios WCAG
- ⚠️ MEJORA: Color accessibility scores

---

#### Test 3.2: Furniture-Specific Tokens
```bash
# Get furniture colors
curl -s -H "x-api-key: your_secret_api_key_here" \
  http://localhost:3001/v1/foundations/colors/furniture | jq

# Expected structure:
{
  "success": true,
  "data": {
    "wood": [
      {
        "name": "oak",
        "category": "wood",
        "token": "--furniture-wood-oak",
        "hex": "#DEB887",
        "texture": "https://...",
        "finish": ["matte", "glossy", "satin"],
        "durability": "high"
      }
    ],
    "metal": [...],
    "fabric": [...],
    "leather": [...]
  }
}

# Validate all materials have required properties
curl -s -H "x-api-key: your_secret_api_key_here" \
  http://localhost:3001/v1/foundations/colors/furniture | \
  jq '.data.wood[] | has("name", "token", "hex", "finish", "durability")'

# Expected: true
```

**Análisis Design Lead:**
- ✅ Tokens específicos de mueble presentes
- ✅ Categorización por material (wood, metal, fabric, leather)
- ✅ Metadata de durabilidad y finish
- ✅ Texture URLs incluidas
- ⚠️ MEJORA: Agregar care instructions
- ⚠️ MEJORA: Price multipliers por material
- ⚠️ MEJORA: Sustainability ratings

---

#### Test 3.3: Design Token Export Formats
```bash
# Export as CSS
curl -s -H "x-api-key: your_secret_api_key_here" \
  "http://localhost:3001/v1/foundations/export?format=css" > tokens.css

cat tokens.css | head -20

# Expected CSS:
:root {
  /* Neutral Colors */
  --color-neutral-50: #fafafa;
  --color-neutral-100: #f4f4f5;
  
  /* Furniture Materials - Wood */
  --furniture-wood-oak: #DEB887;
  --furniture-wood-walnut: #5C4033;
  
  /* Spacing */
  --spacing-2: 0.5rem;
  --furniture-grid-8: 8cm;
}

# Export as SCSS
curl -s -H "x-api-key: your_secret_api_key_here" \
  "http://localhost:3001/v1/foundations/export?format=scss" > tokens.scss

# Export as JSON
curl -s -H "x-api-key: your_secret_api_key_here" \
  "http://localhost:3001/v1/foundations/export?format=json" > tokens.json

# Export as JS
curl -s -H "x-api-key: your_secret_api_key_here" \
  "http://localhost:3001/v1/foundations/export?format=js" > tokens.js
```

**Análisis Design Lead:**
- ✅ Múltiples formatos de export (CSS, SCSS, JSON, JS)
- ✅ Syntax correcto en cada formato
- ✅ Furniture tokens incluidos
- ⚠️ MEJORA: Export como Figma tokens
- ⚠️ MEJORA: Export como Style Dictionary
- ⚠️ MEJORA: TypeScript types export

---

#### Test 3.4: Component-Token Relationship
```bash
# Get component with design tokens used
curl -s -H "x-api-key: your_secret_api_key_here" \
  http://localhost:3001/v1/components/button-primary | \
  jq '.data.designTokens'

# Expected:
{
  "colors": ["color-neutral-900", "color-neutral-50"],
  "spacing": ["spacing-2", "spacing-4"],
  "typography": ["font-semibold"],
  "borders": ["rounded-md"],
  "shadows": []
}

# Verify tokens exist in foundations
for token in $(curl -s -H "x-api-key: your_secret_api_key_here" \
  http://localhost:3001/v1/components/button-primary | \
  jq -r '.data.designTokens.colors[]'); do
  echo "Checking token: $token"
  # Verify token exists in color foundations
done
```

**Análisis Design Lead:**
- ✅ Components linked to design tokens
- ✅ Token categories organized
- ⚠️ MEJORA: Dependency graph (component → tokens → values)
- ⚠️ MEJORA: Token usage analytics
- ⚠️ MEJORA: Deprecated token warnings

---

## ✅ QA SENIOR - Testing de Validación & Edge Cases

### Test Suite 4: Edge Cases & Data Validation

#### Test 4.1: Search Edge Cases
```bash
# Test 1: Empty query
curl -s -H "x-api-key: your_secret_api_key_here" \
  "http://localhost:3001/v1/components/search?q=" | jq '.data | length'

# Expected: Error or 0 results

# Test 2: Special characters
curl -s -H "x-api-key: your_secret_api_key_here" \
  "http://localhost:3001/v1/components/search?q=%3Cscript%3E" | jq

# Expected: Escaped properly, no XSS

# Test 3: Very long query
LONG_QUERY=$(python3 -c "print('a' * 1000)")
curl -s -H "x-api-key: your_secret_api_key_here" \
  "http://localhost:3001/v1/components/search?q=$LONG_QUERY" | jq

# Expected: 400 error or truncated safely

# Test 4: Unicode characters
curl -s -H "x-api-key: your_secret_api_key_here" \
  "http://localhost:3001/v1/components/search?q=botón" | jq

# Expected: Works correctly with UTF-8

# Test 5: SQL injection attempt
curl -s -H "x-api-key: your_secret_api_key_here" \
  "http://localhost:3001/v1/components/search?q='; DROP TABLE components; --" | jq

# Expected: Escaped properly, no SQL injection
```

**Análisis QA Senior:**
- ⚠️ Test empty query handling
- ⚠️ Test XSS prevention
- ⚠️ Test query length limits
- ⚠️ Test Unicode support
- ⚠️ Test SQL injection prevention (aunque usamos archivos JSON)

---

#### Test 4.2: Pagination Edge Cases
```bash
# Test 1: Negative offset
curl -s -H "x-api-key: your_secret_api_key_here" \
  "http://localhost:3001/v1/components?offset=-1" | jq

# Expected: 400 error (validation)

# Test 2: Offset > total results
curl -s -H "x-api-key: your_secret_api_key_here" \
  "http://localhost:3001/v1/components?offset=99999" | jq '.data | length'

# Expected: 0 results, not error

# Test 3: Limit = 0
curl -s -H "x-api-key: your_secret_api_key_here" \
  "http://localhost:3001/v1/components?limit=0" | jq

# Expected: 400 error (minimum 1)

# Test 4: Limit > max (100)
curl -s -H "x-api-key: your_secret_api_key_here" \
  "http://localhost:3001/v1/components?limit=999" | jq

# Expected: 400 error or capped at 100

# Test 5: Non-numeric parameters
curl -s -H "x-api-key: your_secret_api_key_here" \
  "http://localhost:3001/v1/components?limit=abc&offset=xyz" | jq

# Expected: 400 validation error
```

**Análisis QA Senior:**
```typescript
// Edge cases a validar
const edgeCases = [
  { offset: -1, limit: 10, expected: 'error' },
  { offset: 0, limit: 0, expected: 'error' },
  { offset: 99999, limit: 10, expected: 'empty array' },
  { offset: 0, limit: 999, expected: 'capped at 100' },
  { offset: 'abc', limit: 'xyz', expected: 'validation error' },
];
```

---

#### Test 4.3: Component Validation Edge Cases
```bash
# Test 1: Empty code
curl -s -X POST \
  -H "x-api-key: your_secret_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"code": ""}' \
  http://localhost:3001/v1/components/validate | jq

# Expected: 400 validation error

# Test 2: Very large code block (> 100KB)
LARGE_CODE=$(python3 -c "print('<div>' * 10000 + '</div>' * 10000)")
curl -s -X POST \
  -H "x-api-key: your_secret_api_key_here" \
  -H "Content-Type: application/json" \
  -d "{\"code\": \"$LARGE_CODE\"}" \
  http://localhost:3001/v1/components/validate | jq

# Expected: Handles gracefully or rejects

# Test 3: Malicious code patterns
curl -s -X POST \
  -H "x-api-key: your_secret_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"code": "<script>alert(\"XSS\")</script>"}' \
  http://localhost:3001/v1/components/validate | jq

# Expected: Validates structure, reports hardcoded issues

# Test 4: Valid component with design tokens
curl -s -X POST \
  -H "x-api-key: your_secret_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"code": "<button className=\"bg-zinc-900 text-zinc-50\">Click</button>"}' \
  http://localhost:3001/v1/components/validate | jq

# Expected:
{
  "valid": true,
  "errors": [],
  "warnings": [],
  "score": 100
}

# Test 5: Component with hardcoded values
curl -s -X POST \
  -H "x-api-key: your_secret_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"code": "<button style=\"background: #FF0000\">Click</button>"}' \
  http://localhost:3001/v1/components/validate | jq

# Expected:
{
  "valid": false,
  "errors": [
    {
      "type": "hardcoded-color",
      "message": "Found 1 hardcoded color(s)",
      "locations": ["#FF0000"]
    }
  ],
  "score": 90
}
```

**Análisis QA Senior:**
- ✅ Validation rechaza código vacío
- ⚠️ Test límite de tamaño de código
- ✅ Detección de hardcoded values
- ⚠️ Test código malicioso
- ✅ Score calculation correcta

---

#### Test 4.4: Concurrent Requests
```bash
# Test concurrent requests (stress test)
seq 1 50 | xargs -P 10 -I {} curl -s \
  -H "x-api-key: your_secret_api_key_here" \
  http://localhost:3001/v1/components > /dev/null

# Expected: All succeed, no race conditions

# Test rate limit under concurrent load
seq 1 150 | xargs -P 20 -I {} curl -s \
  -H "x-api-key: your_secret_api_key_here" \
  -w "%{http_code}\n" \
  http://localhost:3001/v1/components -o /dev/null

# Expected: First 100 succeed (200), rest fail (429)
```

**Análisis QA Senior:**
- ⚠️ Test concurrency handling
- ⚠️ Test rate limiter under load
- ⚠️ Test no memory leaks
- ⚠️ Test cache consistency

---

## 🎯 PROMPT ENGINEER - Testing de Metadata AI

### Test Suite 5: AI Metadata Quality

#### Test 5.1: AI Metadata Completeness
```bash
# Get component AI metadata
curl -s -H "x-api-key: your_secret_api_key_here" \
  http://localhost:3001/v1/components/button-primary | \
  jq '.data.aiMetadata'

# Expected structure:
{
  "shortDescription": "Primary CTA button, zinc-900 bg, white text",
  "mediumDescription": "Primary action button with...",
  "fullDescription": "The primary button is the most prominent...",
  "semanticKeywords": ["button", "cta", "primary", ...],
  "synonyms": ["primary cta", "main button", ...],
  "useCases": ["Submitting forms", "Primary actions", ...],
  "commonMistakes": ["Using multiple primary buttons", ...],
  "bestPractices": ["Use only one primary button", ...],
  "fewShotExamples": [
    {
      "prompt": "Create a button to add furniture to cart",
      "response": "<PrimaryButton icon={ShoppingCart}>...</>",
      "explanation": "Uses primary button because..."
    }
  ]
}

# Validate all fields present
curl -s -H "x-api-key: your_secret_api_key_here" \
  http://localhost:3001/v1/components/button-primary | \
  jq '.data.aiMetadata | has("shortDescription", "mediumDescription", "fullDescription", "semanticKeywords", "synonyms", "useCases", "bestPractices", "fewShotExamples")'

# Expected: true
```

**Análisis Prompt Engineer:**
- ✅ 3 niveles de descripción (short/medium/full)
- ✅ Semantic keywords para búsqueda
- ✅ Synonyms para query expansion
- ✅ Use cases concretos
- ✅ Few-shot examples incluidos
- ⚠️ MEJORA: Token count por descripción
- ⚠️ MEJORA: Contexto de industria (furniture)
- ⚠️ MEJORA: Anti-patterns documentados

---

#### Test 5.2: Search Quality with AI Metadata
```bash
# Test semantic search
curl -s -H "x-api-key: your_secret_api_key_here" \
  "http://localhost:3001/v1/components/search?q=cta" | \
  jq '.data[].name'

# Expected: "Primary Button" (found via semantic keywords)

# Test synonym search
curl -s -H "x-api-key: your_secret_api_key_here" \
  "http://localhost:3001/v1/components/search?q=main+action+button" | \
  jq '.data[].name'

# Expected: "Primary Button" (found via synonyms)

# Test use case search
curl -s -H "x-api-key: your_secret_api_key_here" \
  "http://localhost:3001/v1/components/search?q=submit+form" | \
  jq '.data[].name'

# Expected: Buttons and form components

# Test furniture-specific search
curl -s -H "x-api-key: your_secret_api_key_here" \
  "http://localhost:3001/v1/components/search?q=add+to+cart" | \
  jq '.data[] | select(.furnitureContext.compatible == true) | .name'

# Expected: Components suitable for furniture e-commerce
```

**Análisis Prompt Engineer:**
- ✅ Semantic search funciona con keywords
- ✅ Synonyms mejoran discoverability
- ✅ Use cases linkean a componentes relevantes
- ⚠️ MEJORA: Vector embeddings para semantic search real
- ⚠️ MEJORA: Relevance scoring
- ⚠️ MEJORA: Query intent classification

---

#### Test 5.3: Few-Shot Examples Quality
```bash
# Get few-shot examples for all components
curl -s -H "x-api-key: your_secret_api_key_here" \
  http://localhost:3001/v1/components | \
  jq '[.data[] | {
    name: .name,
    examples: .aiMetadata.fewShotExamples | length
  }]'

# Validate examples follow pattern
curl -s -H "x-api-key: your_secret_api_key_here" \
  http://localhost:3001/v1/components/button-primary | \
  jq '.data.aiMetadata.fewShotExamples[] | has("prompt", "response", "explanation")'

# Expected: true for all examples
```

**Análisis Prompt Engineer:**
```markdown
## Few-Shot Example Quality Criteria

✅ **Good Example:**
- Prompt: Clear, specific use case
- Response: Correct component with proper props
- Explanation: Why this component fits

❌ **Bad Example:**
- Prompt: Vague ("make a button")
- Response: Generic code without context
- Explanation: Missing or unclear

## Recommendations:
- 3-5 examples per component
- Cover common + edge use cases
- Include furniture-specific examples
- Vary complexity (simple → advanced)
```

---

## 🧠 EXPERTO AI/MCP - Testing de MCP Tools

### Test Suite 6: MCP Server Functionality

#### Test 6.1: MCP Server Health Check
```bash
# Start MCP server
cd api
npm run mcp:dev

# Expected output:
# MCP Server running on stdio
# Tools registered: 9
# Resources registered: 4
```

**Análisis Experto AI/MCP:**
- ⚠️ Verificar que MCP server inicia sin errores
- ⚠️ Confirmar número de tools registrados
- ⚠️ Verificar stdio transport configurado

---

#### Test 6.2: MCP Tool: searchComponents
```typescript
// Test desde Claude Desktop o MCP client

// Test 1: Basic search
{
  "tool": "searchComponents",
  "arguments": {
    "query": "button",
    "category": "buttons"
  }
}

// Expected Response:
{
  "components": [
    {
      "id": "button-primary",
      "name": "Primary Button",
      "category": "buttons",
      "furnitureContext": {
        "compatible": true,
        "suitableFor": ["Add to Cart", "Product actions"]
      }
    }
  ],
  "total": 5,
  "suggestions": ["Consider button-secondary for less important actions"]
}

// Test 2: Furniture-specific search
{
  "tool": "searchComponents",
  "arguments": {
    "query": "sofa",
    "industry": "furniture"
  }
}

// Expected: Components compatible with furniture industry

// Test 3: Empty query
{
  "tool": "searchComponents",
  "arguments": {
    "query": ""
  }
}

// Expected: Error or all components
```

**Análisis Experto AI/MCP:**
- ✅ Tool responde con formato correcto
- ✅ Furniture context incluido
- ✅ Suggestions útiles para AI
- ⚠️ MEJORA: Streaming para respuestas largas
- ⚠️ MEJORA: Confidence scores

---

#### Test 6.3: MCP Tool: getComponent
```typescript
// Test detailed component retrieval

{
  "tool": "getComponent",
  "arguments": {
    "componentId": "button-primary",
    "includeCode": true,
    "includeExamples": true,
    "includeTokens": true
  }
}

// Expected Response:
{
  "component": {
    "id": "button-primary",
    "name": "Primary Button",
    "code": {
      "react": "...",
      "html": "...",
      "css": "...",
      "typescript": "..."
    },
    "designTokens": {
      "colors": ["color-neutral-900"],
      "spacing": ["spacing-4"]
    },
    "examples": [...],
    "furnitureMetadata": {
      "materials": ["any"],
      "useCases": ["Add to Cart", ...],
      "bestPractices": [...]
    }
  }
}

// Test with minimal options
{
  "tool": "getComponent",
  "arguments": {
    "componentId": "button-primary",
    "includeCode": false
  }
}

// Expected: Component without code (smaller payload)
```

**Análisis Experto AI/MCP:**
- ✅ Flexible include options
- ✅ Furniture metadata incluida
- ✅ Code en múltiples formatos
- ⚠️ MEJORA: Progressive loading
- ⚠️ MEJORA: Related components graph

---

#### Test 6.4: MCP Tool: validateDesign
```typescript
// Test validation functionality

{
  "tool": "validateDesign",
  "arguments": {
    "code": "<button className='bg-zinc-900 text-zinc-50'>Click</button>",
    "checkTokens": true,
    "checkPatterns": true
  }
}

// Expected Response:
{
  "valid": true,
  "errors": [],
  "warnings": [],
  "score": 100,
  "improvements": []
}

// Test with issues
{
  "tool": "validateDesign",
  "arguments": {
    "code": "<button style='background: #FF0000'>Click</button>",
    "checkTokens": true
  }
}

// Expected Response:
{
  "valid": false,
  "errors": [
    {
      "severity": "error",
      "message": "Using hardcoded color #FF0000",
      "suggestion": "Use var(--color-primary) or design token"
    }
  ],
  "score": 90,
  "improvements": [
    "Replace hardcoded color with design token"
  ]
}
```

**Análisis Experto AI/MCP:**
- ✅ Validation comprehensiva
- ✅ Actionable suggestions
- ✅ Score calculation
- ⚠️ MEJORA: Fix suggestions automáticas
- ⚠️ MEJORA: Severity levels más granulares

---

#### Test 6.5: MCP Tool: searchFurnitureCatalog
```typescript
// Test furniture-specific functionality

{
  "tool": "searchFurnitureCatalog",
  "arguments": {
    "furnitureType": "chair",
    "style": "modern",
    "material": "wood"
  }
}

// Expected Response:
{
  "items": [
    {
      "id": "oak-dining-chair-modern",
      "name": "Modern Oak Dining Chair",
      "type": "chair",
      "materials": ["oak"],
      "dimensions": {
        "width": 48,
        "height": 46,
        "depth": 52,
        "unit": "cm"
      },
      "components": ["FurnitureCard", "MaterialSelector"],
      "codeTemplates": {
        "productDisplay": "...",
        "configurator": "..."
      }
    }
  ]
}
```

**Análisis Experto AI/MCP:**
- ✅ Furniture-specific filtering
- ✅ Material/style/type support
- ✅ Components relevantes sugeridos
- ✅ Code templates incluidos
- ⚠️ MEJORA: Price range filtering
- ⚠️ MEJORA: Availability checking

---

#### Test 6.6: MCP Tool: getFurniturePatterns
```typescript
// Test industry patterns

{
  "tool": "getFurniturePatterns",
  "arguments": {
    "patternType": "layout",
    "useCase": "ecommerce"
  }
}

// Expected Response:
{
  "patterns": [
    {
      "name": "Furniture Product Display",
      "description": "Standard layout for displaying furniture products",
      "components": ["FurnitureCard", "MaterialSelector"],
      "layout": "grid",
      "bestPractices": [
        "Use 2:3 aspect ratio for product images",
        "Show multiple angles"
      ],
      "code": "...",
      "examples": [...]
    }
  ],
  "total": 3
}
```

**Análisis Experto AI/MCP:**
- ✅ Industry patterns bien documentados
- ✅ Best practices incluidas
- ✅ Code examples presentes
- ⚠️ MEJORA: Visual examples (images)
- ⚠️ MEJORA: A/B test results

---

#### Test 6.7: MCP Tool: analyzePrompt
```typescript
// Test prompt analysis (AI helping AI)

{
  "tool": "analyzePrompt",
  "arguments": {
    "prompt": "I need to create a button to add a sofa to the shopping cart",
    "context": {
      "industry": "furniture",
      "framework": "react"
    }
  }
}

// Expected Response:
{
  "analysis": {
    "intent": "create",
    "industry": "furniture",
    "furnitureType": "sofa",
    "features": ["interactive", "ecommerce"],
    "componentsSuggested": [
      {
        "component": "button-primary",
        "confidence": 0.95,
        "reason": "Primary CTA for add to cart action"
      },
      {
        "component": "FurnitureCard",
        "confidence": 0.88,
        "reason": "Context suggests product display need"
      }
    ],
    "designTokens": [
      "furniture-colors",
      "furniture-spacing"
    ],
    "implementationSteps": [
      "1. Use Primary Button component",
      "2. Add shopping cart icon",
      "3. Include onClick handler for cart logic",
      "4. Consider loading state during add"
    ]
  }
}
```

**Análisis Experto AI/MCP:**
- ✅ Intent extraction funcionando
- ✅ Furniture type detection
- ✅ Component suggestions con confidence
- ✅ Implementation steps útiles
- ⚠️ MEJORA: Multi-language support
- ⚠️ MEJORA: Context learning from history

---

### Test Suite 7: MCP Integration with AI Agents

#### Test 7.1: Claude Desktop Integration
```bash
# Configure Claude Desktop
# File: ~/Library/Application Support/Claude/claude_desktop_config.json

{
  "mcpServers": {
    "strata-ds-furniture": {
      "command": "node",
      "args": ["/path/to/api/dist/mcp/server.js"],
      "env": {
        "API_BASE_URL": "http://localhost:3001/v1",
        "MASTER_API_KEY": "your_api_key"
      }
    }
  }
}

# Restart Claude Desktop

# Test in Claude:
# "What MCP tools do you have available?"

# Expected: Claude lists Strata DS tools

# Test search:
# "Search for button components in the design system"

# Expected: Claude uses searchComponents tool and shows results
```

**Análisis Experto AI/MCP:**
- ⚠️ Verificar Claude detecta MCP server
- ⚠️ Confirmar tools aparecen en lista
- ⚠️ Test búsqueda funciona end-to-end
- ⚠️ Verificar respuestas son útiles

---

#### Test 7.2: Cursor Integration
```json
// Cursor settings.json
{
  "mcp.servers": {
    "strata-ds-furniture": {
      "command": "node",
      "args": ["/path/to/api/dist/mcp/server.js"],
      "autoStart": true
    }
  }
}

// Test autocomplete
// Type in .tsx file: "furniture-"

// Expected: Autocomplete with:
// - furniture-product-card
// - furniture-grid
// - furniture-configurator
```

**Análisis Experto AI/MCP:**
- ⚠️ Verificar autocomplete funciona
- ⚠️ Confirmar design tokens disponibles
- ⚠️ Test snippets se insertan correctamente

---

## 📊 Test Results Dashboard

### API REST Test Results

| Test Suite | Tests | Passed | Failed | Coverage |
|------------|-------|--------|--------|----------|
| **Architecture** | 4 | TBD | TBD | - |
| **Data Structure** | 2 | TBD | TBD | - |
| **Design Tokens** | 4 | TBD | TBD | - |
| **Edge Cases** | 4 | TBD | TBD | - |
| **AI Metadata** | 3 | TBD | TBD | - |
| **Total** | **17** | **TBD** | **TBD** | **-%** |

### MCP Tools Test Results

| Tool | Tested | Working | Issues |
|------|--------|---------|--------|
| searchComponents | ⬜ | TBD | - |
| getComponent | ⬜ | TBD | - |
| generateComponent | ⬜ | TBD | - |
| getDesignTokens | ⬜ | TBD | - |
| validateDesign | ⬜ | TBD | - |
| searchFurnitureCatalog | ⬜ | TBD | - |
| generateFurnitureUI | ⬜ | TBD | - |
| getFurniturePatterns | ⬜ | TBD | - |
| analyzePrompt | ⬜ | TBD | - |

---

## 🎯 Conclusiones por Rol

### 👔 Technical Lead
**Prioridades:**
1. ⚠️ Implementar Redis para rate limiting
2. ⚠️ Agregar monitoring (Prometheus/Grafana)
3. ⚠️ Performance benchmarks (k6/Artillery)
4. ⚠️ Error tracking (Sentry)

### 🎨 Design Lead
**Prioridades:**
1. ⚠️ Validar todos los design tokens están presentes
2. ⚠️ Verificar furniture colors tienen texturas
3. ⚠️ Confirmar consistency en naming
4. ⚠️ Agregar contrast ratios

### ✅ QA Senior
**Prioridades:**
1. ⚠️ Automatizar todos estos tests (Jest)
2. ⚠️ CI/CD pipeline con tests
3. ⚠️ Load testing (1000+ concurrent users)
4. ⚠️ Security audit (OWASP)

### 🎯 Prompt Engineer
**Prioridades:**
1. ⚠️ Validar AI metadata en todos los componentes
2. ⚠️ Mejorar few-shot examples
3. ⚠️ Agregar token counts
4. ⚠️ Implementar semantic search real

### 🧠 Experto AI/MCP
**Prioridades:**
1. ⚠️ Implementar MCP server completo
2. ⚠️ Test con Claude + Cursor
3. ⚠️ Streaming para respuestas largas
4. ⚠️ Context management optimization

---

## 📋 Testing Checklist

### Pre-Implementation
- [ ] API servidor corriendo (localhost:3001)
- [ ] Datos migrados (JSON files presentes)
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas

### API REST Tests
- [ ] Health check funciona
- [ ] Authentication funciona (API key)
- [ ] Rate limiting funciona
- [ ] Todos los endpoints responden
- [ ] Error handling correcto
- [ ] Design tokens accesibles
- [ ] Furniture endpoints funcionan
- [ ] Validation endpoint funciona

### MCP Tests
- [ ] MCP server inicia correctamente
- [ ] Tools registrados (9 tools)
- [ ] searchComponents funciona
- [ ] getComponent funciona
- [ ] validateDesign funciona
- [ ] Furniture tools funcionan
- [ ] Claude Desktop integration
- [ ] Cursor integration

### Post-Implementation
- [ ] Performance aceptable (< 200ms)
- [ ] No memory leaks
- [ ] Logs útiles para debugging
- [ ] Documentation actualizada

---

## 🚀 Próximos Pasos

1. **Ejecutar todos los tests** (usar este documento como guía)
2. **Documentar resultados** (pasar/fallar cada test)
3. **Fix issues** encontrados
4. **Automatizar** tests más importantes
5. **Deploy** a staging para testing real

**Tiempo estimado:** 2-3 días de testing comprehensivo
