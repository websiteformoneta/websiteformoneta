import puppeteer from './node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';

const browser = await puppeteer.launch({
  executablePath: 'C:/Users/Karso/.cache/puppeteer/chrome/win64-146.0.7680.153/chrome-win64/chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

// Get signal strip position
const signalRect = await page.evaluate(() => {
  const el = document.querySelector('.signal-strip');
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, height: r.height, visible: el.offsetHeight > 0 };
});
console.log('signal-strip rect:', JSON.stringify(signalRect));

// Get transform panel position
const transformRect = await page.evaluate(() => {
  const el = document.querySelector('.transform-panel');
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const scrollTop = window.scrollY;
  return { absTop: r.top + scrollTop, height: r.height };
});
console.log('transform-panel rect:', JSON.stringify(transformRect));

// Screenshot hero top with signal strip
await page.screenshot({ path: './temporary screenshots/hero-top.png', clip: { x: 0, y: 60, width: 1440, height: 200 } });

// Scroll to transform panel
if (transformRect) {
  await page.evaluate((top) => window.scrollTo(0, top - 100), transformRect.absTop);
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: './temporary screenshots/transform-panel.png', clip: { x: 0, y: 0, width: 1440, height: 500 } });
}

await browser.close();
