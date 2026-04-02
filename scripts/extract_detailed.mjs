import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const TARGET_URL = 'https://cto.new/';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`Navigating to ${TARGET_URL}...`);
  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

  const data = await page.evaluate(() => {
    function getComputedStyles(selector) {
      const el = document.querySelector(selector);
      if (!el) return null;
      const cs = getComputedStyle(el);
      return {
        color: cs.color,
        backgroundColor: cs.backgroundColor,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        fontFamily: cs.fontFamily,
        padding: cs.padding,
        margin: cs.margin,
        borderRadius: cs.borderRadius,
        border: cs.border,
        boxShadow: cs.boxShadow
      };
    }

    const tokens = {
      body: getComputedStyles('body'),
      header: getComputedStyles('header'),
      footer: getComputedStyles('footer'),
      h1: getComputedStyles('h1') || getComputedStyles('.text-5xl') || getComputedStyles('.text-6xl'),
      button: getComputedStyles('button') || getComputedStyles('a.bg-cto-black') || getComputedStyles('.bg-black'),
    };

    // Extract all text content to understand sections better
    const sections = [...document.querySelectorAll('section, header, footer, main > div, body > div > div')].map(el => {
      return {
        tagName: el.tagName,
        className: el.className,
        text: el.innerText.split('\n').filter(t => t.trim()).slice(0, 10),
        id: el.id
      };
    });

    return { tokens, sections };
  });

  fs.writeFileSync(path.join(ROOT, 'docs/research/detailed_tokens.json'), JSON.stringify(data, null, 2));
  console.log('Detailed tokens saved.');

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
