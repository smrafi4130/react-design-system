import type { Ref, RefCallback, SyntheticEvent } from "react";

type PossibleRef<T> = Ref<T> | undefined;

export function setRef<T>(ref: PossibleRef<T>, value: T | null): void {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as { current: T | null }).current = value;
}

/** Merge several refs (callback or object) into one callback ref. */
export function composeRefs<T>(...refs: PossibleRef<T>[]): RefCallback<T> {
  return (node) => refs.forEach((ref) => setRef(ref, node));
}

/**
 * Run the consumer's handler first; run ours only if they did not call
 * `event.preventDefault()`. This is how consumers opt out of built-in
 * behaviour (e.g. preventing a Dialog from closing on Escape).
 */
export function composeEventHandlers<E extends SyntheticEvent | Event>(
  theirs: ((event: E) => void) | undefined,
  ours: (event: E) => void,
): (event: E) => void {
  return (event) => {
    theirs?.(event);
    if (!event.defaultPrevented) ours(event);
  };
}
