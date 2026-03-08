"use client";

import { ReactNode } from "react";
import { useToast } from "@/components/ui/toast-context";

interface Props {
  action: () => Promise<void>;
  successMessage: string;
  children: ReactNode;
}

export default function ResumeActionWrapper({
  action,
  successMessage,
  children,
}: Props) {
  const { showToast } = useToast();

  return (
    <form
      action={async () => {
        try {
          await action();
          showToast(successMessage, "success");
        } catch (error) {
          showToast("Something went wrong", error instanceof Error ? "error" : "info");
        }
      }}
    >
      {children}
    </form>
  );
}