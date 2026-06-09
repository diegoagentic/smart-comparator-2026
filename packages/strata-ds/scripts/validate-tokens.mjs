#!/usr/bin/env node

/**
 * Token Validation Script
 *
 * Validates that primitive color tokens match the canonical visual documentation.
 * Source of Truth: ColorsView.tsx (via color-reference.json)
 *
 * This script prevents drift between visual documentation and token source files.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REFERENCE_FILE = path.join(__dirname, 'color-reference.json');
const PRIMITIVES_FILE = path.join(__dirname, '../tokens/primitives/colors.json');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log(`❌ Error loading ${filePath}: ${error.message}`, 'red');
    process.exit(1);
  }
}

function normalizeHex(hex) {
  // Normalize hex values to lowercase for comparison
  return hex.toLowerCase().trim();
}

function validateColors() {
  log('\n🔍 Validating Design Tokens...', 'cyan');
  log('━'.repeat(50), 'cyan');

  const reference = loadJSON(REFERENCE_FILE);
  const primitives = loadJSON(PRIMITIVES_FILE);

  let hasErrors = false;
  let errorCount = 0;
  let successCount = 0;

  // Validate each palette
  for (const [paletteName, paletteData] of Object.entries(reference.palettes)) {
    if (!paletteData.complete && paletteData.displayed_shades?.length === 0) {
      // Skip palettes with no displayed shades (like green)
      continue;
    }

    log(`\n📦 Validating ${paletteName.toUpperCase()} palette...`, 'blue');

    const sourcePalette = primitives.color[paletteName];

    if (!sourcePalette) {
      log(`  ❌ Palette '${paletteName}' not found in primitives/colors.json`, 'red');
      hasErrors = true;
      errorCount++;
      continue;
    }

    for (const [shade, expectedHex] of Object.entries(paletteData.colors)) {
      const sourceShade = sourcePalette[shade];

      if (!sourceShade) {
        log(`  ❌ ${paletteName}-${shade} not found in primitives`, 'red');
        hasErrors = true;
        errorCount++;
        continue;
      }

      const sourceHex = normalizeHex(sourceShade.value);
      const referenceHex = normalizeHex(expectedHex);

      if (sourceHex !== referenceHex) {
        log(`  ❌ ${paletteName}-${shade}: ${sourceHex} (source) ≠ ${referenceHex} (visual)`, 'red');
        hasErrors = true;
        errorCount++;
      } else {
        log(`  ✅ ${paletteName}-${shade}: ${sourceHex}`, 'green');
        successCount++;
      }
    }
  }

  // Check for forbidden 'mono' palette
  log(`\n🔍 Checking for forbidden palettes...`, 'blue');
  if (primitives.color.mono) {
    log(`  ❌ FORBIDDEN: 'mono' palette found - must be removed!`, 'red');
    log(`     Use 'zinc' palette instead.`, 'yellow');
    hasErrors = true;
    errorCount++;
  } else {
    log(`  ✅ No forbidden 'mono' palette`, 'green');
    successCount++;
  }

  // Summary
  log('\n' + '━'.repeat(50), 'cyan');
  log(`\n📊 Validation Summary:`, 'bold');
  log(`   ✅ Passed: ${successCount}`, 'green');
  log(`   ❌ Failed: ${errorCount}`, errorCount > 0 ? 'red' : 'green');

  if (hasErrors) {
    log('\n❌ Token validation FAILED!', 'red');
    log('\n💡 Fix:','yellow');
    log('   1. Compare values in tokens/primitives/colors.json', 'yellow');
    log('   2. With visual documentation in src/app/components/ColorsView.tsx', 'yellow');
    log('   3. Update primitives to match visual documentation', 'yellow');
    log('   4. ColorsView.tsx is the SOURCE OF TRUTH', 'yellow');
    log('', 'reset');
    process.exit(1);
  } else {
    log('\n✅ All tokens validated successfully!', 'green');
    log('   All primitive colors match visual documentation.', 'green');
    log('', 'reset');
    process.exit(0);
  }
}

// Run validation
try {
  validateColors();
} catch (error) {
  log(`\n❌ Validation error: ${error.message}`, 'red');
  log(error.stack, 'red');
  process.exit(1);
}
