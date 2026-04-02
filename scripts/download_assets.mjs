import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const TARGET_URL = 'https://cto.new/';

async function download(url, filePath) {
  if (!url || url.startsWith('data:')) return;
  
  // Ensure absolute URL
  if (url.startsWith('//')) url = 'https:' + url;
  if (url.startsWith('/')) url = new URL(url, TARGET_URL).href;

  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(filePath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else if (res.statusCode === 301 || res.statusCode === 302) {
        // Handle redirect
        download(res.headers.location, filePath).then(resolve).catch(reject);
      } else {
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

  const assets = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')].map(img => img.src);
    const bgImgs = [...document.querySelectorAll('*')]
      .map(el => getComputedStyle(el).backgroundImage)
      .filter(bg => bg && bg.startsWith('url('))
      .map(bg => bg.match(/url\("?(.+?)"?\)/)[1]);
    const favicons = [...document.querySelectorAll('link[rel*="icon"]')].map(l => l.href);
    
    return [...new Set([...imgs, ...bgImgs, ...favicons])];
  });

  console.log(`Found ${assets.length} assets. Downloading...`);

  for (const asset of assets) {
    try {
      const url = new URL(asset, TARGET_URL);
      let fileName = path.basename(url.pathname);
      if (!fileName || fileName === '/') fileName = 'index.html';
      
      const ext = path.extname(fileName);
      const category = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif'].includes(ext.toLowerCase()) ? 'images' : 'other';
      
      const filePath = path.join(ROOT, 'public', category, fileName);
      console.log(`Downloading ${asset} -> ${filePath}`);
      await download(asset, filePath);
    } catch (e) {
      console.error(`Error downloading ${asset}: ${e.message}`);
    }
  }

  await browser.close();
  console.log('Finished downloading assets.');
}

run().catch(console.error);
