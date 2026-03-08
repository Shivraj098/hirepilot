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
        "rounded-2xl border border-neutral-200/70 bg-white/80 backdrop-blur-md",
        "shadow-sm transition-all duration-300",
        "hover:shadow-lg hover:border-neutral-300/80",
        className
      )}
    >
      {children}
    </div>
  );
}