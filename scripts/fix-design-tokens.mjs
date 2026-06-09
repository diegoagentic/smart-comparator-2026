#!/usr/bin/env node

/**
 * Design System Token Auto-Fixer
 *
 * Automatically fixes violations of Strata Design System token usage.
 * CAUTION: This will modify your source files. Commit your changes first!
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '../src');

// ===== REPLACEMENT RULES =====

const REPLACEMENTS = [
  // Forbidden colors -> Strata equivalents
  { pattern: /\b(bg|text|border|ring)-lime-(\d+)/g, replace: '$1-brand-$2' },
  { pattern: /\b(bg|text|border|ring)-yellow-(\d+)/g, replace: '$1-amber-$2' },
  { pattern: /\b(bg|text|border|ring)-purple-(\d+)/g, replace: '$1-indigo-$2' },
  { pattern: /\b(bg|text|border|ring)-violet-(\d+)/g, replace: '$1-indigo-$2' },
  { pattern: /\b(bg|text|border|ring)-orange-(\d+)/g, replace: '$1-amber-$2' },
  { pattern: /\b(bg|text|border|ring)-emerald-(\d+)/g, replace: '$1-green-$2' },
  { pattern: /\b(bg|text|border|ring)-cyan-(\d+)/g, replace: '$1-blue-$2' },
  { pattern: /\b(bg|text|border|ring)-sky-(\d+)/g, replace: '$1-blue-$2' },

  // Hex colors -> Strata tokens (common cases)
  { pattern: /#D6FF3C|#d6ff3c/g, replace: 'bg-brand-400', context: 'background' },
  { pattern: /#EDFF58|#edff58/g, replace: 'bg-brand-300', context: 'background' },
  { pattern: /#8b5cf6|#8B5CF6/g, replace: 'bg-indigo-500', context: 'background' },
  { pattern: /#a78bfa/g, replace: 'bg-indigo-400', context: 'background' },
  { pattern: /#E52D49|#e52d49/g, replace: 'bg-red-500', context: 'background' },
  { pattern: /#22c55e/g, replace: 'bg-green-500', context: 'background' },
  { pattern: /#f59e0b/g, replace: 'bg-amber-500', context: 'background' },

  // Fix brand color usage for light mode (use brand-500 for dark mode)
  {
    pattern: /className="([^"]*)\bbg-brand-400\b(?![^"]*dark:)(?![^"]*hover:)/g,
    replace: 'className="$1bg-brand-300 dark:bg-brand-500',
    description: 'Add dark mode variant: brand-300 (light) / brand-500 (dark)'
  },

  // Fix incorrect dark mode brand-400 to brand-500
  {
    pattern: /\bdark:bg-brand-400\b(?![^"]*hover)/g,
    replace: 'dark:bg-brand-500',
    description: 'Fix dark mode brand: use brand-500 as base'
  },

  // Fix incorrect dark mode hover (should be brand-600/50)
  {
    pattern: /\bdark:hover:bg-brand-400\b/g,
    replace: 'dark:hover:bg-brand-600/50',
    description: 'Fix dark mode hover: use brand-600/50 (50% opacity)'
  },

  // Fix dark mode hover brand-500 to brand-600/50
  {
    pattern: /\bdark:hover:bg-brand-500\b/g,
    replace: 'dark:hover:bg-brand-600/50',
    description: 'Fix dark mode hover: use brand-600/50 instead of brand-500'
  },
];

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

function fixFile(filePath, dryRun = false) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let modified = content;
  let changeCount = 0;
  const changes = [];

  REPLACEMENTS.forEach((rule) => {
    const matches = [...modified.matchAll(rule.pattern)];
    if (matches.length > 0) {
      modified = modified.replace(rule.pattern, rule.replace);
      changeCount += matches.length;
      changes.push({
        rule: rule.description || `${rule.pattern} → ${rule.replace}`,
        count: matches.length,
      });
    }
  });

  if (changeCount > 0) {
    if (!dryRun) {
      fs.writeFileSync(filePath, modified, 'utf-8');
    }
    return { file: path.relative(SRC_DIR, filePath), changes, changeCount };
  }

  return null;
}

// ===== MAIN EXECUTION =====

function runFixer(dryRun = false) {
  console.log('🔧 Strata Design System Token Auto-Fixer\n');

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  } else {
    console.log('⚠️  LIVE MODE - Files will be modified!\n');
  }

  console.log('Scanning:', SRC_DIR, '\n');

  const files = getAllFiles(SRC_DIR);
  const results = [];
  let totalChanges = 0;

  files.forEach((file) => {
    const result = fixFile(file, dryRun);
    if (result) {
      results.push(result);
      totalChanges += result.changeCount;
    }
  });

  // Print results
  if (results.length === 0) {
    console.log('✅ No fixes needed! All files comply with Strata Design System.\n');
    return;
  }

  console.log(`📊 ${dryRun ? 'Would fix' : 'Fixed'} ${totalChanges} violations in ${results.length} files\n`);
  console.log('─'.repeat(80), '\n');

  results.forEach(({ file, changes, changeCount }) => {
    console.log(`📄 ${file} (${changeCount} changes)`);
    changes.forEach((c) => {
      console.log(`   ✓ ${c.rule} (${c.count}x)`);
    });
    console.log('');
  });

  console.log('─'.repeat(80), '\n');

  if (dryRun) {
    console.log('💡 Run without --dry-run to apply these fixes\n');
  } else {
    console.log('✅ All fixes applied successfully!\n');
    console.log('⚠️  Recommendation: Review changes and run tests before committing.\n');
  }
}

// Parse CLI args
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

runFixer(dryRun);
