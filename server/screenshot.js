const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', // or Chrome
    headless: "new"
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  // Wait a bit for fonts to load completely
  await new Promise(resolve => setTimeout(resolve, 2000));

  const logoElement = await page.$('.navbar-logo');
  if (logoElement) {
    await logoElement.screenshot({ path: 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\d4ac2803-5858-440b-9b2d-f04efa0d1fa3\\drake-logo.png' });
    console.log('Screenshot taken!');
  } else {
    console.log('Logo element not found.');
  }

  await browser.close();
})();
