import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast, type ToastOptions } from "./toast";
import { expectNoA11yViolations } from "../../test/axe";

function Trigger(props: ToastOptions) {
  const { toast } = useToast();
  return (
    <button type="button" onClick={() => toast(props)}>
      Notify
    </button>
  );
}

describe("Toast", () => {
  afterEach(() => vi.useRealTimers());

  it("announces with status for neutral and alert for danger", async () => {
    const { unmount } = render(
      <ToastProvider>
        <Trigger title="Saved" />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Notify" }));
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
    unmount();

    render(
      <ToastProvider>
        <Trigger title="Failed" tone="danger" />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Notify" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Failed");
  });

  it("auto-dismisses after the duration and pauses while hovered", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <ToastProvider duration={1000}>
        <Trigger title="Saved" />
      </ToastProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Notify" }));
    await user.hover(screen.getByRole("status"));
    act(() => void vi.advanceTimersByTime(5000));
    expect(screen.getByRole("status")).toBeInTheDocument();

    await user.unhover(screen.getByRole("status"));
    act(() => void vi.advanceTimersByTime(1100));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("caps the number of visible toasts", async () => {
    render(
      <ToastProvider limit={2}>
        <Trigger title="Hello" />
      </ToastProvider>,
    );
    const button = screen.getByRole("button", { name: "Notify" });
    await userEvent.click(button);
    await userEvent.click(button);
    await userEvent.click(button);
    expect(screen.getAllByRole("status")).toHaveLength(2);
  });

  it("can be dismissed manually and has no a11y violations", async () => {
    render(
      <ToastProvider>
        <Trigger title="Saved" description="Project updated" duration={Infinity} />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Notify" }));
    await expectNoA11yViolations(document.body);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
