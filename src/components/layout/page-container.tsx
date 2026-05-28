import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-6 py-6 max-w-7xl mx-auto w-full",
        className
      )}
    >
      {children}
    </div>
  );
}