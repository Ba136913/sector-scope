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

  // Check for model selector interaction
  console.log('Checking model selector...');
  const selectorExists = await page.isVisible('button:has-text("Claude"), .relative.inline-block');
  if (selectorExists) {
    console.log('Model selector found, attempting to click...');
    // Try to find a button that looks like a selector
    const selectorButton = await page.locator('button:has-text("Claude"), .relative button').first();
    if (await selectorButton.count() > 0) {
        await selectorButton.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(ROOT, 'docs/design-references/model_selector_open.png') });
        console.log('Model selector opened and captured.');
    }
  }

  // Check mobile menu
  console.log('Checking mobile menu...');
  await page.setViewportSize({ width: 390, height: 844 });
  const menuButton = await page.locator('button:has-text("menu"), [aria-label*="menu"], .xl\\:hidden button').first();
  if (await menuButton.count() > 0 && await menuButton.isVisible()) {
    console.log('Mobile menu button found, clicking...');
    await menuButton.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ROOT, 'docs/design-references/mobile_menu_open.png') });
    console.log('Mobile menu opened and captured.');
  }

  await browser.close();
}

run().catch(console.error);
