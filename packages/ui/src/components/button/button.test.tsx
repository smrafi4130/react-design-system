import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";
import { expectNoA11yViolations } from "../../test/axe";

describe("Button", () => {
  it("defaults to type=button so it never submits a form by accident", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
  });

  it("blocks clicks while loading but stays focusable", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).not.toBeDisabled();

    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(button).toHaveFocus();
  });

  it("renders a child element with button styles when asChild is set", () => {
    render(
      <Button asChild variant="secondary">
        <a href="/settings">Settings</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Settings" });
    expect(link).toHaveClass("sr-button", "sr-button--secondary");
  });

  it("has no detectable a11y violations", async () => {
    const { container } = render(<Button variant="danger">Delete</Button>);
    await expectNoA11yViolations(container);
  });
});
