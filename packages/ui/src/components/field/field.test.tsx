import { render, screen } from "@testing-library/react";
import { Field, Input } from "./field";
import { expectNoA11yViolations } from "../../test/axe";

describe("Field", () => {
  it("associates label, hint and error with the control", () => {
    render(
      <Field required hint error="Email is required">
        <Field.Label>Email</Field.Label>
        <Field.Hint>We never share it.</Field.Hint>
        <Field.Control>
          <Input type="email" />
        </Field.Control>
      </Field>,
    );

    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAccessibleDescription("We never share it. Email is required");
  });

  it("is not marked invalid without an error", () => {
    render(
      <Field>
        <Field.Label>Name</Field.Label>
        <Field.Control>
          <Input />
        </Field.Control>
      </Field>,
    );
    expect(screen.getByRole("textbox", { name: "Name" })).not.toHaveAttribute("aria-invalid");
  });

  it("throws a helpful error when parts are used outside Field", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Field.Label>x</Field.Label>)).toThrow(/inside <Field>/);
  });

  it("has no detectable a11y violations", async () => {
    const { container } = render(
      <Field error="Too short">
        <Field.Label>Password</Field.Label>
        <Field.Control>
          <Input type="password" />
        </Field.Control>
      </Field>,
    );
    await expectNoA11yViolations(container);
  });
});
