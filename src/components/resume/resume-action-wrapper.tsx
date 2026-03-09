"use client";

import { ReactNode } from "react";
import { useToast } from "@/components/ui/toast-context";
import clsx from "clsx";

interface Props {
  action: () => Promise<void>;
  successMessage: string;
  children: ReactNode;
  className?: string;
}

export default function ResumeActionWrapper({
  action,
  successMessage,
  children,
  className,
}: Props) {
  const { showToast } = useToast();

  return (
    <form
      className={clsx("space-y-4", className)}
      action={async () => {
        try {
          await action();
          showToast(successMessage, "success");
        } catch (error) {
          showToast(
            "Something went wrong",
            error instanceof Error ? "error" : "info"
          );
        }
      }}
    >
      {children}
    </form>
  );
}