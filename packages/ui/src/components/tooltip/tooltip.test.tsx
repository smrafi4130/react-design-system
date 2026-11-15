import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip } from "./tooltip";
import { Button } from "../button/button";

describe("Tooltip", () => {
  it("shows immediately on focus and describes the trigger", async () => {
    render(
      <Tooltip content="Copies the link to your clipboard">
        <Button>Share</Button>
      </Tooltip>,
    );
    await userEvent.tab();
    const button = screen.getByRole("button", { name: "Share" });
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    expect(button).toHaveAccessibleDescription("Copies the link to your clipboard");
  });

  it("waits for the delay on hover", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Help" delay={300}>
        <Button>Info</Button>
      </Tooltip>,
    );
    await user.hover(screen.getByRole("button", { name: "Info" }));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(350));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Help");
    vi.useRealTimers();
  });

  it("dismisses on Escape without moving focus", async () => {
    render(
      <Tooltip content="Help">
        <Button>Info</Button>
      </Tooltip>,
    );
    await userEvent.tab();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Info" })).toHaveFocus();
  });
});
