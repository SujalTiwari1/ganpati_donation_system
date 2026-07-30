const { cpSync, mkdirSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const src = join(root, 'src', 'modules', 'receipt');
const dest = join(root, 'dist', 'modules', 'receipt');

mkdirSync(dest, { recursive: true });
cpSync(join(src, 'templates'), join(dest, 'templates'), { recursive: true });
cpSync(join(src, 'assets'), join(dest, 'assets'), { recursive: true });

console.log('Copied receipt templates and assets to dist/modules/receipt');
