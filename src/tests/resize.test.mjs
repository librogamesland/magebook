
import { wait, existsVisible, textContent, clickOn } from './utils.mjs'
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { preview } from 'vite'
import puppeteer from 'puppeteer';




describe('ui resizing', async () => {

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


  // Check if elements are on the page at given viewport size
  test('resize', async () => {

    expect(await textContent(page, 'main div.toolbar h1')).toBe('');
    expect(await existsVisible(page, 'nav .dropbtn.icon-resize-full')).toBeTruthy();
    expect(await existsVisible(page, 'nav .dropbtn.icon-moon')).toBeTruthy();
    expect(await existsVisible(page, 'nav .dropbtn.icon-cog')).toBeTruthy();
    expect(await existsVisible(page, 'main .toolbar')).toBeTruthy();
    expect(await existsVisible(page, 'main .textarea')).toBeTruthy();

    expect(await existsVisible(page, 'aside')).toBeTruthy();
    expect(await existsVisible(page, 'nav .dropbtn.icon-menu')).toBeFalsy();
    expect(await existsVisible(page, '.mask.foreground')).toBeFalsy();



    await page.setViewport({ width: 550, height: 900 });
    await wait(200)
    expect(await existsVisible(page, 'nav .dropbtn.icon-resize-full')).toBeFalsy();
    expect(await existsVisible(page, 'nav .dropbtn.icon-moon')).toBeFalsy();
    expect(await existsVisible(page, 'nav .dropbtn.icon-cog')).toBeFalsy();
    expect(await existsVisible(page, 'main .toolbar')).toBeTruthy();
    expect(await existsVisible(page, 'main .textarea')).toBeTruthy();
    expect(await existsVisible(page, 'aside')).toBeFalsy();
    expect(await existsVisible(page, 'nav .dropbtn.icon-menu')).toBeTruthy();
    expect(await existsVisible(page, '.mask.foreground')).toBeFalsy();


    await clickOn(page, 'nav .dropbtn.icon-menu');
    await wait(1000)

    expect(await existsVisible(page, 'nav .dropbtn.icon-resize-full')).toBeTruthy();
    expect(await existsVisible(page, 'nav .dropbtn.icon-moon')).toBeTruthy();
    expect(await existsVisible(page, 'nav .dropbtn.icon-cog')).toBeTruthy();
    expect(await existsVisible(page, 'main .toolbar')).toBeTruthy();
    expect(await existsVisible(page, 'main .textarea')).toBeTruthy();
    expect(await existsVisible(page, 'aside')).toBeTruthy();
    expect(await existsVisible(page, '.mask.foreground')).toBeTruthy();


    await clickOn(page, '.mask.foreground');
    await wait(1000)
    expect(await existsVisible(page, 'nav .dropbtn.icon-resize-full')).toBeFalsy();
    expect(await existsVisible(page, 'nav .dropbtn.icon-moon')).toBeFalsy();
    expect(await existsVisible(page, 'nav .dropbtn.icon-cog')).toBeFalsy();
    expect(await existsVisible(page, 'main .toolbar')).toBeTruthy();
    expect(await existsVisible(page, 'main .textarea')).toBeTruthy();
    expect(await existsVisible(page, 'aside')).toBeFalsy();
    expect(await existsVisible(page, 'nav .dropbtn.icon-menu')).toBeTruthy();
    expect(await existsVisible(page, '.mask.foreground')).toBeFalsy();

    await clickOn(page, 'nav .dropbtn.icon-menu');
    await wait(1000)

    expect(await existsVisible(page, 'nav .dropbtn.icon-resize-full')).toBeTruthy();
    expect(await existsVisible(page, 'nav .dropbtn.icon-moon')).toBeTruthy();
    expect(await existsVisible(page, 'nav .dropbtn.icon-cog')).toBeTruthy();
    expect(await existsVisible(page, 'main .toolbar')).toBeTruthy();
    expect(await existsVisible(page, 'main .textarea')).toBeTruthy();
    expect(await existsVisible(page, 'aside')).toBeTruthy();
    expect(await existsVisible(page, '.mask.foreground')).toBeTruthy();

    await clickOn(page, 'aside ul.chapters a:nth-child(2)');
    await wait(1000)
    expect(await existsVisible(page, 'nav .dropbtn.icon-resize-full')).toBeFalsy();
    expect(await existsVisible(page, 'nav .dropbtn.icon-moon')).toBeFalsy();
    expect(await existsVisible(page, 'nav .dropbtn.icon-cog')).toBeFalsy();
    expect(await existsVisible(page, 'main .toolbar')).toBeTruthy();
    expect(await existsVisible(page, 'main .textarea')).toBeTruthy();
    expect(await existsVisible(page, 'aside')).toBeFalsy();
    expect(await existsVisible(page, 'nav .dropbtn.icon-menu')).toBeTruthy();
    expect(await existsVisible(page, '.mask.foreground')).toBeFalsy();
    expect(await existsVisible(page, 'main div.toolbar h1')).toBeTruthy();


    expect(await textContent(page, 'main div.toolbar h1')).toBe('2 - Chapter with a long title');


    await page.setViewport({ width: 300, height: 900 });
    await wait(200)
    expect(await existsVisible(page, 'nav .dropbtn.icon-resize-full')).toBeFalsy();
    expect(await existsVisible(page, 'nav .dropbtn.icon-moon')).toBeFalsy();
    expect(await existsVisible(page, 'nav .dropbtn.icon-cog')).toBeFalsy();
    expect(await existsVisible(page, 'main .toolbar')).toBeTruthy();
    expect(await existsVisible(page, 'main .textarea')).toBeTruthy();
    expect(await existsVisible(page, 'aside')).toBeFalsy();
    expect(await existsVisible(page, 'nav .dropbtn.icon-menu')).toBeTruthy();
    expect(await existsVisible(page, '.mask.foreground')).toBeFalsy();
    expect(await existsVisible(page, 'main div.toolbar h1')).toBeFalsy(); // check that the title is hidden


  }, 15000)


})