import { describe, expect, it } from "vitest";
import { flatten, resolve, toCss, toCssVar } from "./transform";
import { themes, primitives } from "./index";

describe("flatten", () => {
  it("produces dotted paths for leaves", () => {
    expect(flatten({ a: { b: { $value: "1" } }, c: { $value: "2" } })).toEqual({
      "a.b": "1",
      c: "2",
    });
  });
});

describe("resolve", () => {
  it("resolves nested aliases", () => {
    const tokens = { a: "#fff", b: "{a}", c: "1px solid {b}" };
    expect(resolve(tokens)).toEqual({ a: "#fff", b: "#fff", c: "1px solid #fff" });
  });

  it("resolves against an outer scope", () => {
    expect(resolve({ fg: "{color.x}" }, { "color.x": "red" })).toEqual({ fg: "red" });
  });

  it("throws on unknown references", () => {
    expect(() => resolve({ a: "{missing}" })).toThrow(/Unknown token reference "\{missing\}"/);
  });

  it("throws on cycles", () => {
    expect(() => resolve({ a: "{b}", b: "{a}" })).toThrow(/Circular token reference/);
  });
});

describe("css output", () => {
  it("maps paths to prefixed custom properties", () => {
    expect(toCssVar("color.blue.600")).toBe("--sr-color-blue-600");
    expect(toCss(":root", { "a.b": "1px" })).toBe(":root {\n  --sr-a-b: 1px;\n}\n");
  });
});

describe("shipped token set", () => {
  it("light and dark themes define the same semantic tokens", () => {
    expect(Object.keys(themes.dark).sort()).toEqual(Object.keys(themes.light).sort());
  });

  it("contains no unresolved aliases", () => {
    const all = [
      ...Object.values(primitives),
      ...Object.values(themes.light),
      ...Object.values(themes.dark),
    ];
    expect(all.filter((v) => v.includes("{"))).toEqual([]);
  });
});
