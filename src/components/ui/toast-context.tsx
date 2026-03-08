"use client";
import {motion , AnimatePresence} from "framer-motion";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = crypto.randomUUID();

    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed top-6 right-6 z-50 space-y-3">
        <AnimatePresence>
  {toasts.map((toast) => (
    <motion.div
      key={toast.id}
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`min-w-[280px] max-w-sm rounded-2xl border bg-white/95 text-neutral-900 shadow-xl px-4 py-3 text-sm backdrop-blur-md
        ${
          toast.type === "success"
            ? "border-l-4 border-l-emerald-500"
            : toast.type === "error"
            ? "border-l-4 border-l-red-500"
            : "border-l-4 border-l-neutral-400"
        }`}
    >
      {toast.message}
    </motion.div>
  ))}
</AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}