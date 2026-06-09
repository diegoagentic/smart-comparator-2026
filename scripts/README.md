# Design System Token Auditor & Fixer

Automated tools to ensure Dealer app complies with **Strata Design System** token usage rules.

## 🎯 Problem Statement

When working with AI code generation or manual development, developers sometimes:

1. Use colors not in Strata palette (e.g., `lime-*`, `yellow-*`, `purple-*`)
2. Hardcode hex colors instead of using design tokens
3. Misuse brand colors between light and dark modes
4. Skip dark mode variants for color classes

These scripts **detect and fix** these violations automatically.

## 📦 Scripts

### 1. `audit-design-tokens.mjs`

Scans all `.tsx`/`.ts` files and reports design token violations.

**Usage:**

```bash
npm run audit:tokens
```

**Output:**

- Lists all violations by file
- Categorizes errors vs warnings
- Provides suggestions for fixes
- Generates JSON report: `design-system-audit-report.json`

**Example Output:**

```
🔍 Strata Design System Token Auditor

📊 Found 42 violations in 12 files

   Errors: 28
   Warnings: 14

────────────────────────────────────────────────────────────────────────────────

📄 components/DashboardMetricsGrid.tsx
   ❌ Line 45: "purple" is not in Strata Design System. Use "indigo-500" instead.
      💡 Suggestion: bg-indigo-500
   ⚠️  Line 67: Hardcoded hex "#8b5cf6" detected. Use Strata token: indigo-500
      💡 Suggestion: Use bg-indigo-500 or text-indigo-500

📄 components/charts/CategoryDonutChart.tsx
   ⚠️  Line 10: Hardcoded hex "#D6FF3C" detected. Use Strata token: brand-400
      💡 Suggestion: Use bg-brand-400 or text-brand-400
```

### 2. `fix-design-tokens.mjs`

Automatically fixes common violations.

**Dry Run (Preview):**

```bash
npm run fix:tokens:dry
```

**Apply Fixes:**

```bash
npm run fix:tokens
```

**What It Fixes:**

- `lime-*` → `brand-*`
- `yellow-*` → `amber-*`
- `purple-*` / `violet-*` → `indigo-*`
- `orange-*` → `amber-*`
- `emerald-*` → `green-*`
- `cyan-*` / `sky-*` → `blue-*`
- Adds dark mode variants for `bg-brand-400` in light mode
- Maps common hex colors to Strata tokens

**Example Output:**

```
🔧 Strata Design System Token Auto-Fixer

📊 Fixed 42 violations in 12 files

────────────────────────────────────────────────────────────────────────────────

📄 components/DashboardMetricsGrid.tsx (4 changes)
   ✓ bg-purple-500 → bg-indigo-500 (2x)
   ✓ text-yellow-600 → text-amber-600 (2x)

📄 components/charts/FunnelBarChart.tsx (3 changes)
   ✓ #8b5cf6 → bg-indigo-500 (3x)

✅ All fixes applied successfully!

⚠️  Recommendation: Review changes and run tests before committing.
```

## 🔄 Workflow

### Option 1: Manual Workflow

1. **Audit** your code:
   ```bash
   npm run audit:tokens
   ```

2. **Review** violations in terminal or `design-system-audit-report.json`

3. **Fix** automatically:
   ```bash
   npm run fix:tokens:dry  # Preview first
   npm run fix:tokens      # Apply fixes
   ```

4. **Re-audit** to confirm:
   ```bash
   npm run audit:tokens
   ```

5. **Commit** changes

### Option 2: Pre-Commit Hook (Recommended)

Automatically audit on every commit.

**Setup:**

1. Install Husky:
   ```bash
   npm install --save-dev husky
   npx husky init
   ```

2. Add audit to pre-commit:
   ```bash
   echo "npm run audit:tokens" > .husky/pre-commit
   chmod +x .husky/pre-commit
   ```

3. Now every `git commit` will run the auditor first

### Option 3: CI/CD Integration

Add to your GitHub Actions / CI pipeline:

```yaml
- name: Audit Design Tokens
  run: npm run audit:tokens
```

## 📚 Design System Rules

See [DESIGN_SYSTEM_RULES.md](../DESIGN_SYSTEM_RULES.md) for complete rules.

### Quick Reference

**✅ Allowed Colors:**
- `brand-*` (Volt Lime)
- `zinc-*` (Neutral/Structural)
- `red-*`, `green-*`, `blue-*`, `amber-*`, `indigo-*`

**❌ Forbidden Colors:**
- `lime-*`, `yellow-*`, `purple-*`, `violet-*`, `orange-*`, `emerald-*`, `cyan-*`, `sky-*`
- `pink-*`, `rose-*`, `fuchsia-*`, `teal-*`

**🌓 Brand Color Rules:**
- **Light mode base:** `bg-brand-300` for primary actions
- **Light mode hover:** `hover:bg-brand-400`
- **Dark mode base:** `dark:bg-brand-500` for primary actions
- **Dark mode hover:** `dark:hover:bg-brand-600/50` (brand-600 with 50% opacity)
- **Pattern completo:** `bg-brand-300 dark:bg-brand-500 hover:bg-brand-400 dark:hover:bg-brand-600/50`

## 🤖 Working with AI

When prompting AI to generate code:

```
Generate a dashboard card component following Strata Design System:
- Reference DESIGN_SYSTEM_RULES.md
- Use brand-300 (light) / brand-400 (dark) for primary buttons
- Use zinc-* for structural colors
- Never use lime, yellow, or purple colors
- Include dark mode variants for all colors
```

**After AI generation:**

```bash
npm run audit:tokens     # Check for violations
npm run fix:tokens       # Auto-fix common issues
```

## 🔧 Customization

### Add Custom Rules

Edit `audit-design-tokens.mjs`:

```js
// Add to FORBIDDEN_COLOR_SCALES
const FORBIDDEN_COLOR_SCALES = [
  'lime',
  'yellow',
  'your-custom-forbidden-color',
];

// Add custom hex mappings
const HEX_TO_STRATA_MAP = {
  '#yourcolor': 'zinc-500',
};
```

### Add Custom Fixes

Edit `fix-design-tokens.mjs`:

```js
const REPLACEMENTS = [
  // Your custom replacement rule
  {
    pattern: /your-pattern/g,
    replace: 'replacement',
    description: 'Description'
  },
];
```

## 📊 Report Format

The JSON report (`design-system-audit-report.json`) contains:

```json
{
  "results": [
    {
      "file": "components/Example.tsx",
      "violations": [
        {
          "type": "FORBIDDEN_COLOR",
          "severity": "error",
          "line": 45,
          "match": "bg-purple-500",
          "message": "...",
          "suggestion": "bg-indigo-500"
        }
      ]
    }
  ],
  "summary": {
    "totalViolations": 42,
    "errorCount": 28,
    "warningCount": 14,
    "byType": {
      "FORBIDDEN_COLOR": 18,
      "HARDCODED_HEX": 12,
      "BRAND_MISUSE": 8,
      "HARDCODED_RGB": 4
    }
  }
}
```

## 🎓 Examples

### Before (❌ Violations)

```tsx
// Multiple violations
export function BadCard() {
  return (
    <div className="bg-purple-500 border-yellow-400">
      <h2 style={{ color: '#8b5cf6' }}>Title</h2>
      <button className="bg-brand-400 text-white">
        Action
      </button>
    </div>
  );
}
```

### After (✅ Fixed)

```tsx
// Compliant with Strata DS
export function GoodCard() {
  return (
    <div className="bg-indigo-500 dark:bg-indigo-600 border-amber-400 dark:border-amber-500">
      <h2 className="text-indigo-500 dark:text-indigo-400">Title</h2>
      <button className="bg-brand-300 dark:bg-brand-500 text-zinc-900">
        Action
      </button>
    </div>
  );
}
```

## 🆘 Troubleshooting

### "Module not found" Error

Make sure you're running from the `dealer` directory:

```bash
cd ds-selection/dealer
npm run audit:tokens
```

### Too Many Violations

Start with high-priority files:

1. Run audit to see all violations
2. Fix one component at a time
3. Use `fix:tokens:dry` to preview changes before applying

### False Positives

Some violations may be intentional (e.g., chart colors). You can:

1. Add `// eslint-disable-next-line` comments
2. Update the auditor's allowlist
3. Document exceptions in code comments

## 📞 Support

- **Strata Design System:** See `../../Strata Design System/README.md`
- **Brand Guidelines:** See `../../Strata Design System/guidelines/BRAND_STYLING.md`
- **Token Reference:** See `../../Strata Design System/src/tokens/tokens.ts`

---

**Remember:** These tools are helpers, not replacements for understanding the design system. Always review changes before committing! 🎨
