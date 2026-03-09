import { ReactNode } from "react";
import clsx from "clsx";

export default function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-border bg-card text-card-foreground",
        "shadow-sm",
        "transition-all duration-200",
        "hover:shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
}