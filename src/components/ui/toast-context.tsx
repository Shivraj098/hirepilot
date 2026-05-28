"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "ai";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  description?: string;
}

interface ToastContextType {
  showToast: (
    message: string,
    type?: ToastType,
    description?: string
  ) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const MAX_TOASTS = 4;

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4 shrink-0" />,
  error: <XCircle className="w-4 h-4 shrink-0" />,
  info: <Info className="w-4 h-4 shrink-0" />,
  ai: <Sparkles className="w-4 h-4 shrink-0" />,
};

const styles: Record<ToastType, string> = {
  success: "border-[--success]/20 text-[--success]",
  error: "border-destructive/20 text-destructive",
  info: "border-[--info]/20 text-[--info]",
  ai: "border-[--ai-border] text-[--ai] ai-gradient",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", description?: string) => {
      const id = crypto.randomUUID();

      setToasts((prev) => {
        const next = [
          ...prev.slice(-(MAX_TOASTS - 1)),
          { id, message, type, description },
        ];
        return next;
      });

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "pointer-events-auto",
                "min-w-[300px] max-w-sm",
                "rounded-2xl border",
                "glass px-4 py-3",
                "shadow-lg",
                styles[toast.type]
              )}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5">{icons[toast.type]}</span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {toast.message}
                  </p>
                  {toast.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {toast.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => dismiss(toast.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}