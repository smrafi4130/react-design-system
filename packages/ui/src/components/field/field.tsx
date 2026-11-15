import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
} from "react";
import { Slot } from "../../lib/slot";
import { cx } from "../../lib/cx";

interface FieldContextValue {
  controlId: string;
  hintId: string;
  errorId: string;
  invalid: boolean;
  required: boolean;
  hasHint: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

function useField(component: string): FieldContextValue {
  const ctx = useContext(FieldContext);
  if (!ctx) throw new Error(`<Field.${component}> must be used inside <Field>`);
  return ctx;
}

export interface FieldProps extends HTMLAttributes<HTMLDivElement> {
  /** Error message. When set, the control is marked aria-invalid and described by it. */
  error?: ReactNode;
  required?: boolean;
  /** Set when a <Field.Hint> is rendered so the control is described by it. */
  hint?: boolean;
}

/**
 * Wires label, hint and error to a form control through generated ids, so
 * consumers can't forget `htmlFor` / `aria-describedby`.
 */
function FieldRoot({
  error,
  required = false,
  hint = false,
  className,
  children,
  ...rest
}: FieldProps) {
  const id = useId();
  const value: FieldContextValue = {
    controlId: `${id}-control`,
    hintId: `${id}-hint`,
    errorId: `${id}-error`,
    invalid: Boolean(error),
    required,
    hasHint: hint,
  };
  return (
    <FieldContext.Provider value={value}>
      <div className={cx("sr-field", className)} {...rest}>
        {children}
        {error ? (
          <p id={value.errorId} className="sr-field__error">
            {error}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}

function FieldLabel({ className, children, ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  const { controlId, required } = useField("Label");
  return (
    <label htmlFor={controlId} className={cx("sr-field__label", className)} {...rest}>
      {children}
      {required ? (
        <span className="sr-field__required" aria-hidden="true">
          {" *"}
        </span>
      ) : null}
    </label>
  );
}

function FieldHint({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  const { hintId } = useField("Hint");
  return <p id={hintId} className={cx("sr-field__hint", className)} {...rest} />;
}

/** Applies id/aria wiring to its single child control. */
function FieldControl({ children }: { children: ReactNode }) {
  const { controlId, hintId, errorId, invalid, required, hasHint } = useField("Control");
  const describedBy =
    [hasHint && hintId, invalid && errorId].filter(Boolean).join(" ") || undefined;
  return (
    <Slot
      id={controlId}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      aria-required={required || undefined}
    >
      {children}
    </Slot>
  );
}

export const Field = Object.assign(FieldRoot, {
  Label: FieldLabel,
  Hint: FieldHint,
  Control: FieldControl,
});

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...rest },
  ref,
) {
  return <input ref={ref} className={cx("sr-input", className)} {...rest} />;
});
