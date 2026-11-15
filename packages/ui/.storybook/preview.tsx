import type { Preview } from "@storybook/react";
import "@smrafi/tokens/tokens.css";
import "../src/styles.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: { title: "Theme", icon: "mirror", items: ["light", "dark"], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, context) => {
      document.documentElement.dataset.theme = context.globals.theme as string;
      return (
        <div
          style={{
            padding: 24,
            background: "var(--sr-bg-canvas)",
            fontFamily: "var(--sr-font-family-sans)",
          }}
        >
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" },
    controls: { expanded: true },
  },
};

export default preview;
