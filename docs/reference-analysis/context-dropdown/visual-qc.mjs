import { createRequire } from "node:module";

const require = createRequire("/Users/zhongxin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json");
const { chromium } = require("playwright");
const outputDirectory = "/Users/zhongxin/Documents/Apps/dionysus-ui/docs/reference-analysis/context-dropdown";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });

await page.goto("http://127.0.0.1:20003/components/compact-select", { waitUntil: "networkidle" });
await page.locator("#compact-select-specimen").scrollIntoViewIfNeeded();
await page.waitForTimeout(250);
await page.screenshot({ path: `${outputDirectory}/candidate-closed.png` });

const trigger = page.getByRole("button", { name: "默认首页" });
const triggerBox = await trigger.boundingBox();
await trigger.click();
await page.waitForTimeout(180);

const menu = page.locator('[data-slot="compact-select-menu"]');
const firstOption = menu.getByRole("option").first();
const metrics = {
  trigger: triggerBox,
  menu: await menu.boundingBox(),
  firstOption: await firstOption.boundingBox(),
  triggerStyles: await trigger.evaluate((element) => {
    const style = getComputedStyle(element);
    return { height: style.height, borderRadius: style.borderRadius, fontSize: style.fontSize, padding: style.padding, gap: style.gap };
  }),
  menuStyles: await menu.evaluate((element) => {
    const style = getComputedStyle(element);
    return { padding: style.padding, borderRadius: style.borderRadius, boxShadow: style.boxShadow };
  }),
  optionStyles: await firstOption.evaluate((element) => {
    const style = getComputedStyle(element);
    return { height: style.height, borderRadius: style.borderRadius, fontSize: style.fontSize, padding: style.padding, gap: style.gap };
  }),
};

await page.screenshot({ path: `${outputDirectory}/candidate-open.png` });
await firstOption.press("ArrowDown");
await page.waitForTimeout(50);
const activeLabel = await page.locator('[data-slot="compact-select-menu"] [data-active]').innerText();
await page.keyboard.press("Escape");
await page.waitForTimeout(50);
const focusRestored = await trigger.evaluate((element) => document.activeElement === element);

await trigger.click();
await page.keyboard.press("m");
await page.keyboard.press("Enter");
await page.waitForTimeout(180);
const typeaheadValue = await trigger.innerText();
const menuClosedAfterSelect = await menu.count() === 0;
await page.evaluate(() => document.documentElement.classList.add("dark"));
await trigger.click();
await page.waitForTimeout(180);
const darkMenu = page.locator('[data-slot="compact-select-menu"]');
const darkSelectedOption = darkMenu.locator('[aria-selected="true"]');
const darkMenuStyles = await darkMenu.evaluate((element) => {
  const style = getComputedStyle(element);
  return { backgroundColor: style.backgroundColor, color: style.color, borderColor: style.borderColor };
});
const darkSelectedBox = await darkSelectedOption.boundingBox();
await page.screenshot({ path: `${outputDirectory}/candidate-dark.png` });

console.log(JSON.stringify({ ...metrics, activeLabel, focusRestored, typeaheadValue, menuClosedAfterSelect, darkMenuStyles, darkSelectedBox }, null, 2));
await browser.close();
