import { forwardRef, useEffect, useRef, type InputHTMLAttributes, type ReactNode } from "react";
import { composeRefs } from "../../lib/compose";
import { cx } from "../../lib/cx";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  /** Mixed state, e.g. for a "select all" checkbox when some rows are selected. */
  indeterminate?: boolean;
}

/**
 * A native checkbox, visually restyled. Native input means form submission,
 * keyboard support and screen-reader semantics come for free.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, indeterminate = false, className, ...rest },
  ref,
) {
  const innerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // `indeterminate` is a DOM property only; there is no HTML attribute for it.
    if (innerRef.current) innerRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label className={cx("sr-checkbox", className)}>
      <input
        ref={composeRefs(innerRef, ref)}
        type="checkbox"
        className="sr-checkbox__input"
        aria-checked={indeterminate ? "mixed" : undefined}
        {...rest}
      />
      <span className="sr-checkbox__label">{label}</span>
    </label>
  );
});
