import type { Meta, StoryObj } from "@storybook/react";
import { Dialog } from "./dialog";
import { Button } from "../button/button";

const meta: Meta<typeof Dialog> = { title: "Components/Dialog", component: Dialog };
export default meta;
type Story = StoryObj<typeof Dialog>;

const Body = ({ role }: { role?: "dialog" | "alertdialog" }) => (
  <Dialog.Content role={role}>
    <Dialog.Title>Delete project?</Dialog.Title>
    <Dialog.Description>All issues in this project will be permanently removed.</Dialog.Description>
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
      <Dialog.Close>
        <Button variant="secondary">Cancel</Button>
      </Dialog.Close>
      <Dialog.Close>
        <Button variant="danger">Delete</Button>
      </Dialog.Close>
    </div>
  </Dialog.Content>
);

export const Default: Story = {
  render: () => (
    <Dialog>
      <Dialog.Trigger>
        <Button variant="danger">Delete project</Button>
      </Dialog.Trigger>
      <Body />
    </Dialog>
  ),
};
export const Open: Story = {
  render: () => (
    <Dialog defaultOpen>
      <Dialog.Trigger>
        <Button>Open</Button>
      </Dialog.Trigger>
      <Body role="alertdialog" />
    </Dialog>
  ),
};
