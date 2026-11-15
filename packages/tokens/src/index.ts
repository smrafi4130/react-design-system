import primitivesJson from "../tokens/primitives.json";
import lightJson from "../tokens/theme-light.json";
import darkJson from "../tokens/theme-dark.json";
import { flatten, resolve, toCssVar, type TokenTree } from "./transform";

export { flatten, resolve, toCss, toCssVar } from "./transform";
export type { FlatTokens, TokenTree, TokenLeaf } from "./transform";

const primitiveFlat = flatten(primitivesJson as TokenTree);

/** Fully resolved primitive tokens, keyed by dotted path. */
export const primitives = resolve(primitiveFlat);

/** Semantic tokens per theme, resolved against primitives. */
export const themes = {
  light: resolve(flatten(lightJson as TokenTree), primitiveFlat),
  dark: resolve(flatten(darkJson as TokenTree), primitiveFlat),
} as const;

export type ThemeName = keyof typeof themes;
export type SemanticToken = keyof typeof themes.light;

/** `cssVar("accent.default")` -> `var(--sr-accent-default)` */
export function cssVar(token: SemanticToken | keyof typeof primitives): string {
  return `var(${toCssVar(token)})`;
}
