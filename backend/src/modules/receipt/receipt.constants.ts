import path from 'node:path';

const ROOT = __dirname;

export const RECEIPT_PATHS = {
  TEMPLATE: path.join(ROOT, 'templates', 'receipt.html'),
  CSS: path.join(ROOT, 'templates', 'receipt.css'),
  ASSETS: path.join(ROOT, 'assets'),
} as const;
export const RECEIPT_MESSAGES = {
  NOT_FOUND: 'Receipt not found.',
} as const;
