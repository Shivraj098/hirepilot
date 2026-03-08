"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import clsx from "clsx";

interface ButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
}

export default function Button({
  children,
  className,
  variant = "primary",
  disabled,
  isLoading,
  ...props
}: ButtonProps) {
  const { pending } = useFormStatus();

  const loading = pending || isLoading ;

  const isDisabled = disabled || pending;

  const base =
    "relative inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-900/20 disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-neutral-900 text-white hover:bg-neutral-800",
    secondary:
      "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
    ghost:
      "bg-transparent text-neutral-700 hover:bg-neutral-100",
  };

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={clsx(base, variants[variant], className)}
      disabled={isDisabled}
      {...props}
    >
      <span
        className={clsx(
          "flex items-center justify-center gap-2 transition-opacity",
          loading && "opacity-0"
        )}
      >
        {children}
      </span>

      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
        </span>
      )}
    </motion.button>
  );
}