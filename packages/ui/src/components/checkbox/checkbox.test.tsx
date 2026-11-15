import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./checkbox";
import { expectNoA11yViolations } from "../../test/axe";

describe("Checkbox", () => {
  it("toggles via click on the label", async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Accept terms" onChange={onChange} />);
    await userEvent.click(screen.getByText("Accept terms"));
    expect(screen.getByRole("checkbox", { name: "Accept terms" })).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("supports the indeterminate state", () => {
    render(<Checkbox label="Select all" indeterminate readOnly />);
    const box = screen.getByRole("checkbox", { name: "Select all" }) as HTMLInputElement;
    expect(box.indeterminate).toBe(true);
    expect(box).toBePartiallyChecked();
  });

  it("has no detectable a11y violations", async () => {
    const { container } = render(<Checkbox label="Subscribe" defaultChecked />);
    await expectNoA11yViolations(container);
  });
});
