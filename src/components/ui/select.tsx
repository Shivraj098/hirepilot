import { SelectHTMLAttributes } from "react";
import clsx from "clsx";

export default function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        "w-full h-10 rounded-xl border border-input bg-background",
        "px-3 text-sm text-foreground",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring",
        className
      )}
      {...props}
    />
  );
}