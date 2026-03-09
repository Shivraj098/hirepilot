import { TextareaHTMLAttributes } from "react";
import clsx from "clsx";

export default function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        "w-full rounded-xl border border-input bg-background",
        "px-4 py-2.5 text-sm text-foreground",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring",
        className
      )}
      {...props}
    />
  );
}