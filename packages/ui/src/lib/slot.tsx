import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { composeRefs } from "./compose";
import { cx } from "./cx";

type AnyProps = Record<string, unknown>;

/**
 * Renders its single child, merging Slot props onto it. Powers the `asChild`
 * pattern so behaviour (Button styles, Dialog.Trigger wiring) can be applied to
 * any element, e.g. a router <Link>, without wrapper DOM nodes.
 */
export const Slot = forwardRef<HTMLElement, HTMLAttributes<HTMLElement> & { children?: ReactNode }>(
  function Slot({ children, ...slotProps }, forwardedRef) {
    const child = Children.only(children);
    if (!isValidElement(child)) return null;

    const childProps = child.props as AnyProps;
    const merged: AnyProps = { ...slotProps, ...childProps };

    for (const key of Object.keys(slotProps)) {
      const slotValue = (slotProps as AnyProps)[key];
      const childValue = childProps[key];
      if (
        /^on[A-Z]/.test(key) &&
        typeof slotValue === "function" &&
        typeof childValue === "function"
      ) {
        merged[key] = (...args: unknown[]) => {
          (childValue as (...a: unknown[]) => void)(...args);
          (slotValue as (...a: unknown[]) => void)(...args);
        };
      } else if (key === "className") {
        merged.className = cx(slotValue as string, childValue as string);
      } else if (key === "style") {
        merged.style = { ...(slotValue as object), ...(childValue as object) };
      }
    }

    const childRef = (child as unknown as { ref?: React.Ref<HTMLElement> }).ref;
    merged.ref = composeRefs(forwardedRef, childRef);
    return cloneElement(child, merged);
  },
);
