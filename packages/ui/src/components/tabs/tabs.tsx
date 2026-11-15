import {
  createContext,
  useContext,
  useId,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { composeEventHandlers } from "../../lib/compose";
import { cx } from "../../lib/cx";
import { useControllableState } from "../../lib/use-controllable-state";

type Orientation = "horizontal" | "vertical";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
  orientation: Orientation;
  activation: "automatic" | "manual";
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(part: string) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`<Tabs.${part}> must be used inside <Tabs>`);
  return ctx;
}

const idFor = (baseId: string, kind: "tab" | "panel", value: string) =>
  `${baseId}-${kind}-${value.replace(/\s+/g, "-")}`;

export interface TabsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  value?: string;
  defaultValue: string;
  onValueChange?: (value: string) => void;
  orientation?: Orientation;
  /**
   * "automatic": arrow keys select the tab (good when panels are cheap).
   * "manual": arrow keys only move focus; Enter/Space selects (use when
   * panels are expensive to render or fetch data).
   */
  activation?: "automatic" | "manual";
  children: ReactNode;
}

function TabsRoot({
  value: valueProp,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  activation = "automatic",
  className,
  children,
  ...rest
}: TabsProps) {
  const [value, setValue] = useControllableState({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  });
  const baseId = useId();
  return (
    <TabsContext.Provider value={{ value, setValue, baseId, orientation, activation }}>
      <div className={cx("sr-tabs", className)} data-orientation={orientation} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, onKeyDown, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const { orientation, activation, setValue } = useTabs("List");

  // Roving tabindex: only the selected tab is in the Tab order; arrows move
  // between tabs. Querying the DOM keeps registration order == visual order.
  const handleKeyDown = composeEventHandlers<KeyboardEvent<HTMLDivElement>>(onKeyDown, (event) => {
    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'),
    );
    const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (index === -1) return;

    const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
    const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
    let nextIndex: number | null = null;
    if (event.key === nextKey) nextIndex = (index + 1) % tabs.length;
    else if (event.key === prevKey) nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const next = tabs[nextIndex]!;
    next.focus();
    if (activation === "automatic" && next.dataset.value) setValue(next.dataset.value);
  });

  return (
    // The list itself is not focusable by design: the selected tab holds tabindex=0 (roving tabindex).
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    <div
      role="tablist"
      aria-orientation={orientation}
      className={cx("sr-tabs__list", className)}
      onKeyDown={handleKeyDown}
      {...rest}
    />
  );
}

export interface TabsTriggerProps extends Omit<HTMLAttributes<HTMLButtonElement>, "value"> {
  value: string;
  disabled?: boolean;
}

function TabsTrigger({ value, disabled, className, onClick, ...rest }: TabsTriggerProps) {
  const ctx = useTabs("Trigger");
  const selected = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      id={idFor(ctx.baseId, "tab", value)}
      aria-controls={idFor(ctx.baseId, "panel", value)}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      data-value={value}
      data-state={selected ? "active" : "inactive"}
      className={cx("sr-tabs__trigger", className)}
      onClick={composeEventHandlers(onClick, () => ctx.setValue(value))}
      {...rest}
    />
  );
}

export interface TabsPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

function TabsPanel({ value, className, children, ...rest }: TabsPanelProps) {
  const ctx = useTabs("Panel");
  const selected = ctx.value === value;
  return (
    <div
      role="tabpanel"
      id={idFor(ctx.baseId, "panel", value)}
      aria-labelledby={idFor(ctx.baseId, "tab", value)}
      hidden={!selected}
      tabIndex={0}
      className={cx("sr-tabs__panel", className)}
      {...rest}
    >
      {/* Inactive panels are not rendered, so their effects/queries don't run. */}
      {selected ? children : null}
    </div>
  );
}

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Panel: TabsPanel,
});
