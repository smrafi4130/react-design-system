/**
 * Token transform: flattens a DTCG-style token tree, resolves `{path.to.token}`
 * aliases and emits CSS custom properties.
 *
 * Kept dependency-free on purpose (see ADR-0003 in frontend-architecture):
 * the token set is small, and a 100-line transform is easier to audit than a
 * Style Dictionary configuration.
 */

export interface TokenLeaf {
  $value: string;
  $description?: string;
}
export interface TokenTree {
  [key: string]: TokenTree | TokenLeaf;
}
export type FlatTokens = Record<string, string>;

const ALIAS = /\{([^}]+)\}/g;

function isLeaf(node: TokenTree | TokenLeaf): node is TokenLeaf {
  return typeof (node as TokenLeaf).$value === "string";
}

/** `{ color: { blue: { 600: { $value } } } }` -> `{ "color.blue.600": value }` */
export function flatten(tree: TokenTree, prefix = ""): FlatTokens {
  const out: FlatTokens = {};
  for (const [key, node] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isLeaf(node)) out[path] = node.$value;
    else Object.assign(out, flatten(node, path));
  }
  return out;
}

/** Resolve aliases against `scope`. Throws on unknown references and cycles. */
export function resolve(tokens: FlatTokens, scope: FlatTokens = tokens): FlatTokens {
  const cache = new Map<string, string>();

  const resolveValue = (value: string, stack: string[]): string =>
    value.replace(ALIAS, (_match, ref: string) => {
      if (stack.includes(ref)) {
        throw new Error(`Circular token reference: ${[...stack, ref].join(" -> ")}`);
      }
      const target = tokens[ref] ?? scope[ref];
      if (target === undefined) {
        throw new Error(`Unknown token reference "{${ref}}" in ${stack.at(-1) ?? "value"}`);
      }
      if (cache.has(ref)) return cache.get(ref)!;
      const resolved = resolveValue(target, [...stack, ref]);
      cache.set(ref, resolved);
      return resolved;
    });

  return Object.fromEntries(
    Object.entries(tokens).map(([path, value]) => [path, resolveValue(value, [path])]),
  );
}

/** `color.blue.600` -> `--sr-color-blue-600` */
export function toCssVar(path: string, prefix = "sr"): string {
  return `--${prefix}-${path.replace(/\./g, "-")}`;
}

export function toCss(selector: string, tokens: FlatTokens): string {
  const body = Object.entries(tokens)
    .map(([path, value]) => `  ${toCssVar(path)}: ${value};`)
    .join("\n");
  return `${selector} {\n${body}\n}\n`;
}
