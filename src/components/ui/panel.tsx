import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "ai" | "ghost";
  padding?: "sm" | "md" | "lg" | "none";
}

const variants = {
  default: "bg-card border border-border",
  ai: "ai-gradient border border-[--ai-border]",
  ghost: "bg-transparent border border-dashed border-border",
};

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export default function Panel({
  children,
  className,
  variant = "default",
  padding = "md",
}: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        variants[variant],
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}