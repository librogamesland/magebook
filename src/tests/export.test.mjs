
import { wait, existsVisible, textContent, clickOn } from './utils.mjs'
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { preview } from 'vite'
import puppeteer from 'puppeteer';
import tmp from 'tmp-promise'
import fs  from 'fs/promises';





describe('export working', async () => {

  let server, browser, page;
  let dirClean, dirPath;

  beforeAll(async () => {
    const { path, cleanup } = await tmp.dir({ unsafeCleanup: true })
    dirPath = path
    dirClean = cleanup
    server = await preview()
    //browser = await puppeteer.launch({headless: 'new'});
    browser = await puppeteer.launch({headless: false});
  });

  beforeEach(async () => {
    if(page) await page.close()
    page = await browser.newPage();
    const client = await page.target().createCDPSession()
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: dirPath,
    });


    await page.setViewport({ width: 1920, height: 1080 }); 
    await page.goto(server.resolvedUrls.local[0]);
    //await page.goto('https://magebook.github.io');
    await wait(500)
  });



  afterAll(async () => {
    await dirClean()
    await browser.close()
    await new Promise((resolve, reject) => {
      server.httpServer.close(error => error ? reject(error) : resolve())
    })
  })




  // Check if elements are on the page at given viewport size
  test('download button', async () => {
    await clickOn(page, 'nav div:nth-child(3) div.content p:nth-child(1)')
    await clickOn(page, 'nav div:nth-child(3) div.content p:nth-child(2)')
    await clickOn(page, 'nav div:nth-child(3) div.content p:nth-child(3)')
    await clickOn(page, 'nav div:nth-child(3) div.content p:nth-child(5)')


    console.log(dirPath)
    await wait(1000)
    await clickOn(page, 'nav div:nth-child(3) div.content p:nth-child(4)')
    await wait(1000)

    const extensions = {
      'html': 0,
      'docx': 0,
      'pdf': 0,
      'fodt': 0,
      'xlgc': 0,
    }
    const files = await fs.readdir(dirPath);
    for (const file of files) {
      const ext = file.split('.').pop()
      expect(ext in extensions).toBe(true)
      if (ext in extensions) extensions[ext]++
    }
    expect(extensions).toEqual({
      'html': 2,
      'docx': 1,
      'pdf': 0,
      'fodt': 1,
      'xlgc': 1,
    })  
    await wait(2000)
  }, 30000)

  
})