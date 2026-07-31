import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import puppeteer, { PDFOptions } from 'puppeteer';

interface GeneratePdfOptions {
  html: string;
  cssPath: string;
  pdfOptions?: PDFOptions;
}

export class PdfGenerator {
  async generate({ html, cssPath, pdfOptions }: GeneratePdfOptions): Promise<Buffer> {
    const css = await fs.readFile(cssPath, 'utf-8');
    const templateDir = path.dirname(cssPath);

    const finalHtml = this.prepareHtml({ html, css });

    // Render from a real file:// URL so relative asset paths (../assets/*.png)
    // resolve correctly. setContent() has no document base URL in Puppeteer 25.
    const tempHtmlPath = path.join(
      templateDir,
      `.receipt-render-${process.pid}-${Date.now()}.html`,
    );
    await fs.writeFile(tempHtmlPath, finalHtml, 'utf-8');

    const executablePath = await this.findBrowserExecutablePath();
    const browser = await puppeteer.launch({
      headless: true,
      ...(executablePath ? { executablePath } : {}),
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files'],
    });

    try {
      const page = await browser.newPage();

      await page.goto(pathToFileURL(tempHtmlPath).href, {
        waitUntil: 'networkidle0',
      });

      await page.evaluate(async () => {
        await Promise.all(
          Array.from(document.images).map((image) => {
            if (image.complete) {
              return Promise.resolve();
            }

            return new Promise<void>((resolve, reject) => {
              image.addEventListener('load', () => resolve(), { once: true });
              image.addEventListener(
                'error',
                () => reject(new Error(`Failed to load image: ${image.src}`)),
                { once: true },
              );
            });
          }),
        );

        if (document.fonts?.ready) {
          await document.fonts.ready;
        }
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
      await fs.unlink(tempHtmlPath).catch(() => undefined);
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

  private prepareHtml({ html, css }: { html: string; css: string }): string {
    // Drop the external stylesheet link — CSS is inlined below so Puppeteer
    // does not need a second network/file fetch for receipt.css.
    let preparedHtml = html.replace(/<link[^>]*href=["']receipt\.css["'][^>]*\/?>/i, '');
    preparedHtml = preparedHtml.replace('</head>', `<style>${css}</style></head>`);
    return preparedHtml;
  }
}

export const pdfGenerator = new PdfGenerator();
