// receipt.constants.ts

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.dirname(__filename);

export const RECEIPT_PATHS = {
  TEMPLATE: path.join(ROOT, 'templates', 'receipt.html'),
  CSS: path.join(ROOT, 'templates', 'receipt.css'),
  ASSETS: path.join(ROOT, 'assets'),
} as const;
export const RECEIPT_MESSAGES = {
  NOT_FOUND: 'Receipt not found.',
} as const;
