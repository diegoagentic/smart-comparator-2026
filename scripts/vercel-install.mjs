import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// Strip heavy devDependencies from strata-ds before npm install on Vercel.
// Keeps only the packages needed for the lib build (vite, tailwind, postcss, types).
const pkgPath = resolve('packages/strata-ds/package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

const keep = [
  '@tailwindcss/postcss',
  '@tailwindcss/vite',
  '@vitejs/plugin-react',
  'postcss',
  'tailwindcss',
  'vite',
  '@types/react',
  '@types/react-dom',
  'typescript',
];

const before = Object.keys(pkg.devDependencies || {}).length;
pkg.devDependencies = Object.fromEntries(
  Object.entries(pkg.devDependencies || {}).filter(([k]) => keep.includes(k))
);
const after = Object.keys(pkg.devDependencies).length;

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`Stripped strata-ds devDeps: ${before} → ${after} (removed ${before - after} heavy packages)`);
