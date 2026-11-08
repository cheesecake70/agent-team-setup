/**
 * shots [--states a,b,c] [--item <slug>]
 *
 * Screenshots every state at every viewport into SHOTS_DIR so the critic can judge them.
 * Each state is a URL query the app honours in dev: ?state=<name>[&item=<slug>].
 *
 * Env: SHOTS_BASE (default http://localhost:3000), SHOTS_DIR (default .shots)
 * Install once: <pm> add -D playwright tsx && npx playwright install chromium
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.SHOTS_BASE ?? "http://localhost:3000";
const DIR = process.env.SHOTS_DIR ?? ".shots";

const args = process.argv.slice(2);
const flag = (name: string) =>
  args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : undefined;

const item = flag("item");
const states = (flag("states") ?? "default").split(",").filter(Boolean);

// Edit to match {{VIEWPORTS}}.
const viewports = [
  { name: "desktop", width: 1440, height: 900, mobile: false },
  { name: "mobile", width: 390, height: 844, mobile: true },
];

mkdirSync(DIR, { recursive: true });

const browser = await chromium.launch();
try {
  for (const vp of viewports) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    for (const state of states) {
      const url = new URL(BASE);
      url.searchParams.set("state", state);
      if (item) url.searchParams.set("item", item);
      await page.goto(url.toString(), { waitUntil: "networkidle" });
      await page.waitForTimeout(300);
      const file = `${DIR}/${vp.name}-${item ? item + "-" : ""}${state}.png`;
      await page.screenshot({ path: file, fullPage: false });
      console.log("shot", file);
    }
    await ctx.close();
  }
} finally {
  await browser.close();
}
