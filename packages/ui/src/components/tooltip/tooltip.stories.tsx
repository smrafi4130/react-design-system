import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "./tooltip";
import { Button } from "../button/button";

const meta: Meta<typeof Tooltip> = { title: "Components/Tooltip", component: Tooltip };
export default meta;

export const Default: StoryObj<typeof Tooltip> = {
  render: () => (
    <div style={{ paddingTop: 48 }}>
      <Tooltip content="Copies a share link to your clipboard">
        <Button variant="secondary">Share</Button>
      </Tooltip>
    </div>
  ),
};
