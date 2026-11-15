import { act, renderHook } from "@testing-library/react";
import { useControllableState } from "./use-controllable-state";

describe("useControllableState", () => {
  it("manages its own state when uncontrolled", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 1, onChange }));
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("defers to the parent when controlled", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({ value: 1, defaultValue: 0, onChange }),
    );
    act(() => result.current[1](5));
    expect(result.current[0]).toBe(1);
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("does not report a change when the value is unchanged", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: "a", onChange }));
    act(() => result.current[1]("a"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
