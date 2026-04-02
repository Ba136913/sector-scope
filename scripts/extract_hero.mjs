import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const TARGET_URL = 'https://cto.new/';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

  const data = await page.evaluate(() => {
    const el = document.querySelector('div.flex-col.items-center.justify-center.pt-10');
    if (!el) return { error: 'Hero element not found' };
    
    // ... same walk and extractStyles functions ...
    const props = [
      'fontSize','fontWeight','fontFamily','lineHeight','letterSpacing','color',
      'textTransform','textDecoration','backgroundColor','background',
      'padding','paddingTop','paddingRight','paddingBottom','paddingLeft',
      'margin','marginTop','marginRight','marginBottom','marginLeft',
      'width','height','maxWidth','minWidth','maxHeight','minHeight',
      'display','flexDirection','justifyContent','alignItems','gap',
      'gridTemplateColumns','gridTemplateRows',
      'borderRadius','border','borderTop','borderBottom','borderLeft','borderRight',
      'boxShadow','overflow','overflowX','overflowY',
      'position','top','right','bottom','left','zIndex',
      'opacity','transform','transition','cursor',
      'objectFit','objectPosition','mixBlendMode','filter','backdropFilter',
      'whiteSpace','textOverflow','WebkitLineClamp'
    ];

    function extractStyles(element) {
      const cs = getComputedStyle(element);
      const styles = {};
      props.forEach(p => { 
        const v = cs[p]; 
        if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px' && v !== 'rgba(0, 0, 0, 0)') styles[p] = v; 
      });
      return styles;
    }

    function walk(element, depth) {
      if (depth > 6) return null;
      const children = [...element.children];
      return {
        tag: element.tagName.toLowerCase(),
        classes: element.className?.toString(),
        text: element.childNodes.length === 1 && element.childNodes[0].nodeType === 3 ? element.textContent.trim() : null,
        styles: extractStyles(element),
        images: element.tagName === 'IMG' ? { src: element.src, alt: element.alt } : null,
        children: children.map(c => walk(c, depth + 1)).filter(Boolean)
      };
    }

    return walk(el, 0);
  });

  fs.writeFileSync(path.join(ROOT, 'docs/research/components/Hero.json'), JSON.stringify(data, null, 2));
  console.log('Hero data saved.');

  await browser.close();
}

run().catch(console.error);
