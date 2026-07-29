import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import puppeteer, { PDFOptions } from 'puppeteer';

interface GeneratePdfOptions {
  html: string;
  cssPath: string;
  assetsPath: string;
  pdfOptions?: PDFOptions;
}

export class PdfGenerator {
  async generate({ html, cssPath, assetsPath, pdfOptions }: GeneratePdfOptions): Promise<Buffer> {
    const css = await fs.readFile(cssPath, 'utf-8');

    const finalHtml = this.prepareHtml({
      html,
      css,
      assetsPath,
    });

    const executablePath = await this.findBrowserExecutablePath();
    const browser = await puppeteer.launch({
      headless: true,
      ...(executablePath ? { executablePath } : {}),
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();

      await page.setContent(finalHtml, {
        waitUntil: 'domcontentloaded',
      });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '0',
          right: '0',
          bottom: '0',
          left: '0',
        },
        ...pdfOptions,
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private async findBrowserExecutablePath(): Promise<string | undefined> {
    const explicitPath = process.env.CHROME_PATH || process.env.CHROMIUM_PATH;
    if (explicitPath && (await this.fileExists(explicitPath))) {
      return explicitPath;
    }

    const candidates = this.getBrowserCandidates();
    for (const candidate of candidates) {
      if (await this.fileExists(candidate)) {
        return candidate;
      }
    }

    return undefined;
  }

  private getBrowserCandidates(): string[] {
    const platform = os.platform();

    if (platform === 'win32') {
      return [
        'C:/Program Files/Google/Chrome/Application/chrome.exe',
        'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
        'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
        'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
        'C:/Program Files/Chromium/Application/chrome.exe',
      ];
    }

    if (platform === 'darwin') {
      return [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
      ];
    }

    return [
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
    ];
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private prepareHtml({
    html,
    css,
    assetsPath,
  }: {
    html: string;
    css: string;
    assetsPath: string;
  }): string {
    const normalizedAssets = assetsPath.replace(/\\/g, '/');

    return html
      .replace('</head>', `<style>${css}</style></head>`)
      .replaceAll('__ASSETS__', `file://${normalizedAssets}`);
  }
}

export const pdfGenerator = new PdfGenerator();
