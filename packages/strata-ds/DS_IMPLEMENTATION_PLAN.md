# 📋 Plan de Implementación Detallado - Design System Optimization

## 🎯 Objetivo

Transformar el Strata DS actual en un sistema **100% consumible** vía API y MCP para:
- 🤖 AI Agents (Claude, ChatGPT, Gemini)
- 💻 Live Coding Tools (Cursor, Windsurf)
- 🎨 Figma Creators
- 🏭 Aplicaciones del Sector Mueble

---

## 📊 FASE 1: Estructuración de Datos (Semana 1-2)

### Día 1-2: Setup & Estructura

#### 1.1 Crear Directorios

```bash
mkdir -p api/src/data/{components,foundations,furniture,patterns}
mkdir -p api/src/schemas
mkdir -p api/src/routes/v1
mkdir -p api/src/services
mkdir -p api/src/utils
```

#### 1.2 Schema Base (TypeScript + Zod)

**Archivo:** `/api/src/schemas/component.schema.ts`

```typescript
import { z } from 'zod';

// Base Component Schema
export const ComponentCodeSchema = z.object({
  react: z.string(),
  html: z.string(),
  css: z.string(),
  typescript: z.string().optional(),
  tailwind: z.string().optional(),
});

export const ComponentVariantSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  preview: z.string().url().optional(),
  code: ComponentCodeSchema,
  designTokens: z.array(z.string()),
  props: z.record(z.any()),
});

export const ComponentPropSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean().default(false),
  default: z.any().optional(),
  description: z.string(),
  options: z.array(z.string()).optional(),
});

export const AccessibilitySchema = z.object({
  wcag: z.enum(['A', 'AA', 'AAA']),
  ariaSupport: z.boolean(),
  keyboardNav: z.boolean(),
  screenReader: z.enum(['full', 'partial', 'none']),
  focusManagement: z.boolean(),
  colorContrast: z.boolean(),
});

export const PerformanceSchema = z.object({
  bundleSize: z.object({
    minified: z.string(),
    gzipped: z.string(),
  }),
  renderTime: z.object({
    average: z.string(),
    p95: z.string(),
  }),
  interactions: z.record(z.string()),
});

export const FurnitureContextSchema = z.object({
  compatible: z.boolean(),
  suitableFor: z.array(z.string()),
  notSuitableFor: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  dimensionConsiderations: z.array(z.string()).optional(),
  industryPatterns: z.array(z.string()).optional(),
});

export const AIMetadataSchema = z.object({
  shortDescription: z.string(), // <50 tokens
  mediumDescription: z.string(), // <200 tokens
  fullDescription: z.string(), // Full context
  semanticKeywords: z.array(z.string()),
  synonyms: z.array(z.string()),
  useCases: z.array(z.string()),
  commonMistakes: z.array(z.string()),
  bestPractices: z.array(z.string()),
  fewShotExamples: z.array(z.object({
    prompt: z.string(),
    response: z.string(),
    explanation: z.string(),
  })),
});

export const ComponentSchema = z.object({
  // Core Identity
  id: z.string(),
  name: z.string(),
  category: z.enum([
    'foundations',
    'buttons',
    'badges',
    'avatars',
    'dividers',
    'app-shells',
    'page-headings',
    'navbars',
    'action-panels',
    'data-tables',
    'stacked-lists',
    'feeds',
    'stats',
    'descriptions',
    'form-layouts',
    'input-groups',
    'selects',
    'file-upload',
    'modals',
    'slide-overs',
    'alerts',
    'breadcrumbs',
    'dropdowns',
    'drag-drop',
    'data-visualization',
  ]),
  subcategory: z.string().optional(),
  
  // Description
  description: z.string(),
  longDescription: z.string().optional(),
  
  // Version
  version: z.string(),
  changelog: z.array(z.object({
    version: z.string(),
    date: z.string(),
    changes: z.array(z.string()),
  })).optional(),
  
  // Code
  code: ComponentCodeSchema,
  variants: z.array(ComponentVariantSchema).optional(),
  
  // Props/API
  props: z.array(ComponentPropSchema).optional(),
  
  // Design Tokens Used
  designTokens: z.object({
    colors: z.array(z.string()).optional(),
    spacing: z.array(z.string()).optional(),
    typography: z.array(z.string()).optional(),
    borders: z.array(z.string()).optional(),
    shadows: z.array(z.string()).optional(),
  }),
  
  // Dependencies
  dependencies: z.object({
    npm: z.array(z.string()).optional(),
    components: z.array(z.string()).optional(),
  }).optional(),
  
  // Metadata
  tags: z.array(z.string()),
  industries: z.array(z.string()).default(['general']),
  complexity: z.enum(['simple', 'medium', 'complex']).default('simple'),
  
  // Furniture-Specific
  furnitureContext: FurnitureContextSchema.optional(),
  
  // Quality
  accessibility: AccessibilitySchema,
  performance: PerformanceSchema.optional(),
  
  // AI/MCP
  aiMetadata: AIMetadataSchema,
  
  // Usage
  examples: z.array(z.object({
    title: z.string(),
    description: z.string(),
    code: z.string(),
    preview: z.string().url().optional(),
  })).optional(),
  
  relatedComponents: z.array(z.string()).optional(),
  
  // Dates
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Component = z.infer<typeof ComponentSchema>;
export type ComponentVariant = z.infer<typeof ComponentVariantSchema>;
export type ComponentProp = z.infer<typeof ComponentPropSchema>;
```

---

### Día 3-5: Convertir Componentes Existentes

#### 1.3 Ejemplo: Button Component JSON

**Archivo:** `/api/src/data/components/buttons.json`

```json
{
  "components": [
    {
      "id": "button-primary",
      "name": "Primary Button",
      "category": "buttons",
      "subcategory": "action",
      "description": "Primary action button for main CTAs and important actions",
      "longDescription": "The primary button is the most prominent button style, used for the main call-to-action on a page or within a section. It should be used sparingly to draw attention to the most important action.",
      "version": "2.0.0",
      "changelog": [
        {
          "version": "2.0.0",
          "date": "2024-12-01",
          "changes": [
            "Added furniture-specific variants",
            "Improved accessibility with focus-visible",
            "Updated design tokens"
          ]
        },
        {
          "version": "1.0.0",
          "date": "2024-01-01",
          "changes": ["Initial release"]
        }
      ],
      "code": {
        "react": "import { Plus, ChevronRight } from 'lucide-react';\n\nexport function PrimaryButton({ children, icon, iconPosition = 'leading', disabled = false, onClick }) {\n  return (\n    <button\n      onClick={onClick}\n      disabled={disabled}\n      className=\"px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-semibold rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2\"\n    >\n      {icon && iconPosition === 'leading' && icon}\n      {children}\n      {icon && iconPosition === 'trailing' && icon}\n    </button>\n  );\n}",
        "typescript": "import { ReactNode } from 'react';\nimport { LucideIcon } from 'lucide-react';\n\ninterface PrimaryButtonProps {\n  children: ReactNode;\n  icon?: LucideIcon;\n  iconPosition?: 'leading' | 'trailing';\n  disabled?: boolean;\n  onClick?: () => void;\n}\n\nexport function PrimaryButton({ children, icon: Icon, iconPosition = 'leading', disabled = false, onClick }: PrimaryButtonProps) {\n  return (\n    <button\n      onClick={onClick}\n      disabled={disabled}\n      className=\"px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-semibold rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2\"\n    >\n      {Icon && iconPosition === 'leading' && <Icon className=\"w-4 h-4\" />}\n      {children}\n      {Icon && iconPosition === 'trailing' && <Icon className=\"w-4 h-4\" />}\n    </button>\n  );\n}",
        "html": "<!-- Basic Primary Button -->\n<button class=\"btn-primary\">\n  Button\n</button>\n\n<!-- With Icon -->\n<button class=\"btn-primary\">\n  <svg class=\"w-4 h-4\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\">\n    <path d=\"M12 5v14M5 12h14\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n  </svg>\n  With Icon\n</button>",
        "css": ".btn-primary {\n  padding: 0.5rem 1rem;\n  background-color: #18181b; /* zinc-900 */\n  color: #fafafa; /* zinc-50 */\n  font-weight: 600;\n  border-radius: 0.375rem;\n  transition: background-color 0.15s;\n  border: none;\n  cursor: pointer;\n  display: inline-flex;\n  align-items: center;\n  gap: 0.5rem;\n}\n\n.btn-primary:hover {\n  background-color: #27272a; /* zinc-800 */\n}\n\n.btn-primary:focus-visible {\n  outline: 2px solid #18181b;\n  outline-offset: 2px;\n}\n\n.btn-primary:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n\n@media (prefers-color-scheme: dark) {\n  .btn-primary {\n    background-color: #fafafa;\n    color: #18181b;\n  }\n  .btn-primary:hover {\n    background-color: #e4e4e7;\n  }\n}",
        "tailwind": "className=\"px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-semibold rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed\""
      },
      "variants": [
        {
          "id": "button-primary-default",
          "name": "Default",
          "description": "Standard primary button",
          "code": {
            "react": "<PrimaryButton>Button</PrimaryButton>",
            "html": "<button class=\"btn-primary\">Button</button>",
            "css": ".btn-primary { ... }"
          },
          "designTokens": ["color-neutral-900", "color-neutral-50"],
          "props": {}
        },
        {
          "id": "button-primary-with-icon",
          "name": "With Icon",
          "description": "Primary button with leading or trailing icon",
          "code": {
            "react": "<PrimaryButton icon={Plus} iconPosition=\"leading\">Add Item</PrimaryButton>",
            "html": "<button class=\"btn-primary\"><svg>...</svg> Add Item</button>",
            "css": ".btn-primary svg { width: 1rem; height: 1rem; }"
          },
          "designTokens": ["color-neutral-900", "color-neutral-50"],
          "props": {
            "icon": "LucideIcon",
            "iconPosition": "leading | trailing"
          }
        }
      ],
      "props": [
        {
          "name": "children",
          "type": "ReactNode",
          "required": true,
          "description": "Button label text"
        },
        {
          "name": "icon",
          "type": "LucideIcon",
          "required": false,
          "description": "Optional icon component"
        },
        {
          "name": "iconPosition",
          "type": "'leading' | 'trailing'",
          "required": false,
          "default": "leading",
          "description": "Position of icon relative to text"
        },
        {
          "name": "disabled",
          "type": "boolean",
          "required": false,
          "default": false,
          "description": "Disabled state"
        },
        {
          "name": "onClick",
          "type": "() => void",
          "required": false,
          "description": "Click handler function"
        }
      ],
      "designTokens": {
        "colors": [
          "color-neutral-900",
          "color-neutral-50",
          "color-neutral-800",
          "color-neutral-200"
        ],
        "spacing": ["spacing-2", "spacing-4"],
        "typography": ["font-semibold"],
        "borders": ["rounded-md"],
        "shadows": []
      },
      "dependencies": {
        "npm": ["lucide-react"],
        "components": []
      },
      "tags": [
        "button",
        "cta",
        "action",
        "primary",
        "interactive",
        "furniture-compatible"
      ],
      "industries": ["general", "furniture", "retail", "b2b"],
      "complexity": "simple",
      "furnitureContext": {
        "compatible": true,
        "suitableFor": [
          "Add to Cart buttons",
          "Apply Configuration in furniture configurators",
          "Submit Orders",
          "Save Custom Designs",
          "Primary CTAs in product pages"
        ],
        "notSuitableFor": [
          "Destructive actions (use danger variant)",
          "Secondary actions (use secondary button)"
        ],
        "materials": ["any"],
        "dimensionConsiderations": [
          "Ensure button is large enough for touch on mobile configurators",
          "Minimum 44x44px touch target"
        ],
        "industryPatterns": [
          "furniture-product-actions",
          "configurator-controls",
          "checkout-flow"
        ]
      },
      "accessibility": {
        "wcag": "AA",
        "ariaSupport": true,
        "keyboardNav": true,
        "screenReader": "full",
        "focusManagement": true,
        "colorContrast": true
      },
      "performance": {
        "bundleSize": {
          "minified": "1.2kb",
          "gzipped": "0.6kb"
        },
        "renderTime": {
          "average": "2ms",
          "p95": "5ms"
        },
        "interactions": {
          "onClick": "<16ms",
          "hover": "<16ms"
        }
      },
      "aiMetadata": {
        "shortDescription": "Primary CTA button, zinc-900 bg, white text, for main actions",
        "mediumDescription": "Primary action button with zinc-900 background (light mode) and zinc-50 background (dark mode). Used for main CTAs and important actions. Supports icons and disabled states. Fully accessible with keyboard navigation and screen reader support.",
        "fullDescription": "The primary button is the most prominent button style in the Strata DS White Label design system. It features a high-contrast zinc-900 background in light mode (inverted to zinc-50 in dark mode) and is designed for main call-to-action purposes. The button includes hover states, focus management, disabled states, and optional icon support. It's built with Tailwind CSS utility classes and follows WCAG AA accessibility standards. In furniture applications, use it for primary actions like 'Add to Cart', 'Apply Configuration', or 'Submit Order'.",
        "semanticKeywords": [
          "primary button",
          "cta",
          "call to action",
          "main action",
          "submit button",
          "action button",
          "furniture cta",
          "add to cart"
        ],
        "synonyms": [
          "primary cta",
          "main button",
          "action button",
          "submit button",
          "cta button"
        ],
        "useCases": [
          "Submitting forms",
          "Primary page actions",
          "CTAs in marketing sections",
          "Add to Cart in e-commerce",
          "Apply changes in configurators",
          "Save custom furniture designs",
          "Checkout flow actions",
          "Create new items",
          "Confirm important actions"
        ],
        "commonMistakes": [
          "Using multiple primary buttons on same page (use only one per section)",
          "Using for destructive actions (use danger variant instead)",
          "Forgetting disabled state for async operations",
          "Not providing aria-label for icon-only buttons",
          "Using for secondary actions (use secondary button)"
        ],
        "bestPractices": [
          "Use only one primary button per section or page",
          "Always provide clear, action-oriented text",
          "Include loading state for async operations",
          "Ensure minimum 44x44px touch target on mobile",
          "Use semantic <button> element, not <div>",
          "Provide visual feedback on hover and focus",
          "Disable during form submission to prevent double-clicks"
        ],
        "fewShotExamples": [
          {
            "prompt": "Create a button to add furniture to cart",
            "response": "<PrimaryButton icon={ShoppingCart}>Add to Cart</PrimaryButton>",
            "explanation": "Uses primary button because adding to cart is the main CTA on a product page. Includes shopping cart icon for visual clarity."
          },
          {
            "prompt": "Button to apply material selection in sofa configurator",
            "response": "<PrimaryButton icon={Check}>Apply Changes</PrimaryButton>",
            "explanation": "Primary button appropriate for confirming configuration changes. Check icon indicates confirmation action."
          },
          {
            "prompt": "Submit custom dining table order",
            "response": "<PrimaryButton icon={ChevronRight} iconPosition=\"trailing\">Submit Order</PrimaryButton>",
            "explanation": "Primary button for order submission. Trailing chevron suggests forward movement in process."
          }
        ]
      },
      "examples": [
        {
          "title": "Basic Primary Button",
          "description": "Standard primary button with text only",
          "code": "<PrimaryButton>Click Me</PrimaryButton>",
          "preview": "https://cdn.strata-ds.com/examples/button-primary-basic.png"
        },
        {
          "title": "Add to Cart - Furniture E-commerce",
          "description": "Primary button for adding furniture item to shopping cart",
          "code": "<PrimaryButton icon={ShoppingCart}>Add to Cart</PrimaryButton>",
          "preview": "https://cdn.strata-ds.com/examples/button-primary-cart.png"
        },
        {
          "title": "Apply Configuration",
          "description": "Button to confirm furniture customization choices",
          "code": "<PrimaryButton icon={Check}>Apply Changes</PrimaryButton>",
          "preview": "https://cdn.strata-ds.com/examples/button-primary-config.png"
        }
      ],
      "relatedComponents": [
        "button-secondary",
        "button-outline",
        "button-ghost",
        "button-danger"
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-12-01T00:00:00Z"
    }
  ]
}
```

---

### Día 6-8: Design Tokens

#### 1.4 Foundations Schema

**Archivo:** `/api/src/schemas/foundation.schema.ts`

```typescript
import { z } from 'zod';

export const ColorTokenSchema = z.object({
  primitive: z.string(), // "50", "100", "200", etc.
  token: z.string(), // "color-neutral-50"
  hex: z.string(),
  rgb: z.string(),
  hsl: z.string(),
  usage: z.string(),
  light: z.boolean().optional(),
  dark: z.boolean().optional(),
  primary: z.boolean().optional(),
});

export const FurnitureMaterialTokenSchema = z.object({
  name: z.string(), // "oak", "walnut"
  category: z.enum(['wood', 'metal', 'fabric', 'leather']),
  token: z.string(), // "--furniture-wood-oak"
  color: z.string(), // hex
  texture: z.string().url().optional(),
  finish: z.array(z.enum(['matte', 'glossy', 'satin', 'brushed', 'polished'])),
  durability: z.enum(['low', 'medium', 'high']),
  careInstructions: z.string().optional(),
});

export const DimensionTokenSchema = z.object({
  token: z.string(), // "--furniture-chair-standard-width"
  value: z.number(),
  unit: z.enum(['cm', 'px', 'rem']),
  valuePx: z.number().optional(),
  valueRem: z.number().optional(),
  usage: z.string(),
});

export const DesignTokensSchema = z.object({
  colors: z.object({
    neutral: z.array(ColorTokenSchema),
    semantic: z.object({
      success: z.array(ColorTokenSchema),
      error: z.array(ColorTokenSchema),
      warning: z.array(ColorTokenSchema),
      info: z.array(ColorTokenSchema),
    }),
    furniture: z.object({
      wood: z.array(FurnitureMaterialTokenSchema),
      metal: z.array(FurnitureMaterialTokenSchema),
      fabric: z.array(FurnitureMaterialTokenSchema),
      leather: z.array(FurnitureMaterialTokenSchema),
    }).optional(),
  }),
  spacing: z.array(z.object({
    token: z.string(),
    value: z.string(),
    valuePx: z.number(),
    usage: z.string(),
  })),
  typography: z.object({
    fontFamilies: z.record(z.string()),
    fontSizes: z.array(z.object({
      name: z.string(),
      token: z.string(),
      value: z.string(),
      lineHeight: z.string(),
    })),
    fontWeights: z.record(z.number()),
  }),
  borders: z.object({
    radius: z.array(z.object({
      name: z.string(),
      token: z.string(),
      value: z.string(),
    })),
    width: z.array(z.object({
      name: z.string(),
      token: z.string(),
      value: z.string(),
    })),
  }),
  shadows: z.array(z.object({
    name: z.string(),
    token: z.string(),
    value: z.string(),
    usage: z.string(),
  })),
  dimensions: z.object({
    furniture: z.record(z.record(z.object({
      width: DimensionTokenSchema,
      height: DimensionTokenSchema,
      depth: DimensionTokenSchema,
    }))).optional(),
  }).optional(),
});

export type DesignTokens = z.infer<typeof DesignTokensSchema>;
```

---

### Día 9-10: Furniture Knowledge Base

**Archivo:** `/api/src/data/furniture/materials.json`

```json
{
  "materials": {
    "wood": [
      {
        "name": "oak",
        "category": "wood",
        "token": "--furniture-wood-oak",
        "color": "#DEB887",
        "texture": "https://cdn.strata-ds.com/textures/oak.jpg",
        "finish": ["matte", "glossy", "satin", "oiled"],
        "durability": "high",
        "careInstructions": "Clean with damp cloth. Avoid direct sunlight.",
        "priceMultiplier": 1.2,
        "sustainability": "A",
        "characteristics": [
          "Strong and durable",
          "Beautiful grain patterns",
          "Natural warm tones",
          "Ages beautifully"
        ]
      },
      {
        "name": "walnut",
        "category": "wood",
        "token": "--furniture-wood-walnut",
        "color": "#5C4033",
        "texture": "https://cdn.strata-ds.com/textures/walnut.jpg",
        "finish": ["matte", "glossy", "satin"],
        "durability": "high",
        "priceMultiplier": 1.5,
        "sustainability": "B",
        "characteristics": [
          "Rich dark color",
          "Premium appearance",
          "Dense and strong"
        ]
      }
    ],
    "metal": [
      {
        "name": "brass",
        "category": "metal",
        "token": "--furniture-metal-brass",
        "color": "#B5A642",
        "finish": ["brushed", "polished"],
        "durability": "high",
        "careInstructions": "Polish regularly to maintain shine",
        "priceMultiplier": 1.3
      }
    ],
    "fabric": [
      {
        "name": "linen",
        "category": "fabric",
        "token": "--furniture-fabric-linen",
        "color": "#FAF0E6",
        "finish": ["natural"],
        "durability": "medium",
        "careInstructions": "Dry clean recommended",
        "priceMultiplier": 1.0
      }
    ]
  }
}
```

**Archivo:** `/api/src/data/furniture/dimensions.json`

```json
{
  "furnitureDimensions": {
    "chair": {
      "standard": {
        "width": { "value": 50, "unit": "cm", "token": "--furniture-chair-standard-width" },
        "height": { "value": 45, "unit": "cm", "token": "--furniture-chair-standard-height" },
        "depth": { "value": 55, "unit": "cm", "token": "--furniture-chair-standard-depth" }
      },
      "dining": {
        "width": { "value": 48, "unit": "cm", "token": "--furniture-chair-dining-width" },
        "height": { "value": 46, "unit": "cm", "token": "--furniture-chair-dining-height" },
        "depth": { "value": 52, "unit": "cm", "token": "--furniture-chair-dining-depth" }
      },
      "office": {
        "width": { "value": 60, "unit": "cm", "token": "--furniture-chair-office-width" },
        "height": { "value": 50, "unit": "cm", "token": "--furniture-chair-office-height" },
        "depth": { "value": 60, "unit": "cm", "token": "--furniture-chair-office-depth" }
      }
    },
    "table": {
      "dining": {
        "width": { "value": 180, "unit": "cm", "token": "--furniture-table-dining-width" },
        "height": { "value": 75, "unit": "cm", "token": "--furniture-table-dining-height" },
        "depth": { "value": 90, "unit": "cm", "token": "--furniture-table-dining-depth" }
      },
      "coffee": {
        "width": { "value": 120, "unit": "cm", "token": "--furniture-table-coffee-width" },
        "height": { "value": 45, "unit": "cm", "token": "--furniture-table-coffee-height" },
        "depth": { "value": 60, "unit": "cm", "token": "--furniture-table-coffee-depth" }
      }
    },
    "sofa": {
      "2seat": {
        "width": { "value": 160, "unit": "cm", "token": "--furniture-sofa-2seat-width" },
        "height": { "value": 85, "unit": "cm", "token": "--furniture-sofa-height" },
        "depth": { "value": 90, "unit": "cm", "token": "--furniture-sofa-depth" }
      },
      "3seat": {
        "width": { "value": 220, "unit": "cm", "token": "--furniture-sofa-3seat-width" },
        "height": { "value": 85, "unit": "cm", "token": "--furniture-sofa-height" },
        "depth": { "value": 95, "unit": "cm", "token": "--furniture-sofa-depth" }
      }
    }
  }
}
```

---

## 📊 Próximo Documento

Este es el PLAN DETALLADO para Fase 1 (días 1-10).

¿Quieres que continúe con:
1. **Fase 2:** REST API Implementation (endpoints completos)?
2. **Fase 3:** MCP Server Implementation (código completo)?
3. **Scripts de migración** para convertir componentes existentes a JSON?
4. **Testing suite** para validar todos los datos?

El sistema está diseñado desde las 5 perspectivas profesionales para ser **100% consumible** por AI agents y herramientas del sector mueble.
