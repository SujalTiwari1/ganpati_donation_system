import path from 'node:path';

/**
 * Resolve receipt module paths relative to this file so they work in both
 * dev (tsx → src/modules/receipt) and production (node → dist/modules/receipt).
 */
const ROOT = path.resolve(__dirname);

export const RECEIPT_PATHS = {
  ROOT,
  TEMPLATE: path.join(ROOT, 'templates', 'receipt.html'),
  CSS: path.join(ROOT, 'templates', 'receipt.css'),
  ASSETS: path.join(ROOT, 'assets'),
} as const;

export const RECEIPT_MESSAGES = {
  NOT_FOUND: 'Receipt not found.',
} as const;
