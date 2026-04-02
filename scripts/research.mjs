import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const TARGET_URL = process.argv[2] || 'https://cto.new/';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`Navigating to ${TARGET_URL}...`);
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });

  // 1. Desktop Screenshot
  console.log('Capturing desktop screenshot...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: path.join(ROOT, 'docs/design-references/desktop_full.png'), fullPage: true });

  // 2. Mobile Screenshot
  console.log('Capturing mobile screenshot...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(ROOT, 'docs/design-references/mobile_full.png'), fullPage: true });

  // 3. Global Extraction
  console.log('Extracting global tokens and assets...');
  const data = await page.evaluate(() => {
    const images = [...document.querySelectorAll('img')].map(img => ({
      src: img.src || img.currentSrc,
      alt: img.alt,
      width: img.naturalWidth,
      height: img.naturalHeight,
      parentClasses: img.parentElement?.className,
      position: getComputedStyle(img).position,
      zIndex: getComputedStyle(img).zIndex
    }));

    const videos = [...document.querySelectorAll('video')].map(v => ({
      src: v.src || v.querySelector('source')?.src,
      poster: v.poster,
      autoplay: v.autoplay,
      loop: v.loop,
      muted: v.muted
    }));

    const backgroundImages = [...document.querySelectorAll('*')].filter(el => {
      const bg = getComputedStyle(el).backgroundImage;
      return bg && bg !== 'none';
    }).map(el => ({
      url: getComputedStyle(el).backgroundImage,
      element: el.tagName + '.' + (typeof el.className === 'string' ? el.className.split(' ')[0] : '')
    }));

    const fonts = [...new Set([...document.querySelectorAll('*')].slice(0, 500).map(el => getComputedStyle(el).fontFamily))];
    const favicons = [...document.querySelectorAll('link[rel*="icon"]')].map(l => ({ href: l.href, sizes: l.sizes?.toString() }));
    
    // Simple topology mapping
    const sections = [...document.querySelectorAll('section, header, footer, main > div')].map((el, i) => ({
      index: i,
      tagName: el.tagName,
      id: el.id,
      className: el.className,
      height: el.offsetHeight,
      top: el.offsetTop
    }));

    // Extract root variables (colors)
    const colors = {};
    for (let i = 0; i < document.styleSheets.length; i++) {
        try {
            const sheet = document.styleSheets[i];
            for (let j = 0; j < sheet.cssRules.length; j++) {
                const rule = sheet.cssRules[j];
                if (rule.selectorText === ':root' || rule.selectorText === 'html') {
                    const cssText = rule.cssText;
                    const matches = cssText.match(/--[\w-]+:\s*[^;]+;/g);
                    if (matches) {
                        matches.forEach(m => {
                            const [k, v] = m.split(':').map(s => s.trim().replace(';', ''));
                            colors[k] = v;
                        });
                    }
                }
            }
        } catch (e) {}
    }

    return {
      title: document.title,
      meta: [...document.querySelectorAll('meta')].map(m => ({ name: m.name, property: m.getAttribute('property'), content: m.content })),
      fonts,
      colors,
      images,
      videos,
      backgroundImages,
      favicons,
      sections,
      svgCount: document.querySelectorAll('svg').length
    };
  });

  fs.writeFileSync(path.join(ROOT, 'docs/research/raw_data.json'), JSON.stringify(data, null, 2));
  console.log('Raw data saved to docs/research/raw_data.json');

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
