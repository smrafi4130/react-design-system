# react-design-system

[![CI](https://github.com/smrafi4130/react-design-system/actions/workflows/ci.yml/badge.svg)](https://github.com/smrafi4130/react-design-system/actions/workflows/ci.yml)

A small, token-driven React component library built around **accessibility as a tested property**, not a checklist.
Two versioned packages in a pnpm monorepo, documented in Storybook.

| Package                             | Purpose                                                                                        |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| [`@smrafi/tokens`](packages/tokens) | Primitive + semantic design tokens (light/dark) compiled to CSS custom properties and typed JS |
| [`@smrafi/ui`](packages/ui)         | Button, Field, Checkbox, Dialog, Tabs, Toast, Tooltip                                          |

## Problem

Teams re-implement dialogs, tabs and form wiring per product, and each copy gets focus handling, ARIA and theming slightly wrong.
This repo shows how I would build the shared layer: a small API surface, behaviour verified by tests, and a release process that makes breaking changes visible.

## Design decisions

- **Tokens in two tiers.** Primitives (`color.blue.600`) are never used by components. Components only use semantic tokens (`accent.default`), and themes remap those. Adding dark mode touched no component code. The transform (`packages/tokens/src/transform.ts`) is ~60 lines, resolves aliases, and fails the build on unknown references or cycles.
- **Compound components + `asChild`.** `Dialog.Trigger`, `Field.Control` etc. share state through context and render the consumer's element via `Slot`, so a `Button` can be a router `<Link>` with no wrapper DOM.
- **One controlled/uncontrolled contract.** `useControllableState` backs every stateful primitive.
- **Native elements first.** `Checkbox` is a real `<input>`; Button defaults to `type="button"`; loading uses `aria-busy` and keeps focus rather than `disabled`.
- **Consumers can opt out of behaviour** via `event.preventDefault()` (`composeEventHandlers`).

## Accessibility verification

Each component's tests assert behaviour (focus trap, roving tabindex, Escape/restore focus, live-region roles) and run `axe-core`.
That already paid off: axe flagged `role="status"` on a toast `<li>` breaking list semantics; the fix is in `toast.tsx`.
Storybook runs the a11y addon with `test: "error"`, which also covers colour contrast (jsdom cannot).

## Testing strategy

| Layer             | Tool                                                    | Covers                                        |
| ----------------- | ------------------------------------------------------- | --------------------------------------------- |
| Unit              | Vitest + Testing Library                                | keyboard, focus, ARIA wiring, token transform |
| a11y              | axe-core (jsdom) + Storybook addon (browser)            | rule violations, contrast                     |
| Visual regression | Playwright screenshots of built stories, light and dark | unintended style changes                      |

## Getting started

```bash
pnpm install
pnpm storybook          # component docs on :6006
pnpm lint && pnpm typecheck && pnpm test && pnpm build
pnpm build-storybook && pnpm test:visual
```

Usage:

```tsx
import "@smrafi/tokens/tokens.css";
import "@smrafi/ui/styles.css";
import { Dialog, Button } from "@smrafi/ui";
```

Set `data-theme="dark"` on `<html>` to force dark; otherwise `prefers-color-scheme` applies.

## Versioning and release

[Changesets](https://github.com/changesets/changesets): each PR adds a changeset, and `release.yml` opens a "Version packages" PR and publishes to npm when it merges (requires an `NPM_TOKEN` secret).
**Status: not yet published to npm.**

## Trade-offs and limitations

- **Visual baselines are platform-specific.** The committed ones were generated in a Linux Chromium; CI runs in the Playwright container and the "Update visual baselines" workflow regenerates them if rendering differs. Treat the first CI run as the one that may need a baseline refresh.
- **Tooltip has no collision detection** (CSS above/below only). A production library would use floating-ui; I kept it dependency-free to keep the focus on semantics.
- **No focus-scope for nested dialogs**, and no inert/aria-hidden on background content yet.
- **Seven components, not a full kit.** No Select/Combobox/Menu; those need virtualised listbox work I would rather do properly than superficially.
- **CSS is plain stylesheets** (single-class specificity) rather than CSS-in-JS, so it works with RSC and has no runtime cost.

## Roadmap

Select/Menu primitives, floating-ui positioning, `inert` background handling, token export to Figma variables.

## License

MIT
