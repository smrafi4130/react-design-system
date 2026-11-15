import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Slot } from "./slot";

describe("Slot", () => {
  it("merges className, style and handlers onto the child and forwards refs", async () => {
    const slotClick = vi.fn();
    const childClick = vi.fn();
    const ref = createRef<HTMLElement>();

    render(
      <Slot className="a" style={{ color: "red" }} onClick={slotClick} ref={ref}>
        <a href="#x" className="b" style={{ margin: 0 }} onClick={childClick}>
          link
        </a>
      </Slot>,
    );

    const link = screen.getByRole("link", { name: "link" });
    expect(link).toHaveClass("a", "b");
    expect(link).toHaveStyle({ color: "rgb(255, 0, 0)", margin: "0px" });
    expect(ref.current).toBe(link);

    await userEvent.click(link);
    expect(childClick).toHaveBeenCalledTimes(1);
    expect(slotClick).toHaveBeenCalledTimes(1);
  });
});
