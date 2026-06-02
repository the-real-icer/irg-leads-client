// Dev-only verification (not part of the feature). Reads computed styles from the
// /dev-print-preview harness: confirms the packet stays light under CRM dark mode
// and that print-color-adjust is in effect.
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1400 } });
await page.goto('http://localhost:2000/dev-print-preview', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(800);

const result = await page.evaluate(() => {
    document.documentElement.classList.add('dark'); // simulate CRM dark mode
    const cs = (el) => (el ? getComputedStyle(el).backgroundColor : null);
    const root = document.querySelector('.print-document-root-preview');
    const navy = [...document.querySelectorAll('div')].find((d) => (d.className || '').includes('bg-[#111827]'));
    const card = [...document.querySelectorAll('section,div')].find((d) => (d.className || '').includes('bg-[#f8fafc]'));
    const out = {
        htmlHasDark: document.documentElement.classList.contains('dark'),
        rootBg: cs(root),
        navyBandBg: cs(navy),
        tintedCardBg: cs(card),
        rootPrintColorAdjust: root ? getComputedStyle(root).printColorAdjust : null,
    };
    document.documentElement.classList.remove('dark');
    return out;
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
