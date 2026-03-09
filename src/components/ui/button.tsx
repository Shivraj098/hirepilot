"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import clsx from "clsx";

type ButtonProps = HTMLMotionProps<"button"> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

export default function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center h-10 px-4 rounded-xl text-sm font-medium " +
    "transition-all duration-200 " +
    "focus:outline-none focus:ring-2 focus:ring-ring/40 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:brightness-110 active:scale-[0.97]",

    secondary:
      "bg-secondary text-secondary-foreground border border-border hover:bg-muted active:scale-[0.97]",

    ghost:
      "bg-transparent text-foreground hover:bg-muted/60 active:scale-[0.97]",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      className={clsx(base, variants[variant], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}