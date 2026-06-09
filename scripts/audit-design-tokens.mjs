#!/usr/bin/env node

/**
 * Design System Token Auditor
 *
 * Audits the Dealer app for violations of Strata Design System token usage.
 * Detects hardcoded colors, non-Strata classes, and brand color misuse.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== CONFIGURATION =====

const SRC_DIR = path.join(__dirname, '../src');
const STRATA_TOKENS_PATH = path.join(__dirname, '../../../Strata Design System/src/tokens/tokens.ts');

// Strata Design System allowed color scales
const ALLOWED_COLOR_SCALES = [
  'brand',    // Volt Lime (#D6FF3C) - PRIMARY SIGNAL COLOR
  'zinc',     // Monochrome structural palette
  'red',      // Destructive actions
  'green',    // Success states
  'blue',     // Information
  'amber',    // Warnings
  'indigo',   // Charts
];

// FORBIDDEN colors (not in Strata DS)
const FORBIDDEN_COLOR_SCALES = [
  'lime',     // Use brand-* instead
  'yellow',   // Use amber-* instead
  'purple',   // Use indigo-* or brand-* instead
  'violet',   // Use indigo-* instead
  'pink',     // Not in Strata palette
  'rose',     // Not in Strata palette
  'orange',   // Use amber-* instead
  'emerald',  // Use green-* instead
  'teal',     // Not in Strata palette
  'cyan',     // Use blue-* instead
  'sky',      // Use blue-* instead
  'fuchsia',  // Not in Strata palette
];

// Brand color usage rules (from BRAND_STYLING.md)
const BRAND_COLOR_RULES = {
  lightMode: {
    primaryAction: 'bg-brand-300',
    hover: 'hover:bg-brand-400',
    accent: 'bg-brand-400',
    text: 'text-zinc-900',
  },
  darkMode: {
    primaryAction: 'bg-brand-500',
    hover: 'dark:hover:bg-brand-600/50',
    accent: 'bg-brand-400',
    text: 'text-white',
  },
};

// ===== PATTERNS =====

// Regex to find Tailwind color classes
const TAILWIND_COLOR_CLASS_REGEX = /(?:bg|text|border|ring|from|to|via)-([a-z]+)(?:-(\d+))?(?:\/(\d+))?/g;

// Regex to find hex colors
const HEX_COLOR_REGEX = /#[0-9a-fA-F]{3,6}/g;

// Regex to find RGB/RGBA colors
const RGB_COLOR_REGEX = /rgba?\([^)]+\)/g;

// ===== COLOR MAPPING =====

const COLOR_REPLACEMENT_MAP = {
  // Forbidden -> Strata equivalent
  'lime': 'brand',
  'yellow': 'amber',
  'purple': 'indigo',
  'violet': 'indigo',
  'orange': 'amber',
  'emerald': 'green',
  'cyan': 'blue',
  'sky': 'blue',
};

// Known hex colors -> Strata token
const HEX_TO_STRATA_MAP = {
  '#D6FF3C': 'brand-400',
  '#d6ff3c': 'brand-400',
  '#edff58': 'brand-300',
  '#EDFF58': 'brand-300',
  '#8b5cf6': 'indigo-500',
  '#8B5CF6': 'indigo-500',
  '#a78bfa': 'indigo-400',
  '#8884d8': 'blue-400',
  '#E52D49': 'red-500',
  '#e52d49': 'red-500',
  '#22c55e': 'green-500',
  '#f59e0b': 'amber-500',
};

// ===== UTILITIES =====

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        getAllFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(SRC_DIR, filePath);
  const violations = [];

  // Check for forbidden Tailwind color classes
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    // Check Tailwind classes
    let match;
    while ((match = TAILWIND_COLOR_CLASS_REGEX.exec(line)) !== null) {
      const [fullMatch, colorName, shade] = match;

      if (FORBIDDEN_COLOR_SCALES.includes(colorName)) {
        const suggestion = COLOR_REPLACEMENT_MAP[colorName] || 'zinc';
        violations.push({
          type: 'FORBIDDEN_COLOR',
          severity: 'error',
          line: lineNumber,
          match: fullMatch,
          message: `"${colorName}" is not in Strata Design System. Use "${suggestion}-${shade || '400'}" instead.`,
          suggestion: fullMatch.replace(colorName, suggestion),
        });
      }
    }

    // Check for hex colors
    const hexMatches = line.matchAll(HEX_COLOR_REGEX);
    for (const hexMatch of hexMatches) {
      const hexColor = hexMatch[0];
      const strataToken = HEX_TO_STRATA_MAP[hexColor];

      violations.push({
        type: 'HARDCODED_HEX',
        severity: strataToken ? 'warning' : 'error',
        line: lineNumber,
        match: hexColor,
        message: strataToken
          ? `Hardcoded hex "${hexColor}" detected. Use Strata token: ${strataToken}`
          : `Hardcoded hex "${hexColor}" detected. Map to appropriate Strata token.`,
        suggestion: strataToken ? `Use bg-${strataToken} or text-${strataToken}` : null,
      });
    }

    // Check for RGB colors
    const rgbMatches = line.matchAll(RGB_COLOR_REGEX);
    for (const rgbMatch of rgbMatches) {
      violations.push({
        type: 'HARDCODED_RGB',
        severity: 'warning',
        line: lineNumber,
        match: rgbMatch[0],
        message: `Hardcoded RGB color detected. Use Strata CSS variables instead.`,
        suggestion: null,
      });
    }

    // Check for brand color misuse in light mode
    if (line.includes('bg-brand-400') && !line.includes('dark:') && !line.includes('hover:')) {
      violations.push({
        type: 'BRAND_MISUSE',
        severity: 'warning',
        line: lineNumber,
        match: 'bg-brand-400',
        message: 'Brand-400 should only be used as hover in light mode. Use brand-300 for light mode base, brand-500 for dark mode base.',
        suggestion: 'bg-brand-300 dark:bg-brand-500 hover:bg-brand-400 dark:hover:bg-brand-600/50',
      });
    }

    // Check for incorrect dark mode brand usage (should be brand-500)
    if (line.includes('dark:bg-brand-400') && !line.includes('hover:')) {
      violations.push({
        type: 'BRAND_MISUSE',
        severity: 'warning',
        line: lineNumber,
        match: 'dark:bg-brand-400',
        message: 'Dark mode should use brand-500 as base. Brand-400 is incorrect.',
        suggestion: 'dark:bg-brand-500 dark:hover:bg-brand-600/50',
      });
    }

    // Check for incorrect dark mode hover (should be brand-600/50)
    if (line.includes('dark:hover:bg-brand-400')) {
      violations.push({
        type: 'BRAND_MISUSE',
        severity: 'warning',
        line: lineNumber,
        match: 'dark:hover:bg-brand-400',
        message: 'Dark mode hover should use brand-600/50 (50% opacity).',
        suggestion: 'dark:hover:bg-brand-600/50',
      });
    }
  });

  return violations.length > 0 ? { file: relativePath, violations } : null;
}

// ===== MAIN EXECUTION =====

function runAudit() {
  console.log('🔍 Strata Design System Token Auditor\n');
  console.log('Scanning:', SRC_DIR, '\n');

  const files = getAllFiles(SRC_DIR);
  const results = [];
  let totalViolations = 0;
  let errorCount = 0;
  let warningCount = 0;

  files.forEach((file) => {
    const result = analyzeFile(file);
    if (result) {
      results.push(result);
      result.violations.forEach((v) => {
        totalViolations++;
        if (v.severity === 'error') errorCount++;
        if (v.severity === 'warning') warningCount++;
      });
    }
  });

  // Print results
  if (results.length === 0) {
    console.log('✅ No violations found! All files comply with Strata Design System.\n');
    return;
  }

  console.log(`📊 Found ${totalViolations} violations in ${results.length} files\n`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Warnings: ${warningCount}\n`);
  console.log('─'.repeat(80), '\n');

  results.forEach(({ file, violations }) => {
    console.log(`📄 ${file}`);
    violations.forEach((v) => {
      const emoji = v.severity === 'error' ? '❌' : '⚠️';
      console.log(`   ${emoji} Line ${v.line}: ${v.message}`);
      if (v.suggestion) {
        console.log(`      💡 Suggestion: ${v.suggestion}`);
      }
    });
    console.log('');
  });

  console.log('─'.repeat(80), '\n');

  // Summary by type
  const byType = {};
  results.forEach(({ violations }) => {
    violations.forEach((v) => {
      byType[v.type] = (byType[v.type] || 0) + 1;
    });
  });

  console.log('📈 Violations by Type:\n');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });
  console.log('');

  // Save report
  const reportPath = path.join(__dirname, '../design-system-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({ results, summary: { totalViolations, errorCount, warningCount, byType } }, null, 2));
  console.log(`📝 Full report saved to: ${path.relative(process.cwd(), reportPath)}\n`);

  // Exit with error if violations found
  if (errorCount > 0) {
    process.exit(1);
  }
}

runAudit();
