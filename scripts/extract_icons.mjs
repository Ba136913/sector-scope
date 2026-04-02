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

  const svgs = await page.evaluate(() => {
    const results = [];
    const seenNames = new Set();

    document.querySelectorAll('svg').forEach((svg, i) => {
      let name = `Icon_${i}`;
      const parent = svg.parentElement;
      if (parent && parent.tagName === 'BUTTON') {
          name = parent.innerText || parent.getAttribute('aria-label') || name;
      } else if (parent && parent.className && typeof parent.className === 'string') {
          name = parent.className.split(' ')[0] || name;
      }
      
      name = name.replace(/[^a-zA-Z0-9]/g, '_');
      if (seenNames.has(name) || !name || name === 'flex') {
          name = `Icon_${i}`;
      }
      seenNames.add(name);
      
      results.push({
        name,
        html: svg.outerHTML
      });
    });
    return results;
  });

  let iconsFile = `import React from 'react';\n\n`;
  svgs.forEach(svg => {
      // Basic SVG to React component conversion
      let reactHtml = svg.html
        .replace(/class=/g, 'className=')
        .replace(/stroke-width=/g, 'strokeWidth=')
        .replace(/stroke-linecap=/g, 'strokeLinecap=')
        .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
        .replace(/fill-rule=/g, 'fillRule=')
        .replace(/clip-rule=/g, 'clipRule=')
        .replace(/stop-color=/g, 'stopColor=')
        .replace(/clip-path=/g, 'clipPath=')
        .replace(/fill-opacity=/g, 'fillOpacity=')
        .replace(/mask-type:luminance/g, 'maskType: "luminance"') // Special case
        .replace(/style="maskType: "luminance""/g, 'style={{ maskType: "luminance" }}');

      iconsFile += `export const ${svg.name} = (props: React.SVGProps<SVGSVGElement>) => (\n  ${reactHtml.replace('<svg', '<svg {...props}')}\n);\n\n`;
  });

  fs.writeFileSync(path.join(ROOT, 'src/components/icons.tsx'), iconsFile);
  console.log('Icons saved to src/components/icons.tsx');

  await browser.close();
}

run().catch(console.error);
