import type { Meta, StoryObj } from "@storybook/react";
import { ToastProvider, useToast } from "./toast";
import { Button } from "../button/button";

const meta: Meta = { title: "Components/Toast" };
export default meta;

function Demo() {
  const { toast } = useToast();
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <Button onClick={() => toast({ title: "Project saved", tone: "success" })}>Success</Button>
      <Button
        variant="danger"
        onClick={() =>
          toast({
            title: "Could not save",
            description: "Network error. Try again.",
            tone: "danger",
          })
        }
      >
        Error
      </Button>
    </div>
  );
}

export const Default: StoryObj = {
  render: () => (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  ),
};
