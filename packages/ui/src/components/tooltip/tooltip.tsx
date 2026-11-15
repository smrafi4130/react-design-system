import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Slot } from "../../lib/slot";

export interface TooltipProps {
  content: ReactNode;
  /** Hover delay in ms. Keyboard focus shows the tooltip immediately. */
  delay?: number;
  side?: "top" | "bottom";
  children: ReactNode;
}

/**
 * Supplementary description for an interactive element (WAI-ARIA tooltip
 * pattern). Never put essential information or interactive content in a
 * tooltip: touch users can't hover.
 *
 * Positioning is CSS-only (above/below the anchor). Collision detection is a
 * deliberate non-goal; see README "Trade-offs".
 */
export function Tooltip({ content, delay = 400, side = "top", children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const show = (immediate: boolean) => {
    clearTimeout(timer.current);
    if (immediate) setOpen(true);
    else timer.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  // WCAG 1.4.13: dismissible without moving pointer or focus.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <span className="sr-tooltip-anchor">
      <Slot
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => show(false)}
        onMouseLeave={hide}
        onFocus={() => show(true)}
        onBlur={hide}
      >
        {children}
      </Slot>
      {open ? (
        <span role="tooltip" id={id} className="sr-tooltip" data-side={side}>
          {content}
        </span>
      ) : null}
    </span>
  );
}
