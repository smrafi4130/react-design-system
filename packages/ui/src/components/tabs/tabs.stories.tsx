import type { Meta, StoryObj } from "@storybook/react";
import { Tabs } from "./tabs";

const meta: Meta<typeof Tabs> = { title: "Components/Tabs", component: Tabs };
export default meta;
type Story = StoryObj<typeof Tabs>;

const Example = (props: Partial<React.ComponentProps<typeof Tabs>>) => (
  <Tabs defaultValue="overview" {...props}>
    <Tabs.List aria-label="Project sections">
      <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
      <Tabs.Trigger value="issues">Issues</Tabs.Trigger>
      <Tabs.Trigger value="archived" disabled>
        Archived
      </Tabs.Trigger>
      <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Panel value="overview">Project summary and recent activity.</Tabs.Panel>
    <Tabs.Panel value="issues">Open issues for this project.</Tabs.Panel>
    <Tabs.Panel value="archived">Archived items.</Tabs.Panel>
    <Tabs.Panel value="settings">Project settings.</Tabs.Panel>
  </Tabs>
);

export const Horizontal: Story = { render: () => <Example /> };
export const Vertical: Story = { render: () => <Example orientation="vertical" /> };
export const ManualActivation: Story = { render: () => <Example activation="manual" /> };
