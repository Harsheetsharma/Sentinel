import { chromium, Browser, BrowserContext } from 'playwright';
import { stealth } from "playwright-stealth";
// import stealth from 'playwright-extra';
import * as cheerio from "cheerio";


async function startworker() {
    let browser = await chromium.launch({
        headless: true
    })
    let context = await browser.newContext();
    return {
        browser, context
    }
}
export async function Goto({ url, selector }: any) {
    const { browser, context } = await startworker();
    const page = await context.newPage();
    await stealth(page);

    await page.goto(`${url}`, {
        waitUntil: "networkidle"
    })
    await page.waitForSelector(selector);

    const content = await page.content();

    const $ = cheerio.load(content);
    const title = $("h1").text();

    console.log('the title is ', title);


    page.click(selector);
    await page.screenshot({ path: "page.png" })

    await browser.close()
}