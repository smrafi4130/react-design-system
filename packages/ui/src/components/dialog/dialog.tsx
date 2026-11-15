import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Slot } from "../../lib/slot";
import { composeEventHandlers, composeRefs } from "../../lib/compose";
import { cx } from "../../lib/cx";
import { getFocusable } from "../../lib/focus";
import { useControllableState } from "../../lib/use-controllable-state";

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
  descriptionId: string;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialog(part: string) {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error(`<Dialog.${part}> must be used inside <Dialog>`);
  return ctx;
}

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

function DialogRoot({ open: openProp, defaultOpen = false, onOpenChange, children }: DialogProps) {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const id = useId();
  const triggerRef = useRef<HTMLElement | null>(null);
  return (
    <DialogContext.Provider
      value={{ open, setOpen, titleId: `${id}-title`, descriptionId: `${id}-desc`, triggerRef }}
    >
      {children}
    </DialogContext.Provider>
  );
}

const DialogTrigger = forwardRef<HTMLElement, { children: ReactNode }>(function DialogTrigger(
  { children },
  ref,
) {
  const { open, setOpen, triggerRef } = useDialog("Trigger");
  return (
    <Slot
      ref={composeRefs(ref, triggerRef)}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={() => setOpen(true)}
    >
      {children}
    </Slot>
  );
});

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  /** Use "alertdialog" for destructive confirmations; it disables close-on-overlay-click. */
  role?: "dialog" | "alertdialog";
  /** Element to focus on open. Defaults to the first focusable element. */
  initialFocusRef?: React.RefObject<HTMLElement>;
  onEscapeKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
}

let openDialogs = 0;

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(
  { role = "dialog", initialFocusRef, onEscapeKeyDown, onKeyDown, className, children, ...rest },
  ref,
) {
  const { open, setOpen, titleId, descriptionId, triggerRef } = useDialog("Content");
  const contentRef = useRef<HTMLDivElement>(null);

  // Focus management: move focus in on open, restore it to the trigger on close.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = (document.activeElement as HTMLElement | null) ?? triggerRef.current;
    const content = contentRef.current;
    const target = initialFocusRef?.current ?? (content && getFocusable(content)[0]) ?? content;
    target?.focus();
    const trigger = triggerRef.current;
    return () => {
      (trigger ?? previouslyFocused)?.focus();
    };
  }, [open, initialFocusRef, triggerRef]);

  // Scroll lock, reference-counted so nested dialogs don't unlock early.
  useEffect(() => {
    if (!open) return;
    openDialogs += 1;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      openDialogs -= 1;
      if (openDialogs === 0) document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const handleKeyDown = composeEventHandlers<KeyboardEvent<HTMLDivElement>>(onKeyDown, (event) => {
    if (event.key === "Escape") {
      onEscapeKeyDown?.(event);
      if (!event.defaultPrevented) {
        event.stopPropagation();
        setOpen(false);
      }
      return;
    }
    if (event.key !== "Tab" || !contentRef.current) return;
    // Focus trap: wrap Tab / Shift+Tab inside the dialog.
    const focusable = getFocusable(contentRef.current);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  return createPortal(
    // Overlay click is a pointer-only convenience; the keyboard equivalent is Escape.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="sr-dialog__overlay"
      data-testid="dialog-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && role === "dialog") setOpen(false);
      }}
    >
      <div
        ref={composeRefs(ref, contentRef)}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={cx("sr-dialog", className)}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
});

function DialogTitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  const { titleId } = useDialog("Title");
  // Content is supplied by the consumer via children (spread in `rest`).
  // eslint-disable-next-line jsx-a11y/heading-has-content
  return <h2 id={titleId} className={cx("sr-dialog__title", className)} {...rest} />;
}

function DialogDescription({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  const { descriptionId } = useDialog("Description");
  return <p id={descriptionId} className={cx("sr-dialog__description", className)} {...rest} />;
}

function DialogClose({ children }: { children: ReactNode }) {
  const { setOpen } = useDialog("Close");
  return <Slot onClick={() => setOpen(false)}>{children}</Slot>;
}

export const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
});
