
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
// Assumes Strata is a sibling of the 'design-system' folder root or adjusted path
// Current path: design-system/ds-selection/catalyst/scripts/
const STRATA_COMPONENTS = path.resolve(__dirname, '../../../Strata Design System/src/components');
const CATALYST_COMPONENTS = path.resolve(__dirname, '../src/components');

const componentName = process.argv[2];

if (!componentName) {
    console.error('❌ Please provide a component name.');
    console.error('Usage: npm run promote <ComponentName>');
    console.error('Example: npm run promote notifications/ActionCenter');
    process.exit(1);
}

const srcDir = path.join(CATALYST_COMPONENTS, componentName);
const destDir = path.join(STRATA_COMPONENTS, path.basename(componentName));

console.log('🚀 Promoting Component to Strata');
console.log(`   Source: ${srcDir}`);
console.log(`   Dest:   ${destDir}`);

if (!fs.existsSync(srcDir)) {
    console.error(`❌ Source component not found: ${srcDir}`);
    process.exit(1);
}

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

// Recursive copy function
function copyRecursive(src, dest) {
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

try {
    copyRecursive(srcDir, destDir);
    console.log(`✅ Component promoted successfully to Strata!`);
    console.log(`   Next steps:`);
    console.log(`   1. Run 'npm install' in Strata if new dependencies were added.`);
    console.log(`   2. Create a story file in Strata/src/stories/components/${path.basename(componentName)}.stories.tsx`);
} catch (err) {
    console.error('❌ Error copying files:', err);
}
