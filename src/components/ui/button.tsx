"use client";

import { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "ai";
type Size = "sm" | "md" | "lg";

type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  children?: React.ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
};

const variants: Record<Variant, string> = {
  primary: [
    "bg-primary text-primary-foreground",
    "hover:opacity-90",
    "shadow-sm",
  ].join(" "),

  secondary: [
    "bg-secondary text-secondary-foreground",
    "border border-border",
    "hover:bg-muted",
  ].join(" "),

  ghost: [
    "text-muted-foreground",
    "hover:bg-muted hover:text-foreground",
  ].join(" "),

  danger: [
    "bg-destructive/10 text-destructive",
    "border border-destructive/20",
    "hover:bg-destructive/15",
  ].join(" "),

  ai: [
    "ai-gradient border border-[--ai-border]",
    "text-[--ai] font-medium",
    "hover:border-[--ai]/50",
  ].join(" "),
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  md: "h-9 px-4 text-sm rounded-xl gap-2",
  lg: "h-11 px-6 text-sm rounded-xl gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      loadingText,
      icon,
      iconRight,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: isDisabled ? 1 : 0.97 }}
        className={cn(
          "relative inline-flex items-center justify-center font-medium",
          "transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:opacity-50 disabled:pointer-events-none",
          "select-none",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            <span>{loadingText ?? "Loading..."}</span>
          </>
        ) : (
          <>
            {icon && (
              <span className="shrink-0">{icon}</span>
            )}
            {children}
            {iconRight && (
              <span className="shrink-0">{iconRight}</span>
            )}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export default Button;