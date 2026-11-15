import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cx } from "../../lib/cx";

export type ToastTone = "neutral" | "success" | "danger";

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Milliseconds before auto-dismiss. `Infinity` keeps it until dismissed. */
  duration?: number;
}

interface ToastRecord extends Required<Omit<ToastOptions, "description">> {
  id: number;
  description?: string;
}

interface ToastApi {
  toast: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export interface ToastProviderProps {
  children: ReactNode;
  /** Default auto-dismiss delay. WCAG 2.2.1: users must be able to pause; we pause on hover/focus. */
  duration?: number;
  /** Cap visible toasts so a burst of errors can't cover the UI. */
  limit?: number;
}

let nextId = 1;

export function ToastProvider({ children, duration = 5000, limit = 3 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, tone = "neutral", duration: d = duration }: ToastOptions) => {
      const id = nextId++;
      setToasts((current) =>
        [...current, { id, title, description, tone, duration: d }].slice(-limit),
      );
      return id;
    },
    [duration, limit],
  );

  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <section className="sr-toast-viewport" aria-label="Notifications">
            <ol>
              {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
              ))}
            </ol>
          </section>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastRecord; onDismiss: () => void }) {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(toast.duration);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (paused || !Number.isFinite(remaining.current)) return;
    const startedAt = Date.now();
    const timer = setTimeout(() => onDismissRef.current(), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - startedAt;
    };
  }, [paused]);

  return (
    // The live-region role sits on an inner element: putting role=status on the
    // <li> itself would strip its listitem semantics (caught by axe).
    <li
      className={cx("sr-toast", `sr-toast--${toast.tone}`)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        // Errors interrupt (alert); everything else waits politely (status).
        role={toast.tone === "danger" ? "alert" : "status"}
        aria-atomic="true"
        className="sr-toast__body"
      >
        <p className="sr-toast__title">{toast.title}</p>
        {toast.description ? <p className="sr-toast__description">{toast.description}</p> : null}
      </div>
      <button
        type="button"
        className="sr-toast__close"
        aria-label="Dismiss notification"
        onClick={onDismiss}
      >
        ×
      </button>
    </li>
  );
}
