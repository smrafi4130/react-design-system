import { useCallback, useRef, useState } from "react";

/**
 * State that can be controlled (`value` + `onChange`) or uncontrolled
 * (`defaultValue`). Every stateful primitive uses it, so the
 * controlled/uncontrolled contract stays the same across the library.
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}): [T, (next: T) => void] {
  const [internal, setInternal] = useState(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      if (!Object.is(next, current)) onChangeRef.current?.(next);
    },
    [isControlled, current],
  );

  return [current, setValue];
}
