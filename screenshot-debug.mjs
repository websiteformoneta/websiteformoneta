import puppeteer from './node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';

const browser = await puppeteer.launch({
  executablePath: 'C:/Users/Karso/.cache/puppeteer/chrome/win64-146.0.7680.153/chrome-win64/chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

const html = await page.evaluate(() => document.body.innerHTML.substring(0, 500));
console.log('body start:', html);
const allClasses = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('[class]')).slice(0,20).map(el => el.className).join('\n');
});
console.log('classes:', allClasses);
await browser.close();
