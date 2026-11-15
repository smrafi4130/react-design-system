/** Minimal className joiner; avoids a runtime dependency for a one-liner. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
