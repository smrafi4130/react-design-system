import { expect, test } from "@playwright/test";

const stories = [
  "components-button--all-variants",
  "components-button--loading",
  "components-field--default",
  "components-field--with-error",
  "components-checkbox--default",
  "components-tabs--horizontal",
  "components-tabs--vertical",
  "components-dialog--open",
];

for (const theme of ["light", "dark"] as const) {
  for (const id of stories) {
    test(`${id} (${theme})`, async ({ page }) => {
      await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=theme:${theme}`);
      await page.locator("#storybook-root").waitFor();
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`${id}-${theme}.png`);
    });
  }
}

test("tabs keyboard focus ring is visible", async ({ page }) => {
  await page.goto("/iframe.html?id=components-tabs--horizontal&viewMode=story");
  await page.getByRole("tab", { name: "Overview" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Issues" })).toBeFocused();
  await expect(page).toHaveScreenshot("tabs-focus-ring.png");
});
