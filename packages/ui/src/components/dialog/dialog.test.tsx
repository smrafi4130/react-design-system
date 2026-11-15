import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog } from "./dialog";
import { Button } from "../button/button";
import { expectNoA11yViolations } from "../../test/axe";

function Example(props: { role?: "dialog" | "alertdialog"; onOpenChange?: (o: boolean) => void }) {
  return (
    <Dialog onOpenChange={props.onOpenChange}>
      <Dialog.Trigger>
        <Button>Delete project</Button>
      </Dialog.Trigger>
      <Dialog.Content role={props.role}>
        <Dialog.Title>Delete project?</Dialog.Title>
        <Dialog.Description>This cannot be undone.</Dialog.Description>
        <Dialog.Close>
          <Button variant="secondary">Cancel</Button>
        </Dialog.Close>
        <Button variant="danger">Delete</Button>
      </Dialog.Content>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("opens with an accessible name/description and moves focus inside", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Delete project" }));

    const dialog = screen.getByRole("dialog", { name: "Delete project?" });
    expect(dialog).toHaveAccessibleDescription("This cannot be undone.");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it("traps focus with Tab and Shift+Tab", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Delete project" }));

    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Delete" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Delete" })).toHaveFocus();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole("button", { name: "Delete project" });
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(trigger).toHaveFocus();
  });

  it("closes on overlay click for dialog but not for alertdialog", async () => {
    const { unmount } = render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Delete project" }));
    await userEvent.click(screen.getByTestId("dialog-overlay"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    unmount();

    render(<Example role="alertdialog" />);
    await userEvent.click(screen.getByRole("button", { name: "Delete project" }));
    await userEvent.click(screen.getByTestId("dialog-overlay"));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  it("locks body scroll while open", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Delete project" }));
    expect(document.body.style.overflow).toBe("hidden");
    await userEvent.keyboard("{Escape}");
    expect(document.body.style.overflow).toBe("");
  });

  it("has no detectable a11y violations when open", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("button", { name: "Delete project" }));
    await expectNoA11yViolations(document.body);
  });
});
