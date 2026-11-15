import type { Meta, StoryObj } from "@storybook/react";
import { Field, Input } from "./field";

const meta: Meta<typeof Field> = { title: "Components/Field", component: Field };
export default meta;
type Story = StoryObj<typeof Field>;

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Field hint required>
        <Field.Label>Email</Field.Label>
        <Field.Hint>Used for sign-in and notifications.</Field.Hint>
        <Field.Control>
          <Input type="email" placeholder="you@example.com" />
        </Field.Control>
      </Field>
    </div>
  ),
};
export const WithError: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Field error="Password must be at least 12 characters.">
        <Field.Label>Password</Field.Label>
        <Field.Control>
          <Input type="password" defaultValue="short" />
        </Field.Control>
      </Field>
    </div>
  ),
};
