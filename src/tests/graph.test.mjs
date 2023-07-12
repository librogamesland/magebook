
import { wait, existsVisible, textContent, clickOn } from './utils.mjs'
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { preview } from 'vite'
import puppeteer from 'puppeteer';



describe('graph generation', async () => {

  let server, browser, page;

  beforeAll(async () => {
    server = await preview()
    browser = await puppeteer.launch({headless: 'new'});
    //browser = await puppeteer.launch({headless: false});
  });

  beforeEach(async () => {
    if(page) await page.close()
    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(server.resolvedUrls.local[0]);
    //await page.goto('https://magebook.github.io');
    await wait(500)
  });



  afterAll(async () => {
    await browser.close()
    await new Promise((resolve, reject) => {
      server.httpServer.close(error => error ? reject(error) : resolve())
    })
  })

  test('should work', async () => {
    const text = await page.evaluate(() => document.body.textContent);
    await wait(1000)
    //expect(text).toBe('Hello World');
  })  

})