import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "./tabs";
import { expectNoA11yViolations } from "../../test/axe";

function Example({ activation }: { activation?: "automatic" | "manual" }) {
  return (
    <Tabs defaultValue="overview" activation={activation}>
      <Tabs.List aria-label="Project">
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="issues">Issues</Tabs.Trigger>
        <Tabs.Trigger value="archived" disabled>
          Archived
        </Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="overview">Overview content</Tabs.Panel>
      <Tabs.Panel value="issues">Issues content</Tabs.Panel>
      <Tabs.Panel value="archived">Archived content</Tabs.Panel>
      <Tabs.Panel value="settings">Settings content</Tabs.Panel>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("links tabs to panels and shows only the selected panel", () => {
    render(<Example />);
    const tab = screen.getByRole("tab", { name: "Overview" });
    expect(tab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Overview" })).toHaveTextContent(
      "Overview content",
    );
    expect(screen.queryByText("Issues content")).not.toBeInTheDocument();
  });

  it("uses a roving tabindex", () => {
    render(<Example />);
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: "Issues" })).toHaveAttribute("tabindex", "-1");
  });

  it("selects with arrow keys, skips disabled tabs, and wraps around (automatic)", async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole("tab", { name: "Overview" }));
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Issues" })).toHaveFocus();
    expect(screen.getByText("Issues content")).toBeInTheDocument();

    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Settings" })).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();

    await userEvent.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Settings" })).toHaveFocus();
  });

  it("only moves focus in manual mode until Enter is pressed", async () => {
    render(<Example activation="manual" />);
    await userEvent.click(screen.getByRole("tab", { name: "Overview" }));
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Issues" })).toHaveFocus();
    expect(screen.getByText("Overview content")).toBeInTheDocument();

    await userEvent.keyboard("{Enter}");
    expect(screen.getByText("Issues content")).toBeInTheDocument();
  });

  it("has no detectable a11y violations", async () => {
    const { container } = render(<Example />);
    await expectNoA11yViolations(container);
  });
});
