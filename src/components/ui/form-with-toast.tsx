"use client";

import { useToast } from "@/components/ui/toast-context";
import { useTransition, ReactNode } from "react";

interface Props {
  action: (formData: FormData) => Promise<void>;
  successMessage: string;
  children: ReactNode;
}

export default function FormWithToast({
  action,
  successMessage,
  children,
}: Props) {
  const { showToast } = useToast();
  const [, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          try {
            await action(formData);
            showToast(successMessage, "success");
          } catch {
            showToast("Something went wrong", "error");
          }
        });
      }}
    >
      {children}   
    </form>
  );
}