// Dev-only verification tool (not part of the feature).
// Loads the /dev-print-preview harness against the running dev server and saves a
// full-page PNG (and optionally a print PDF) of the schedule-showings packet to
// ~/Desktop/Screenshots. Usage: node scripts/print-shot.mjs <name> [pdf]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const name = process.argv[2] || 'shot';
const alsoPdf = process.argv[3] === 'pdf';
const outDir = join(homedir(), 'Desktop', 'Screenshots');
mkdirSync(outDir, { recursive: true });

const URL = 'http://localhost:2000/dev-print-preview';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1400 }, deviceScaleFactor: 2 });
await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
// Settle webfonts/images.
await page.waitForTimeout(800);

const pngPath = join(outDir, `${name}.png`);
await page.screenshot({ path: pngPath, fullPage: true });
console.log('PNG  ->', pngPath);

if (alsoPdf || process.argv[3] === 'nobg') {
    // `nobg` = printBackground:false (simulates the print dialog's "Background
    // graphics" OFF). With print-color-adjust:exact the navy band + tinted cards
    // must STILL render — that's the Chunk-E proof.
    const printBackground = process.argv[3] !== 'nobg';
    const suffix = printBackground ? '' : '-nobg';
    const pdfPath = join(outDir, `${name}${suffix}.pdf`);
    await page.emulateMedia({ media: 'print' });
    await page.pdf({ path: pdfPath, format: 'Letter', printBackground, margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' } });
    console.log('PDF  ->', pdfPath, `(printBackground=${printBackground})`);
}

await browser.close();
