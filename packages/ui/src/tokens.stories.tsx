import type { Meta, StoryObj } from "@storybook/react";
import { themes, cssVar, type SemanticToken } from "@smrafi/tokens";

const meta: Meta = { title: "Foundations/Semantic tokens" };
export default meta;

export const Colors: StoryObj = {
  render: () => (
    <table style={{ borderCollapse: "collapse", color: "var(--sr-fg-default)" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", padding: 8 }}>Token</th>
          <th style={{ textAlign: "left", padding: 8 }}>Swatch</th>
          <th style={{ textAlign: "left", padding: 8 }}>Light</th>
          <th style={{ textAlign: "left", padding: 8 }}>Dark</th>
        </tr>
      </thead>
      <tbody>
        {(Object.keys(themes.light) as SemanticToken[]).map((token) => (
          <tr key={token}>
            <td style={{ padding: 8, fontFamily: "var(--sr-font-family-mono)" }}>{token}</td>
            <td style={{ padding: 8 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 32,
                  height: 20,
                  borderRadius: 4,
                  border: "1px solid var(--sr-border-default)",
                  background: cssVar(token),
                }}
              />
            </td>
            <td style={{ padding: 8 }}>{themes.light[token]}</td>
            <td style={{ padding: 8 }}>{themes.dark[token]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};
