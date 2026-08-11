import { useEffect, useState } from "react";

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
}

type Listener = (toasts: ToastItem[]) => void;

// Minimal global toast store so `useToast()` works anywhere without prop drilling,
// mirroring the ergonomics of the production toast hook.
let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();
let nextId = 1;

function emit() {
  for (const listener of listeners) listener(toasts);
}

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function toast(options: ToastOptions) {
  const id = nextId++;
  const item: ToastItem = { id, duration: 4000, ...options };
  toasts = [...toasts, item];
  emit();
  if (item.duration && item.duration > 0) {
    setTimeout(() => dismiss(id), item.duration);
  }
  return { id, dismiss: () => dismiss(id) };
}

export function useToast() {
  return { toast, dismiss };
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>(toasts);

  useEffect(() => {
    const listener: Listener = (next) => setItems([...next]);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-full max-w-sm flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={
            "pointer-events-auto rounded-lg border p-4 shadow-lg " +
            (item.variant === "destructive"
              ? "border-red-300 bg-red-600 text-white"
              : "border-slate-200 bg-white text-slate-900")
          }
        >
          {item.title && <p className="font-semibold">{item.title}</p>}
          {item.description && (
            <p
              className={
                "text-sm " +
                (item.variant === "destructive" ? "text-red-50" : "text-slate-600")
              }
            >
              {item.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
