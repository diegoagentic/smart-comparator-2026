
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const STRATA_ROOT = path.resolve(__dirname, '../../../../Strata Design System');
const CATALYST_ROOT = path.resolve(__dirname, '../');

const MAPPINGS = [
    {
        name: 'Light Mode Tokens',
        src: path.join(STRATA_ROOT, 'src/styles/tokens/variables.css'),
        dest: path.join(CATALYST_ROOT, 'src/styles/tokens/variables.css')
    },
    {
        name: 'Dark Mode Tokens',
        src: path.join(STRATA_ROOT, 'src/styles/tokens/variables-dark.css'),
        dest: path.join(CATALYST_ROOT, 'src/styles/tokens/variables-dark.css')
    }
];

console.log('🔄 Strata <-> Catalyst Token Sync');
console.log('=================================');
console.log(`Source: ${STRATA_ROOT}`);
console.log(`Dest:   ${CATALYST_ROOT}`);
console.log('---------------------------------');

let successCount = 0;

MAPPINGS.forEach(item => {
    try {
        if (!fs.existsSync(item.src)) {
            console.error(`❌ [${item.name}] Source not found: ${item.src}`);
            return;
        }

        const content = fs.readFileSync(item.src, 'utf8');
        fs.writeFileSync(item.dest, content);
        console.log(`✅ [${item.name}] Synced successfully.`);
        successCount++;
    } catch (err) {
        console.error(`❌ [${item.name}] Error syncing:`, err.message);
    }
});

console.log('---------------------------------');
if (successCount === MAPPINGS.length) {
    console.log('✨ All tokens synced successfully!');
} else {
    console.log('⚠️  Some tokens failed to sync.');
    process.exit(1);
}
