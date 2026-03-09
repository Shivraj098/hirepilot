import { InputHTMLAttributes } from "react";
import clsx from "clsx";

export default function Input({
  className,
  disabled,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      disabled={disabled}
      className={clsx(
        "w-full h-10 rounded-xl border",
        "border-input bg-background text-foreground",
        "px-4 text-sm",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
}