import axe from "axe-core";
import { expect } from "vitest";

/**
 * Runs axe-core against a rendered container and fails with a readable list of
 * violations. `color-contrast` is disabled because jsdom has no layout/paint;
 * contrast is covered by the token review and the Storybook a11y addon.
 */
export async function expectNoA11yViolations(container: Element) {
  const results = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
  const summary = results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`);
  expect(summary).toEqual([]);
}
