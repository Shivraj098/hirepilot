"use client";

import { useToast } from "@/components/ui/toast-context";
import { useTransition, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormWithToastProps {
  action: (formData: FormData) => Promise<void>;
  successMessage: string;
  errorMessage?: string;
  children: ReactNode;
  className?: string;
}

export default function FormWithToast({
  action,
  successMessage,
  errorMessage = "Something went wrong",
  children,
  className,
}: FormWithToastProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className={cn(className)}
      data-pending={isPending}
      action={(formData) => {
        startTransition(async () => {
          try {
            await action(formData);
            showToast(successMessage, "success");
          } catch (err) {
            const message =
              err instanceof Error ? err.message : errorMessage;
            showToast(message, "error");
          }
        });
      }}
    >
      {children}
    </form>
  );
}