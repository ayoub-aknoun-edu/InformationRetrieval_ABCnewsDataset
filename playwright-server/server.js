

const cors = require('cors');
const { chromium } = require('playwright');
const express = require('express');
const app = express();
const port = 3000;

let browser;
let context;

async function launchBrowser() {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext();
}

launchBrowser();

app.use(cors()); // enable CORS for all routes

app.get('/goto', async (req, res) => {
  const { url } = req.query;

  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle' }); // wait until the page has no more than 0 network connections for at least 500 ms

    const [link] = await Promise.all([
      page.waitForSelector('div[data-testid="search-hit-content"] a', { waitUntil:'networkidle' }),
      
    ]);

    const href = await link.getAttribute('href');
    await page.goto(href, { target: 'new' });// navigate to the link instead of returning it
    res.send(href);
  } catch (error) {
    console.error(`Error getting link for "${url}": ${error.message}`);
    res.status(500).send(error.message);
  } finally {
    await page.close();
  }
});

app.listen(port, () => {
  console.log(`Playwright server listening at http://localhost:${port}`);
});