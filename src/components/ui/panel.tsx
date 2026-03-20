import { ReactNode } from "react";
import clsx from "clsx";

export default function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-border/60",
        "bg-card text-card-foreground",
        "shadow-sm",
        "transition-all duration-200",
        "hover:shadow-md",
        "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}