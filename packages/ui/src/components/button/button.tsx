import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Slot } from "../../lib/slot";
import { cx } from "../../lib/cx";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner, sets aria-busy and blocks interaction without losing focus. */
  loading?: boolean;
  /** Render the child element (e.g. a router Link) with button styling. */
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    asChild = false,
    className,
    disabled,
    type,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  const classes = cx("sr-button", `sr-button--${variant}`, `sr-button--${size}`, className);

  if (asChild) {
    return (
      <Slot ref={ref} className={classes} data-variant={variant} {...rest}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      // Default to "button": a submit inside a form should always be explicit.
      type={type ?? "button"}
      className={classes}
      data-variant={variant}
      // aria-disabled (not `disabled`) while loading keeps the button focusable,
      // so keyboard and screen-reader users don't lose their place.
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={(event) => {
        if (loading) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...rest}
    >
      {loading && <span className="sr-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
});
