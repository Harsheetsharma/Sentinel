import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { Browser } from 'playwright';

chromium.use(StealthPlugin());

export class SentinelEngine {
    private browser: Browser | null = null;

    async init() {
        this.browser = await chromium.launch({ headless: true });
        console.log("Engine Initialized!");
    }

    async executeTask(url: string, selector: string) {
        if (!this.browser) {
            throw new Error("Engine not initialized!");
        }

        const context = await this.browser.newContext({
            userAgent:
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });

        const page = await context.newPage();

        try {
            await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
            await page.waitForSelector(selector);

            const content = await page.$eval(
                selector,
                el => el.textContent
            );

            const screenshot = await page.screenshot();

            return { content, screenshot };
        } finally {
            await context.close();
        }
    }

    async shutdown() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}
