# 🔄 Scripts de Migración Automática - Componentes a JSON

## 📋 Objetivo

Convertir automáticamente los componentes actuales del Design System (código React) a formato JSON estructurado consumible vía API/MCP.

---

## 🛠️ Script 1: Migración de Componentes

### Archivo: `/scripts/migrate-components.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';
import { ComponentSchema } from '../api/src/schemas/component.schema';

interface ComponentExtraction {
  id: string;
  name: string;
  category: string;
  code: {
    react: string;
    html: string;
    css: string;
    prompt?: string;
  };
}

/**
 * Extract component data from View files
 */
async function extractComponentFromView(filePath: string): Promise<ComponentExtraction[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  const components: ComponentExtraction[] = [];
  
  // Extract component name from filename
  const fileName = path.basename(filePath, '.tsx');
  const category = fileName.replace('View', '').toLowerCase();
  
  // Regex patterns to extract code blocks
  const reactPattern = /const\s+(\w+)React\s*=\s*`([\s\S]*?)`/g;
  const htmlPattern = /const\s+(\w+)HTML\s*=\s*`([\s\S]*?)`/g;
  const cssPattern = /const\s+(\w+)CSS\s*=\s*`([\s\S]*?)`/g;
  const promptPattern = /const\s+(\w+)Prompt\s*=\s*`([\s\S]*?)`/g;
  
  // Extract React code blocks
  let match;
  const reactBlocks: Record<string, string> = {};
  while ((match = reactPattern.exec(content)) !== null) {
    reactBlocks[match[1]] = match[2];
  }
  
  // Extract HTML code blocks
  const htmlBlocks: Record<string, string> = {};
  while ((match = htmlPattern.exec(content)) !== null) {
    htmlBlocks[match[1]] = match[2];
  }
  
  // Extract CSS code blocks
  const cssBlocks: Record<string, string> = {};
  while ((match = cssPattern.exec(content)) !== null) {
    cssBlocks[match[1]] = match[2];
  }
  
  // Extract AI Prompt blocks
  const promptBlocks: Record<string, string> = {};
  while ((match = promptPattern.exec(content)) !== null) {
    promptBlocks[match[1]] = match[2];
  }
  
  // Match code blocks together (e.g., primaryButtonReact, primaryButtonHTML, primaryButtonCSS)
  for (const [key, reactCode] of Object.entries(reactBlocks)) {
    const baseName = key.replace('React', '');
    const htmlKey = baseName + 'HTML';
    const cssKey = baseName + 'CSS';
    const promptKey = baseName + 'Prompt';
    
    // Convert camelCase to kebab-case for ID
    const id = camelToKebab(baseName);
    
    components.push({
      id: `${category}-${id}`,
      name: camelCaseToTitle(baseName),
      category,
      code: {
        react: reactCode,
        html: htmlBlocks[htmlKey] || '',
        css: cssBlocks[cssKey] || '',
        prompt: promptBlocks[promptKey],
      },
    });
  }
  
  return components;
}

/**
 * Convert camelCase to kebab-case
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Convert camelCase to Title Case
 */
function camelCaseToTitle(str: string): string {
  const result = str.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Parse AI prompt to extract metadata
 */
function parseAIPrompt(prompt: string): {
  description: string;
  requirements: string[];
  useCases: string[];
  bestPractices: string[];
} {
  const lines = prompt.split('\n');
  const result = {
    description: '',
    requirements: [] as string[],
    useCases: [] as string[],
    bestPractices: [] as string[],
  };
  
  let currentSection = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('## CONTEXT')) {
      currentSection = 'description';
    } else if (trimmed.startsWith('## REQUIREMENTS') || trimmed.startsWith('### Visual Design')) {
      currentSection = 'requirements';
    } else if (trimmed.includes('use case') || trimmed.includes('Use Case')) {
      currentSection = 'useCases';
    } else if (trimmed.includes('best practice') || trimmed.includes('Best Practice')) {
      currentSection = 'bestPractices';
    } else if (trimmed.startsWith('-') || trimmed.match(/^\d+\./)) {
      const text = trimmed.replace(/^[-\d.]\s*/, '').replace(/\*\*/g, '');
      if (currentSection === 'requirements') result.requirements.push(text);
      if (currentSection === 'useCases') result.useCases.push(text);
      if (currentSection === 'bestPractices') result.bestPractices.push(text);
    } else if (currentSection === 'description' && trimmed.length > 0) {
      result.description += ' ' + trimmed;
    }
  }
  
  return result;
}

/**
 * Extract design tokens from code
 */
function extractDesignTokens(code: string): {
  colors: string[];
  spacing: string[];
  typography: string[];
  borders: string[];
  shadows: string[];
} {
  const tokens = {
    colors: [] as string[],
    spacing: [] as string[],
    typography: [] as string[],
    borders: [] as string[],
    shadows: [] as string[],
  };
  
  // Extract Tailwind color classes
  const colorPattern = /(?:bg|text|border)-(?:zinc|red|green|blue|yellow)-(?:\d+)/g;
  const colorMatches = code.match(colorPattern) || [];
  tokens.colors = [...new Set(colorMatches.map(m => `color-neutral-${m.split('-').pop()}`))];
  
  // Extract spacing classes
  const spacingPattern = /(?:p|m|gap)-(?:\d+)/g;
  const spacingMatches = code.match(spacingPattern) || [];
  tokens.spacing = [...new Set(spacingMatches.map(m => `spacing-${m.split('-').pop()}`))];
  
  // Extract typography
  if (code.includes('font-semibold')) tokens.typography.push('font-semibold');
  if (code.includes('font-bold')) tokens.typography.push('font-bold');
  if (code.includes('font-medium')) tokens.typography.push('font-medium');
  
  // Extract borders
  const borderPattern = /rounded-(?:md|lg|xl|full)/g;
  const borderMatches = code.match(borderPattern) || [];
  tokens.borders = [...new Set(borderMatches)];
  
  return tokens;
}

/**
 * Enrich component with metadata
 */
function enrichComponent(extracted: ComponentExtraction): any {
  const promptData = extracted.code.prompt 
    ? parseAIPrompt(extracted.code.prompt)
    : { description: '', requirements: [], useCases: [], bestPractices: [] };
  
  const designTokens = extractDesignTokens(
    extracted.code.react + extracted.code.html + extracted.code.css
  );
  
  // Detect furniture compatibility
  const furnitureCompatible = 
    extracted.name.toLowerCase().includes('furniture') ||
    extracted.category === 'buttons' ||
    extracted.category === 'badges' ||
    extracted.category === 'data-tables' ||
    extracted.category === 'modals';
  
  return {
    id: extracted.id,
    name: extracted.name,
    category: extracted.category,
    subcategory: '',
    description: promptData.description || `${extracted.name} component for the Strata DS design system`,
    longDescription: promptData.description,
    version: '2.0.0',
    changelog: [
      {
        version: '2.0.0',
        date: new Date().toISOString().split('T')[0],
        changes: ['Migrated to structured JSON format', 'Added comprehensive metadata'],
      },
    ],
    code: {
      react: extracted.code.react,
      html: extracted.code.html,
      css: extracted.code.css,
      typescript: '', // Will be filled manually
    },
    variants: [],
    props: [],
    designTokens,
    dependencies: {
      npm: extracted.code.react.includes('lucide-react') ? ['lucide-react'] : [],
      components: [],
    },
    tags: generateTags(extracted),
    industries: ['general'],
    complexity: 'simple',
    furnitureContext: furnitureCompatible ? {
      compatible: true,
      suitableFor: generateFurnitureSuitability(extracted),
      materials: ['any'],
      industryPatterns: [],
    } : undefined,
    accessibility: {
      wcag: 'AA',
      ariaSupport: true,
      keyboardNav: true,
      screenReader: 'full',
      focusManagement: true,
      colorContrast: true,
    },
    performance: {
      bundleSize: { minified: 'TBD', gzipped: 'TBD' },
      renderTime: { average: 'TBD', p95: 'TBD' },
      interactions: {},
    },
    aiMetadata: {
      shortDescription: generateShortDescription(extracted),
      mediumDescription: promptData.description || generateMediumDescription(extracted),
      fullDescription: promptData.description || generateFullDescription(extracted),
      semanticKeywords: generateSemanticKeywords(extracted),
      synonyms: generateSynonyms(extracted),
      useCases: promptData.useCases.length > 0 ? promptData.useCases : generateUseCases(extracted),
      commonMistakes: [],
      bestPractices: promptData.bestPractices.length > 0 ? promptData.bestPractices : [],
      fewShotExamples: [],
    },
    examples: [],
    relatedComponents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function generateTags(extracted: ComponentExtraction): string[] {
  const tags = [extracted.category];
  const nameLower = extracted.name.toLowerCase();
  
  if (nameLower.includes('button')) tags.push('interactive', 'action');
  if (nameLower.includes('primary')) tags.push('cta', 'primary');
  if (nameLower.includes('form')) tags.push('form', 'input');
  if (nameLower.includes('modal')) tags.push('overlay', 'dialog');
  if (nameLower.includes('table')) tags.push('data', 'list');
  
  return [...new Set(tags)];
}

function generateFurnitureSuitability(extracted: ComponentExtraction): string[] {
  const category = extracted.category;
  
  const suitability: Record<string, string[]> = {
    buttons: ['Add to Cart', 'Product actions', 'Configurator controls', 'Checkout flow'],
    badges: ['Product labels', 'Material indicators', 'Status badges'],
    'data-tables': ['Product listings', 'Inventory management', 'Order history'],
    modals: ['Product quick view', 'Configuration confirmation', 'Cart preview'],
    alerts: ['Inventory notifications', 'Order confirmations', 'Delivery updates'],
  };
  
  return suitability[category] || ['General furniture UI'];
}

function generateShortDescription(extracted: ComponentExtraction): string {
  return `${extracted.name} - ${extracted.category} component`;
}

function generateMediumDescription(extracted: ComponentExtraction): string {
  return `${extracted.name} component for the Strata DS White Label design system. ${extracted.category} category with Zinc color scale and high-density layout.`;
}

function generateFullDescription(extracted: ComponentExtraction): string {
  return `${extracted.name} is a ${extracted.category} component in the Strata DS White Label design system. It features a clean, high-density design using the Zinc greyscale color palette and follows enterprise-grade best practices. The component supports dark mode, is fully accessible (WCAG AA), and includes variants for different use cases.`;
}

function generateSemanticKeywords(extracted: ComponentExtraction): string[] {
  const keywords = [extracted.name.toLowerCase(), extracted.category];
  const nameLower = extracted.name.toLowerCase();
  
  if (nameLower.includes('button')) keywords.push('button', 'action', 'interactive', 'click');
  if (nameLower.includes('primary')) keywords.push('primary', 'cta', 'main action');
  if (nameLower.includes('form')) keywords.push('form', 'input', 'field');
  if (nameLower.includes('table')) keywords.push('table', 'data', 'grid', 'list');
  
  return [...new Set(keywords)];
}

function generateSynonyms(extracted: ComponentExtraction): string[] {
  const synonyms: Record<string, string[]> = {
    button: ['btn', 'action button', 'click button'],
    primary: ['main', 'principal', 'primary cta'],
    modal: ['dialog', 'popup', 'overlay'],
    badge: ['label', 'tag', 'chip'],
    alert: ['notification', 'message', 'toast'],
  };
  
  const nameLower = extracted.name.toLowerCase();
  const result: string[] = [];
  
  for (const [key, values] of Object.entries(synonyms)) {
    if (nameLower.includes(key)) {
      result.push(...values);
    }
  }
  
  return [...new Set(result)];
}

function generateUseCases(extracted: ComponentExtraction): string[] {
  const category = extracted.category;
  
  const useCases: Record<string, string[]> = {
    buttons: ['Form submission', 'Primary actions', 'Navigation', 'CTAs'],
    badges: ['Status indicators', 'Labels', 'Categories', 'Counts'],
    modals: ['Confirmations', 'Forms', 'Details', 'Warnings'],
    alerts: ['Success messages', 'Error notifications', 'Warnings', 'Information'],
    'data-tables': ['Data display', 'Product lists', 'User management', 'Reports'],
  };
  
  return useCases[category] || ['General UI'];
}

/**
 * Main migration function
 */
async function migrateComponents() {
  console.log('🚀 Starting component migration...\n');
  
  const componentsDir = path.join(process.cwd(), 'src', 'app', 'components');
  const outputDir = path.join(process.cwd(), 'api', 'src', 'data', 'components');
  
  // Create output directory
  await fs.mkdir(outputDir, { recursive: true });
  
  // Get all View files
  const files = await fs.readdir(componentsDir);
  const viewFiles = files.filter(f => f.endsWith('View.tsx'));
  
  console.log(`Found ${viewFiles.length} View files to process\n`);
  
  const allComponents: any[] = [];
  
  for (const file of viewFiles) {
    console.log(`Processing: ${file}`);
    const filePath = path.join(componentsDir, file);
    
    try {
      const extracted = await extractComponentFromView(filePath);
      console.log(`  ✓ Extracted ${extracted.length} components`);
      
      for (const component of extracted) {
        const enriched = enrichComponent(component);
        allComponents.push(enriched);
        console.log(`    - ${enriched.name} (${enriched.id})`);
      }
    } catch (error) {
      console.error(`  ✗ Error processing ${file}:`, error);
    }
    
    console.log('');
  }
  
  // Group by category
  const byCategory: Record<string, any[]> = {};
  for (const component of allComponents) {
    if (!byCategory[component.category]) {
      byCategory[component.category] = [];
    }
    byCategory[component.category].push(component);
  }
  
  // Write to files
  console.log('\n📝 Writing JSON files...\n');
  
  for (const [category, components] of Object.entries(byCategory)) {
    const outputPath = path.join(outputDir, `${category}.json`);
    await fs.writeFile(
      outputPath,
      JSON.stringify({ components }, null, 2),
      'utf-8'
    );
    console.log(`  ✓ ${category}.json (${components.length} components)`);
  }
  
  // Write index file
  const indexPath = path.join(outputDir, 'index.json');
  await fs.writeFile(
    indexPath,
    JSON.stringify({
      categories: Object.keys(byCategory),
      totalComponents: allComponents.length,
      lastUpdated: new Date().toISOString(),
    }, null, 2),
    'utf-8'
  );
  
  console.log(`\n✅ Migration complete!`);
  console.log(`   Total components: ${allComponents.length}`);
  console.log(`   Categories: ${Object.keys(byCategory).length}`);
  console.log(`   Output: ${outputDir}\n`);
}

// Run migration
migrateComponents().catch(console.error);
```

---

## 🛠️ Script 2: Migración de Design Tokens

### Archivo: `/scripts/migrate-design-tokens.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';

/**
 * Extract design tokens from ColorsView.tsx
 */
async function extractColorTokens(): Promise<any> {
  const colorsViewPath = path.join(
    process.cwd(),
    'src',
    'app',
    'components',
    'ColorsView.tsx'
  );
  
  const content = await fs.readFile(colorsViewPath, 'utf-8');
  
  // Extract zincScale array
  const zincScaleMatch = content.match(/const zincScale = \[([\s\S]*?)\];/);
  if (!zincScaleMatch) {
    throw new Error('Could not find zincScale in ColorsView.tsx');
  }
  
  const zincScaleStr = '[' + zincScaleMatch[1] + ']';
  
  // Parse the array (simplified - in production use proper parser)
  const zincScale = eval(zincScaleStr);
  
  return {
    colors: {
      neutral: zincScale.map((color: any) => ({
        primitive: color.primitive,
        token: color.token,
        hex: color.hex,
        rgb: hexToRgb(color.hex),
        hsl: hexToHsl(color.hex),
        usage: color.usage,
        light: color.light || false,
        dark: color.dark || false,
        primary: color.primary || false,
      })),
      semantic: {
        success: [
          {
            primitive: '500',
            token: 'color-success',
            hex: '#22c55e',
            rgb: 'rgb(34, 197, 94)',
            hsl: 'hsl(142, 71%, 45%)',
            usage: 'Success states, confirmations',
          },
        ],
        error: [
          {
            primitive: '500',
            token: 'color-error',
            hex: '#ef4444',
            rgb: 'rgb(239, 68, 68)',
            hsl: 'hsl(0, 84%, 60%)',
            usage: 'Error states, destructive actions',
          },
        ],
        warning: [
          {
            primitive: '500',
            token: 'color-warning',
            hex: '#f59e0b',
            rgb: 'rgb(245, 158, 11)',
            hsl: 'hsl(38, 92%, 50%)',
            usage: 'Warning states, cautions',
          },
        ],
        info: [
          {
            primitive: '500',
            token: 'color-info',
            hex: '#3b82f6',
            rgb: 'rgb(59, 130, 246)',
            hsl: 'hsl(221, 91%, 60%)',
            usage: 'Informational messages',
          },
        ],
      },
      furniture: {
        wood: [
          {
            name: 'oak',
            category: 'wood',
            token: '--furniture-wood-oak',
            hex: '#DEB887',
            rgb: 'rgb(222, 184, 135)',
            hsl: 'hsl(32, 60%, 70%)',
            texture: 'https://cdn.strata-ds.com/textures/oak.jpg',
            finish: ['matte', 'glossy', 'satin', 'oiled'],
            durability: 'high',
          },
          {
            name: 'walnut',
            category: 'wood',
            token: '--furniture-wood-walnut',
            hex: '#5C4033',
            rgb: 'rgb(92, 64, 51)',
            hsl: 'hsl(19, 29%, 28%)',
            texture: 'https://cdn.strata-ds.com/textures/walnut.jpg',
            finish: ['matte', 'glossy', 'satin'],
            durability: 'high',
          },
          {
            name: 'mahogany',
            category: 'wood',
            token: '--furniture-wood-mahogany',
            hex: '#C04000',
            rgb: 'rgb(192, 64, 0)',
            hsl: 'hsl(20, 100%, 38%)',
            texture: 'https://cdn.strata-ds.com/textures/mahogany.jpg',
            finish: ['glossy', 'satin'],
            durability: 'high',
          },
        ],
        metal: [
          {
            name: 'brass',
            category: 'metal',
            token: '--furniture-metal-brass',
            hex: '#B5A642',
            rgb: 'rgb(181, 166, 66)',
            hsl: 'hsl(52, 47%, 48%)',
            finish: ['brushed', 'polished'],
            durability: 'high',
          },
          {
            name: 'steel',
            category: 'metal',
            token: '--furniture-metal-steel',
            hex: '#71797E',
            rgb: 'rgb(113, 121, 126)',
            hsl: 'hsl(203, 5%, 47%)',
            finish: ['brushed', 'polished', 'powder-coated'],
            durability: 'high',
          },
        ],
        fabric: [
          {
            name: 'linen',
            category: 'fabric',
            token: '--furniture-fabric-linen',
            hex: '#FAF0E6',
            rgb: 'rgb(250, 240, 230)',
            hsl: 'hsl(30, 67%, 94%)',
            finish: ['natural'],
            durability: 'medium',
          },
          {
            name: 'velvet',
            category: 'fabric',
            token: '--furniture-fabric-velvet',
            hex: '#800020',
            rgb: 'rgb(128, 0, 32)',
            hsl: 'hsl(345, 100%, 25%)',
            finish: ['plush'],
            durability: 'medium',
          },
        ],
        leather: [
          {
            name: 'brown',
            category: 'leather',
            token: '--furniture-leather-brown',
            hex: '#8B4513',
            rgb: 'rgb(139, 69, 19)',
            hsl: 'hsl(25, 76%, 31%)',
            finish: ['smooth', 'textured'],
            durability: 'high',
          },
        ],
      },
    },
    spacing: [
      { token: 'spacing-0', value: '0', valuePx: 0, usage: 'No spacing' },
      { token: 'spacing-1', value: '0.25rem', valuePx: 4, usage: 'Micro spacing' },
      { token: 'spacing-2', value: '0.5rem', valuePx: 8, usage: 'Tight spacing' },
      { token: 'spacing-3', value: '0.75rem', valuePx: 12, usage: 'Default gap' },
      { token: 'spacing-4', value: '1rem', valuePx: 16, usage: 'Standard spacing' },
      { token: 'spacing-6', value: '1.5rem', valuePx: 24, usage: 'Section spacing' },
      { token: 'spacing-8', value: '2rem', valuePx: 32, usage: 'Large spacing' },
      { token: 'spacing-12', value: '3rem', valuePx: 48, usage: 'Extra large' },
      { token: 'furniture-grid-8', value: '8cm', valuePx: 302, usage: 'Furniture grid unit' },
    ],
    typography: {
      fontFamilies: {
        sans: 'Inter, system-ui, sans-serif',
        mono: 'monospace',
      },
      fontSizes: [
        { name: 'xs', token: 'text-xs', value: '0.75rem', lineHeight: '1rem' },
        { name: 'sm', token: 'text-sm', value: '0.875rem', lineHeight: '1.25rem' },
        { name: 'base', token: 'text-base', value: '1rem', lineHeight: '1.5rem' },
        { name: 'lg', token: 'text-lg', value: '1.125rem', lineHeight: '1.75rem' },
        { name: 'xl', token: 'text-xl', value: '1.25rem', lineHeight: '1.75rem' },
        { name: '2xl', token: 'text-2xl', value: '1.5rem', lineHeight: '2rem' },
        { name: '3xl', token: 'text-3xl', value: '1.875rem', lineHeight: '2.25rem' },
      ],
      fontWeights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
    borders: {
      radius: [
        { name: 'none', token: 'rounded-none', value: '0' },
        { name: 'sm', token: 'rounded-sm', value: '0.125rem' },
        { name: 'md', token: 'rounded-md', value: '0.375rem' },
        { name: 'lg', token: 'rounded-lg', value: '0.5rem' },
        { name: 'xl', token: 'rounded-xl', value: '0.75rem' },
        { name: 'full', token: 'rounded-full', value: '9999px' },
      ],
      width: [
        { name: 'default', token: 'border', value: '1px' },
        { name: 'thick', token: 'border-2', value: '2px' },
      ],
    },
    shadows: [
      {
        name: 'sm',
        token: 'shadow-sm',
        value: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        usage: 'Subtle elevation',
      },
      {
        name: 'md',
        token: 'shadow-md',
        value: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        usage: 'Cards, dropdowns',
      },
      {
        name: 'lg',
        token: 'shadow-lg',
        value: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        usage: 'Modals, overlays',
      },
    ],
    dimensions: {
      furniture: {
        chair: {
          standard: {
            width: { value: 50, unit: 'cm', token: '--furniture-chair-standard-width' },
            height: { value: 45, unit: 'cm', token: '--furniture-chair-standard-height' },
            depth: { value: 55, unit: 'cm', token: '--furniture-chair-standard-depth' },
          },
          dining: {
            width: { value: 48, unit: 'cm', token: '--furniture-chair-dining-width' },
            height: { value: 46, unit: 'cm', token: '--furniture-chair-dining-height' },
            depth: { value: 52, unit: 'cm', token: '--furniture-chair-dining-depth' },
          },
        },
        table: {
          dining: {
            width: { value: 180, unit: 'cm', token: '--furniture-table-dining-width' },
            height: { value: 75, unit: 'cm', token: '--furniture-table-dining-height' },
            depth: { value: 90, unit: 'cm', token: '--furniture-table-dining-depth' },
          },
        },
        sofa: {
          '2seat': {
            width: { value: 160, unit: 'cm', token: '--furniture-sofa-2seat-width' },
            height: { value: 85, unit: 'cm', token: '--furniture-sofa-height' },
            depth: { value: 90, unit: 'cm', token: '--furniture-sofa-depth' },
          },
        },
      },
    },
  };
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '';
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '';
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

/**
 * Main migration function
 */
async function migrateDesignTokens() {
  console.log('🎨 Starting design tokens migration...\n');
  
  const outputDir = path.join(process.cwd(), 'api', 'src', 'data', 'foundations');
  await fs.mkdir(outputDir, { recursive: true });
  
  console.log('Extracting color tokens...');
  const tokens = await extractColorTokens();
  
  // Write design-tokens.json
  const tokensPath = path.join(outputDir, 'design-tokens.json');
  await fs.writeFile(tokensPath, JSON.stringify(tokens, null, 2), 'utf-8');
  console.log(`✓ Written: ${tokensPath}`);
  
  console.log('\n✅ Design tokens migration complete!\n');
}

// Run migration
migrateDesignTokens().catch(console.error);
```

---

## 🛠️ Script 3: Package.json Scripts

### Agregar a `/package.json`:

```json
{
  "scripts": {
    "migrate:components": "tsx scripts/migrate-components.ts",
    "migrate:tokens": "tsx scripts/migrate-design-tokens.ts",
    "migrate:all": "npm run migrate:tokens && npm run migrate:components",
    "migrate:validate": "tsx scripts/validate-migration.ts"
  },
  "devDependencies": {
    "tsx": "^4.7.0",
    "@types/node": "^20.10.6"
  }
}
```

---

## 🛠️ Script 4: Validación de Migración

### Archivo: `/scripts/validate-migration.ts`

```typescript
import fs from 'fs/promises';
import path from 'path';
import { ComponentSchema } from '../api/src/schemas/component.schema';
import { DesignTokensSchema } from '../api/src/schemas/foundation.schema';

async function validateMigration() {
  console.log('🔍 Validating migrated data...\n');
  
  let errors = 0;
  let warnings = 0;
  
  // Validate components
  const componentsDir = path.join(process.cwd(), 'api', 'src', 'data', 'components');
  
  try {
    const files = await fs.readdir(componentsDir);
    const jsonFiles = files.filter(f => f.endsWith('.json') && f !== 'index.json');
    
    console.log(`Found ${jsonFiles.length} component files\n`);
    
    for (const file of jsonFiles) {
      console.log(`Validating: ${file}`);
      const filePath = path.join(componentsDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      for (const component of data.components) {
        try {
          ComponentSchema.parse(component);
          console.log(`  ✓ ${component.id}`);
        } catch (error: any) {
          console.error(`  ✗ ${component.id}: ${error.message}`);
          errors++;
        }
        
        // Check for missing metadata
        if (!component.aiMetadata.fewShotExamples.length) {
          console.warn(`  ⚠ ${component.id}: Missing few-shot examples`);
          warnings++;
        }
        
        if (!component.examples.length) {
          console.warn(`  ⚠ ${component.id}: Missing examples`);
          warnings++;
        }
      }
      console.log('');
    }
  } catch (error) {
    console.error('Error validating components:', error);
  }
  
  // Validate design tokens
  const tokensPath = path.join(process.cwd(), 'api', 'src', 'data', 'foundations', 'design-tokens.json');
  
  try {
    console.log('Validating design tokens...');
    const content = await fs.readFile(tokensPath, 'utf-8');
    const tokens = JSON.parse(content);
    
    DesignTokensSchema.parse(tokens);
    console.log('  ✓ Design tokens valid\n');
  } catch (error: any) {
    console.error('  ✗ Design tokens invalid:', error.message);
    errors++;
  }
  
  // Summary
  console.log('\n📊 Validation Summary');
  console.log('─────────────────────');
  console.log(`Errors:   ${errors}`);
  console.log(`Warnings: ${warnings}`);
  
  if (errors === 0) {
    console.log('\n✅ Validation passed!\n');
    process.exit(0);
  } else {
    console.log('\n❌ Validation failed!\n');
    process.exit(1);
  }
}

validateMigration().catch(console.error);
```

---

## 🚀 Uso de los Scripts

### Paso 1: Instalar dependencias

```bash
npm install --save-dev tsx @types/node zod
```

### Paso 2: Ejecutar migración completa

```bash
# Migrar design tokens primero
npm run migrate:tokens

# Migrar componentes
npm run migrate:components

# O ambos
npm run migrate:all
```

### Paso 3: Validar migración

```bash
npm run migrate:validate
```

### Paso 4: Revisar output

```bash
# Ver archivos generados
ls -la api/src/data/components/
ls -la api/src/data/foundations/

# Ver contenido de ejemplo
cat api/src/data/components/buttons.json | head -50
```

---

## 📊 Resultado Esperado

```
api/src/data/
├── components/
│   ├── index.json
│   ├── buttons.json
│   ├── badges.json
│   ├── avatars.json
│   ├── dividers.json
│   ├── app-shells.json
│   ├── page-headings.json
│   ├── navbars.json
│   ├── action-panels.json
│   ├── data-tables.json
│   ├── stacked-lists.json
│   ├── feeds.json
│   ├── stats.json
│   ├── descriptions.json
│   ├── form-layouts.json
│   ├── input-groups.json
│   ├── selects.json
│   ├── file-upload.json
│   ├── modals.json
│   ├── slide-overs.json
│   ├── alerts.json
│   ├── breadcrumbs.json
│   ├── dropdowns.json
│   ├── drag-drop.json
│   └── data-visualization.json
└── foundations/
    └── design-tokens.json
```

---

## ⚠️ Post-Migration Tasks

Después de ejecutar la migración automática, necesitarás:

1. **Manual Review (30-60 min por archivo)**
   - [ ] Verificar metadata AI
   - [ ] Agregar few-shot examples
   - [ ] Completar furniture context
   - [ ] Añadir ejemplos visuales
   - [ ] Documentar props TypeScript

2. **Enrichment**
   - [ ] Screenshots/previews de componentes
   - [ ] Performance metrics reales
   - [ ] Accessibility audit results
   - [ ] Related components links

3. **Quality Check**
   - [ ] Ejecutar validation
   - [ ] Fix errores reportados
   - [ ] Completar warnings

---

Ahora voy a crear los REST API endpoints completos...
