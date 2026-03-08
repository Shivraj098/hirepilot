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
        "w-full rounded-xl border border-neutral-200/80 bg-white/80 backdrop-blur-sm px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400",
        "shadow-sm transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 focus:bg-white",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
}